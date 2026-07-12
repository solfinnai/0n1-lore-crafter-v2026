// Demo mode helpers - lets the app be tested end-to-end without MetaMask or an NFT.
// Client gate: NEXT_PUBLIC_DEV_MODE=true (shows the "Demo Mode" connect button).
// Server gate: NODE_ENV=development && AUTH_DEV_MODE=true (see lib/auth.ts isDevMode()).

// A syntactically valid Ethereum address reserved for demo sessions.
export const DEMO_WALLET_ADDRESS = "0x1111111111111111111111111111111111111111"

// Token IDs surfaced in the demo wallet. These are real 0N1 Force token IDs, so
// trait/metadata fetches against OpenSea still work (with mock-data fallback).
export const DEMO_TOKEN_IDS = ["922", "1631", "6603", "7627"]

export function isDemoWallet(address: string | null | undefined): boolean {
  return !!address && address.toLowerCase() === DEMO_WALLET_ADDRESS.toLowerCase()
}

// Client-side check (inlined at build time by Next.js)
export function isClientDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === "true"
}

// Sample mode - the PRODUCTION-safe subset of demo mode. Unlocks ONLY the demo
// wallet with ONLY the pinned sample token (see lib/sample-token.ts), so
// visitors without a wallet can try the whole app. Unlike isDevMode() it is
// deliberately NOT tied to NODE_ENV; unlike dev mode it grants no blanket
// ownership and loosens nothing else. Works on both server and client
// (NEXT_PUBLIC_ vars are inlined client-side and readable server-side).
export function isSampleModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SAMPLE_MODE === "true"
}
