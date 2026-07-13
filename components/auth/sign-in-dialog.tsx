"use client"

/**
 * Sign-in UI (Phase 2): email OTP + Ethereum wallet (Supabase Auth only).
 * Renders nothing when Supabase env is unset — the app stays fully usable
 * logged-out (handoff §7.1).
 */

import { useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Loader2, LogOut, Mail, UserCircle, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { authHeaders } from "@/lib/auth-headers"
import { shortenAddress } from "@/lib/wallet"
import {
  describeWalletError,
  discoverWalletProvider,
  requestAccounts,
  withWalletTimeout,
} from "@/lib/wallet-request"
import { useSupabaseSession } from "@/components/auth/session-provider"
import { useWallet } from "@/components/wallet/wallet-provider"

/** Best-effort human label for a Supabase user (email or linked wallet). */
function describeUser(user: User): string {
  if (user.email) return user.email
  const identityAddress = user.identities?.find((i) => i.provider === "web3")
    ?.identity_data?.address as string | undefined
  const metaAddress =
    (user.user_metadata?.address as string | undefined) ||
    (user.user_metadata?.custom_claims?.address as string | undefined)
  const address = identityAddress || metaAddress
  if (address) return shortenAddress(address)
  return "Signed in"
}

// The last email that successfully signed in on this browser. Used to prefill
// the field so a linked-wallet user (who must detour through email — Supabase
// has no web3->email identity linking yet, supabase/auth#2238) signs in with
// one tap instead of retyping. Best-effort: private mode / quota just means no
// prefill. Only ever the device owner's own address — same exposure as the
// field's autoComplete="email".
const LAST_EMAIL_KEY = "0n1.lastEmail"

function rememberEmail(email: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LAST_EMAIL_KEY, email)
  } catch {
    /* best-effort */
  }
}

function recallEmail(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(LAST_EMAIL_KEY) ?? ""
  } catch {
    return ""
  }
}

/**
 * Where a wallet lands if it signs in, per the server preflight. Fail-open to
 * "unlinked" on any error: sign-in then behaves exactly as before the
 * preflight existed, and duplicates are non-destructive (park/restore).
 */
async function preflightWalletStatus(address: string): Promise<"wallet_account" | "email_account" | "unlinked"> {
  try {
    const res = await fetch("/api/wallet-login/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return "unlinked"
    const body = await res.json()
    return body?.status === "email_account" || body?.status === "wallet_account"
      ? body.status
      : "unlinked"
  } catch {
    return "unlinked"
  }
}

export function SignInButton() {
  const { user, isEnabled, signOut } = useSupabaseSession()
  const { adoptAddress } = useWallet()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"methods" | "code">("methods")
  const [email, setEmail] = useState(recallEmail)
  const [code, setCode] = useState("")
  const [emailBusy, setEmailBusy] = useState(false)
  const [walletBusy, setWalletBusy] = useState(false)
  const [signOutBusy, setSignOutBusy] = useState(false)
  const [linkBusy, setLinkBusy] = useState(false)
  const [addEmailValue, setAddEmailValue] = useState("")
  const [addEmailBusy, setAddEmailBusy] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  // Bumped whenever the dialog resets so a wallet promise that settles late
  // (after a timeout or dismissal) can't close a reopened dialog or toast.
  const walletAttemptRef = useRef(0)

  // No Supabase project configured: accounts don't exist, hide entirely.
  if (!isEnabled) return null

  const busy = emailBusy || walletBusy

  const resetFlow = () => {
    walletAttemptRef.current += 1
    setView("methods")
    setCode("")
    setEmailBusy(false)
    setWalletBusy(false)
    setLinkBusy(false)
  }

  const closeDialog = () => {
    setOpen(false)
    resetFlow()
  }

  const handleSendCode = async () => {
    if (!supabase || !email.trim()) return
    setEmailBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      })
      if (error) throw error
      setView("code")
    } catch (e) {
      toast.error("Couldn't send the sign-in email", {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setEmailBusy(false)
    }
  }

  const handleVerifyCode = async (token: string) => {
    if (!supabase || token.length !== 6) return
    setEmailBusy(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "email",
      })
      if (error) throw error
      rememberEmail(email.trim()) // prefill next time (esp. the wallet detour)
      closeDialog()
      toast.success("Signed in")
    } catch (e) {
      setCode("")
      toast.error("That code didn't work", {
        description:
          e instanceof Error ? e.message : "Check the code or tap the link in your email.",
      })
    } finally {
      setEmailBusy(false)
    }
  }

  const handleWalletSignIn = async () => {
    if (!supabase) return
    // EIP-6963 discovery: with several wallet extensions installed, bare
    // window.ethereum may belong to one that never shows UI — prefer MetaMask.
    const provider = discoverWalletProvider()
    if (!provider) {
      toast.error("No Ethereum wallet found", {
        description: "Install MetaMask (or another wallet) to sign in with a wallet.",
      })
      return
    }
    const attempt = ++walletAttemptRef.current
    setWalletBusy(true)
    try {
      // Request account access ourselves first: it carries the deadline, and
      // auth-js's internal eth_requestAccounts (which would otherwise swallow
      // the real error) then resolves instantly from the granted permission.
      const accounts = await requestAccounts(provider)
      const address = accounts?.[0]
      if (!address) throw new Error("No wallet account selected")

      // Preflight BEFORE any signature: a wallet that's linked to an email
      // account can't be reached by wallet login (no web3 linkIdentity yet) —
      // signing in would mint a duplicate empty account. Detour instead.
      const status = await preflightWalletStatus(address)
      if (attempt !== walletAttemptRef.current) return
      if (status === "email_account") {
        adoptAddress(address) // connected for browsing; just not the login key
        // Active hand-off to the email step instead of a dead-end toast. The
        // email field is already mounted (methods view), so prefill the known
        // address and focus it — one tap on "Continue with email" sends the
        // code. We deliberately DON'T auto-send: an unsolicited email on a
        // wallet click is a surprise-send / inbox-spam vector.
        const known = recallEmail()
        if (known && !email.trim()) setEmail(known)
        setView("methods")
        // Delay past the toast/Radix focus-restore so the focus actually lands.
        setTimeout(() => emailInputRef.current?.focus(), 120)
        toast.info("This wallet signs in through your email", {
          description: known
            ? "Your email's filled in below — tap “Continue with email” to get your code. The wallet stays linked as proof of ownership."
            : "Enter this account's email below to get your sign-in code. Your souls live there; the wallet stays linked as proof of ownership.",
          duration: 8000,
        })
        return
      }

      const { error } = await withWalletTimeout(
        supabase.auth.signInWithWeb3({
          chain: "ethereum",
          statement: "Sign in to 0N1 Lore Crafter",
          // auth-js's EthereumWallet type demands an `address` field the
          // runtime never reads; injected EIP-1193 providers don't carry one.
          wallet: provider as never,
        }),
        "The wallet signature request",
      )
      if (error) throw error
      if (attempt !== walletAttemptRef.current) return

      // The header connect state adopts the just-authorized wallet — one
      // MetaMask prompt covers both signing in and browsing your NFTs.
      adoptAddress(address)

      // Session-as-proof self-link: make this wallet-born account discoverable
      // by future preflights. Advisory — never fail the sign-in over it.
      fetch("/api/wallet-link/self", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        signal: AbortSignal.timeout(15_000),
      }).catch((e) => console.warn("wallet self-link skipped:", e))

      closeDialog()
      toast.success("Signed in with wallet")
    } catch (e) {
      if (attempt !== walletAttemptRef.current) return
      toast.error("Wallet sign-in failed", { description: describeWalletError(e) })
    } finally {
      if (attempt === walletAttemptRef.current) setWalletBusy(false)
    }
  }

  /**
   * Link the active browser wallet to the signed-in account (handoff §6.2:
   * wallets are proofs, not logins). Challenge → personal_sign the EXACT
   * server-built message → verify. The server stores the row in linked_wallets.
   */
  const handleLinkWallet = async () => {
    const provider = discoverWalletProvider()
    if (!provider) {
      toast.error("No Ethereum wallet found", {
        description: "Install MetaMask (or another wallet) to link a wallet.",
      })
      return
    }
    setLinkBusy(true)
    try {
      const accounts = await requestAccounts(provider)
      const address = accounts?.[0]
      if (!address) throw new Error("No wallet account selected")

      const headers = { "Content-Type": "application/json", ...(await authHeaders()) }

      const challengeRes = await fetch("/api/wallet-link/challenge", {
        method: "POST",
        headers,
        body: JSON.stringify({ address }),
        signal: AbortSignal.timeout(15_000),
      })
      const challenge = await challengeRes.json().catch(() => ({}))
      if (!challengeRes.ok) {
        // Challenge slots are per (address, user) — another account's pending
        // challenge can't conflict here; only verify has a 409 (already linked).
        toast.error("Couldn't start wallet link", {
          description: challenge.message || challenge.error || undefined,
        })
        return
      }

      // Sign the EXACT message string the server built — verify reconstructs
      // it server-side and recovers the signer from this signature.
      let signature: string
      try {
        signature = await withWalletTimeout(
          provider.request({
            method: "personal_sign",
            params: [challenge.message, address],
          }),
          "The wallet signature request",
        )
      } catch (signError: any) {
        const rejected =
          signError?.code === 4001 ||
          /rejected|denied/i.test(signError?.message ?? "")
        toast.error(rejected ? "Signature request rejected" : "Couldn't sign the link message", {
          description: rejected
            ? "You declined the signature in your wallet — nothing was linked."
            : describeWalletError(signError),
        })
        return
      }

      const verifyRes = await fetch("/api/wallet-link/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ address: challenge.address, signature }),
        signal: AbortSignal.timeout(15_000),
      })
      const verify = await verifyRes.json().catch(() => ({}))
      if (!verifyRes.ok) {
        if (verifyRes.status === 409) {
          toast.error("Wallet already linked to another account", {
            description: verify.message || "Unlink it there first, or sign in to that account.",
          })
        } else {
          toast.error("Wallet link failed", {
            description: verify.message || verify.error || undefined,
          })
        }
        return
      }

      // The wallet just authorized this site — surface it in the header too.
      adoptAddress(address)
      toast.success(`Wallet ${shortenAddress(verify.address || challenge.address)} linked`, {
        description: "This wallet is now proof of ownership for your account.",
      })
    } catch (e) {
      toast.error("Wallet link failed", {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setLinkBusy(false)
    }
  }

  /**
   * Add an email to a WALLET-born account (no email identity yet). This is the
   * only supported identity mutation for the wallet->email direction
   * (updateUser; supabase/auth#2238 tracks the reverse). It closes the fresh-
   * device dead-end: a wallet-only account can't sign in on a browser without
   * the extension, but once an email is confirmed they get email OTP too.
   * mailer_autoconfirm is off on this project, so the email stays PENDING until
   * the user taps the confirmation link.
   */
  const handleAddEmail = async () => {
    if (!supabase || !addEmailValue.trim()) return
    setAddEmailBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: addEmailValue.trim() })
      if (error) throw error
      rememberEmail(addEmailValue.trim())
      toast.success("Check your email to confirm", {
        description: `We sent a confirmation link to ${addEmailValue.trim()}. Until you tap it, you'll keep signing in with your wallet.`,
        duration: 8000,
      })
      setAddEmailValue("")
    } catch (e) {
      toast.error("Couldn't add that email", {
        description:
          e instanceof Error ? e.message : "That address may already belong to another account.",
      })
    } finally {
      setAddEmailBusy(false)
    }
  }

  const handleSignOut = async () => {
    setSignOutBusy(true)
    try {
      await signOut()
      closeDialog()
    } finally {
      setSignOutBusy(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 px-2 border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
        title={user ? `Account: ${describeUser(user)}` : "Sign in or create an account to sync your souls"}
      >
        <UserCircle className="h-4 w-4" />
        <span className="hidden sm:inline sm:ml-2 max-w-[10rem] truncate">
          {user ? describeUser(user) : "Sign in"}
        </span>
      </Button>

      {/* Always allow dismissal — even mid-request. closeDialog() is idempotent
          and the in-flight handlers' finally blocks safely reset busy state, so
          a hung wallet/OTP call can never trap the user in the dialog. */}
      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeDialog())}>
        <DialogContent className="border-purple-500/30 bg-black/95 backdrop-blur-md w-[calc(100vw-2rem)] rounded-lg sm:max-w-md">
          {user ? (
            <>
              <DialogHeader>
                <DialogTitle>Account</DialogTitle>
                <DialogDescription>
                  Signed in as <span className="text-purple-200">{describeUser(user)}</span>.
                  Your souls sync to this account on every change.
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="outline"
                onClick={handleLinkWallet}
                disabled={linkBusy}
                className="border-purple-500/30 hover:bg-purple-900/20"
              >
                {linkBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Link wallet
              </Button>
              <p className="text-xs text-purple-300/60">
                Prove you own a wallet to attach it to this account. Linking never signs you out.
              </p>
              {!user.email && (
                <div className="space-y-2 rounded-md border border-purple-500/20 p-3">
                  <p className="text-xs text-purple-300/80">
                    Add an email so you can sign in on a device that doesn&apos;t have your wallet
                    extension. We&apos;ll send a link to confirm it.
                  </p>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={addEmailValue}
                    onChange={(e) => setAddEmailValue(e.target.value)}
                    disabled={addEmailBusy}
                    className="border-purple-500/30 bg-black/50"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddEmail}
                    disabled={addEmailBusy || !addEmailValue.trim()}
                    className="w-full border-purple-500/30 hover:bg-purple-900/20"
                  >
                    {addEmailBusy ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Add email for recovery
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={signOutBusy}
                className="border-purple-500/30 hover:bg-purple-900/20"
              >
                {signOutBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Sign out
              </Button>
              <p className="text-xs text-purple-300/60">
                Signing out keeps everything saved in this browser — nothing is deleted.
              </p>
            </>
          ) : view === "code" ? (
            <>
              <DialogHeader>
                <DialogTitle>Check your email</DialogTitle>
                <DialogDescription>
                  We sent a message to <span className="text-purple-200">{email.trim()}</span>.
                  Enter the 6-digit code below, or just tap the link in the email — either works.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => {
                    setCode(value)
                    if (value.length === 6) handleVerifyCode(value)
                  }}
                  disabled={emailBusy}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setView("methods")
                    setCode("")
                  }}
                  disabled={emailBusy}
                  className="text-purple-300"
                >
                  Use a different email
                </Button>
                {emailBusy && <Loader2 className="h-4 w-4 animate-spin text-purple-300" />}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Sign in or create an account</DialogTitle>
                <DialogDescription>
                  New here? Just enter your email — we&apos;ll create your account automatically,
                  no password needed. Signing in syncs your souls across devices; everything also
                  stays saved in this browser, signed in or not.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendCode()
                }}
                className="space-y-2"
              >
                <Input
                  ref={emailInputRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  className="border-purple-500/30 bg-black/50"
                />
                <Button
                  type="submit"
                  disabled={busy || !email.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {emailBusy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Continue with email
                </Button>
              </form>
              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-purple-500/20" />
                <span className="text-xs text-purple-300/60">or</span>
                <Separator className="flex-1 bg-purple-500/20" />
              </div>
              <Button
                variant="outline"
                onClick={handleWalletSignIn}
                disabled={busy}
                className="w-full border-purple-500/30 hover:bg-purple-900/20"
              >
                {walletBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Sign in with wallet
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
