// Wallet-link challenge message (Phase 2 — handoff §6.2).
//
// Wallets are PROOFS, not logins: a signed one-time challenge populates
// linked_wallets for the already-signed-in Supabase user. This module owns the
// exact challenge text; both /api/wallet-link/challenge and /verify build it
// from the same inputs, and verify RECONSTRUCTS it from the stored nonce row —
// a client-supplied message is never trusted.
//
// Determinism contract: the message is fully derived from (address, nonce,
// expires_at). Issued-at is expires_at minus the fixed TTL, so nothing beyond
// the nonce row needs to be stored to rebuild the message server-side.

export const WALLET_LINK_CHALLENGE_TTL_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Build the exact message the wallet signs.
 * `address` must already be EIP-55 normalized via ethers.getAddress;
 * `expiresAtIso` must be a canonical `Date.prototype.toISOString()` string
 * (re-normalize DB values with `new Date(value).toISOString()`).
 */
export function buildWalletLinkMessage(address: string, nonce: string, expiresAtIso: string): string {
  const issuedAtIso = new Date(new Date(expiresAtIso).getTime() - WALLET_LINK_CHALLENGE_TTL_MS).toISOString()
  return `Sign this message to link your wallet to your 0N1 Lore Crafter account:

Wallet: ${address}
Nonce: ${nonce}
Issued At: ${issuedAtIso}
Expires: ${expiresAtIso}

This signature proves you control this wallet. It does not authorize any
transaction and does not grant login access.
Only sign this on the official 0N1 Lore Crafter website.`
}
