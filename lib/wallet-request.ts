// Hardened browser-wallet plumbing shared by every MetaMask entry point
// (header Connect Wallet, dialog "Sign in with wallet", Link wallet).
//
// Two failure modes motivated this module, both observed as an endless
// spinner (no /token?grant_type=web3 request ever reached Supabase):
//  1. window.ethereum requests (eth_requestAccounts / personal_sign) can stay
//     pending FOREVER — locked wallet, popup opened behind the browser window,
//     or a request already queued from another flow. Nothing rejects, so a
//     bare `await` never returns and `finally` never runs.
//  2. With several wallet extensions installed, bare window.ethereum may
//     belong to a wallet that never shows UI. EIP-6963 discovery lets us
//     prefer MetaMask explicitly instead of whoever won the injection race.

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<any>
}

interface Eip6963ProviderDetail {
  info?: { name?: string; rdns?: string }
  provider: Eip1193Provider
}

/** Rejection used when a wallet request outlives its deadline. The underlying
 * request may still be pending inside the extension — tell the user to open it. */
export class WalletTimeoutError extends Error {
  constructor(what: string) {
    super(
      `${what} timed out. Open your wallet extension (click its toolbar icon) — a request may be waiting there — then try again.`,
    )
    this.name = "WalletTimeoutError"
  }
}

/**
 * Pick the browser wallet to talk to. EIP-6963 announcements are dispatched
 * synchronously in response to the request event, so this needs no await.
 * Prefers MetaMask when several wallets are installed; falls back to the
 * legacy window.ethereum. Returns null when no wallet is available.
 */
export function discoverWalletProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null
  const announced: Eip6963ProviderDetail[] = []
  const onAnnounce = (event: Event) => {
    const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail
    if (detail?.provider) announced.push(detail)
  }
  window.addEventListener("eip6963:announceProvider", onAnnounce)
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"))
  } finally {
    window.removeEventListener("eip6963:announceProvider", onAnnounce)
  }
  const metamask = announced.find(
    (d) => d.info?.rdns === "io.metamask" || /metamask/i.test(d.info?.name ?? ""),
  )
  if (metamask) return metamask.provider
  if (announced.length > 0) return announced[0].provider
  return (window.ethereum as Eip1193Provider | undefined) ?? null
}

/** Race a wallet promise against a deadline so UI busy-state can always reset. */
export async function withWalletTimeout<T>(
  promise: Promise<T>,
  what: string,
  timeoutMs = 90_000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new WalletTimeoutError(what)), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Request account access with a deadline and honest error messages.
 * auth-js's own eth_requestAccounts swallows the real error, so callers should
 * run this FIRST — once access is granted, downstream requests resolve instantly.
 */
export async function requestAccounts(
  provider: Eip1193Provider,
  timeoutMs = 90_000,
): Promise<string[]> {
  return withWalletTimeout(
    provider.request({ method: "eth_requestAccounts" }) as Promise<string[]>,
    "The wallet connection request",
    timeoutMs,
  )
}

/** Human-readable message for wallet RPC failures (EIP-1193 codes + timeout). */
export function describeWalletError(err: unknown): string {
  if (err instanceof WalletTimeoutError) return err.message
  const code = (err as { code?: number } | null)?.code
  if (code === 4001) return "You declined the request in your wallet."
  if (code === -32002)
    return "Your wallet is already showing a pending request. Open the wallet extension, finish or dismiss it, then try again."
  if (err instanceof Error && err.message) return err.message
  return "Unknown wallet error"
}
