"use client"

/**
 * Supabase session provider (Phase 2).
 *
 * - Subscribes to supabase.auth (getSession on mount + onAuthStateChange).
 * - On sign-in: hands the user id to the hybrid storage layer and runs the
 *   initial pull/merge. First login (empty remote) auto-uploads local souls
 *   (sample token / demo-wallet artifacts excluded by the storage layer)
 *   and shows a toast — no blocking prompts (handoff §6.6).
 * - On sign-out: PARKS the signed-out user's souls/chats under their namespace
 *   (never deleted — chats/memories have no cloud copy) so a shared browser
 *   can't leak them to the next person; they return on their next sign-in and
 *   storage degrades to local-only. A different user signing in likewise parks
 *   the prior owner's data before merging (owner-tracking in lib/storage-hybrid).
 * - Mirrors the connected wallet address into the storage layer so the
 *   demo/sample wallet can never sync (handoff §7.4).
 *
 * Everything is a no-op when the Supabase client is null (env unset).
 */

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
  clearAuthenticatedContentOnSignOut,
  mergeFromRemote,
  setCurrentUserId,
  setCurrentWalletAddress,
} from "@/lib/storage-wrapper"
import { useWallet } from "@/components/wallet/wallet-provider"

interface SupabaseSessionContextType {
  user: User | null
  /** True until the initial getSession() has resolved. */
  isLoading: boolean
  /** False when Supabase env vars are unset — auth UI should hide itself. */
  isEnabled: boolean
  signOut: () => Promise<void>
}

const SupabaseSessionContext = createContext<SupabaseSessionContextType>({
  user: null,
  isLoading: true,
  isEnabled: false,
  signOut: async () => {},
})

export const useSupabaseSession = () => useContext(SupabaseSessionContext)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address } = useWallet()
  // Set to a user id only after that user's initial merge SUCCEEDS, so repeat
  // events (TOKEN_REFRESHED, re-emitted SIGNED_IN) don't re-run a good merge —
  // but a FAILED merge leaves this null so the next event retries it.
  const mergedForUserRef = useRef<string | null>(null)
  // Prevents two concurrent initial merges for the same user (the success
  // latch above can't, since it isn't set until the first one resolves).
  const mergeInFlightRef = useRef<string | null>(null)

  // Keep the storage layer's wallet gate in sync with the connected wallet
  // (the demo/sample wallet disables cloud sync inside storage-hybrid).
  useEffect(() => {
    setCurrentWalletAddress(address)
  }, [address])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const handleUser = (nextUser: User | null, event?: string) => {
      setUser(nextUser)

      if (!nextUser) {
        // Deliberate sign-out (this tab or another) parks the previous
        // authenticated user's souls/chats so the next person on this shared
        // browser can't see or upload them. A passive no-session (cold load,
        // expired token) is conservative — keep local content for the returning
        // user; the storage layer isolates a DIFFERENT account when it signs in.
        if (event === "SIGNED_OUT") {
          clearAuthenticatedContentOnSignOut()
        } else {
          setCurrentUserId(null)
        }
        mergedForUserRef.current = null
        mergeInFlightRef.current = null
        return
      }
      // reconcileContentOwner (inside setCurrentUserId) parks any DIFFERENT
      // authenticated user's residual content (and restores this user's own
      // parked content) before the merge below runs.
      setCurrentUserId(nextUser.id)
      // Skip only if this user already merged successfully or is merging now —
      // a prior FAILED merge left both refs clear, so this retries it.
      if (mergedForUserRef.current === nextUser.id) return
      if (mergeInFlightRef.current === nextUser.id) return
      mergeInFlightRef.current = nextUser.id

      mergeFromRemote()
        .then((summary) => {
          // Latch as done only on a fully successful merge; on failure leave it
          // null so the next auth event (or a manual sync) tries again.
          if (summary.ok) mergedForUserRef.current = nextUser.id

          if (summary.firstLogin && summary.uploaded > 0) {
            toast.success(
              `Synced ${summary.uploaded} soul${summary.uploaded === 1 ? "" : "s"} to your account`,
            )
          }
          // Never claim success for souls that only got QUEUED — a failed
          // upload keeps them dirty and they retry on the next flush.
          if (summary.queued > summary.uploaded) {
            const pending = summary.queued - summary.uploaded
            toast.error(
              `${pending} soul${pending === 1 ? "" : "s"} couldn't sync yet — they're safe in this browser and will retry`,
            )
          }
        })
        .catch((e) => {
          console.error("Initial soul sync failed", e)
        })
        .finally(() => {
          if (mergeInFlightRef.current === nextUser.id) mergeInFlightRef.current = null
        })
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        handleUser(data.session?.user ?? null)
      })
      .finally(() => setIsLoading(false))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      handleUser(session?.user ?? null, event)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Sign out failed", { description: error.message })
      return
    }
    // onAuthStateChange also fires SIGNED_OUT, but park eagerly for snappy UI.
    // This parks the signed-out user's souls/chats out of the live keys so the
    // next person can't see or upload them (idempotent with the event-driven
    // park above; everything returns on their next sign-in).
    setUser(null)
    clearAuthenticatedContentOnSignOut()
    mergedForUserRef.current = null
    mergeInFlightRef.current = null
    toast.success("Signed out", {
      description: "Your souls are safe in your account and return when you sign back in.",
    })
  }

  return (
    <SupabaseSessionContext.Provider
      value={{ user, isLoading, isEnabled: supabase !== null, signOut }}
    >
      {children}
    </SupabaseSessionContext.Provider>
  )
}
