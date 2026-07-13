// Dev-mode gate (all that remains of the old custom SIWE-lite auth stack).
//
// Phase 2 deleted the JWT/session code that lived here (challenges, jose JWTs,
// the in-memory session store, the hardcoded dev-secret fallback) along with
// the auth middleware, the app/api/auth/* routes and the client auth hook.
// Identity now comes from Supabase Auth
// (lib/supabase-server.ts); wallet-link proofs live in app/api/wallet-link/*.
//
// isDevMode() stays: it gates demo-wallet blanket ownership in
// app/api/verify-ownership and app/api/opensea/owned, and is structurally
// impossible to enable in production (NODE_ENV must be 'development') —
// that's intentional, don't "fix" it. See lib/dev-mode.ts.

export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.AUTH_DEV_MODE === 'true'
}
