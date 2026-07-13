-- Per-user challenge slots (security review finding): with address alone as
-- the PK, any authenticated user could insert a live nonce for ANY address —
-- the row is owner-only under RLS, so the wallet's real owner was blocked for
-- 10 minutes, renewable forever (challenge-squatting DoS). Ownership is proven
-- at verify time against linked_wallets UNIQUE(address); the nonce table needs
-- no global address uniqueness.

DELETE FROM public.wallet_link_nonces; -- ephemeral rows (10-minute TTL)

ALTER TABLE public.wallet_link_nonces DROP CONSTRAINT wallet_link_nonces_pkey;
ALTER TABLE public.wallet_link_nonces ADD PRIMARY KEY (address, user_id);

-- The cross-user expired-cleanup policy existed only because a single global
-- slot could be blocked by an abandoned nonce; with per-user slots that
-- cannot happen, so remove the unnecessary cross-user surface.
DROP POLICY IF EXISTS wallet_link_nonces_delete_expired ON public.wallet_link_nonces;
