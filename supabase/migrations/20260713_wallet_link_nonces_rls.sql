-- Phase 2 follow-up: RLS + per-user ownership for wallet_link_nonces.
-- 20260712_phase2_souls_jsonb.sql created the table with no RLS policy; nonces
-- must be scoped to the signed-in user so the wallet-link challenge/verify
-- routes can run on the anon key + the caller's JWT (RLS-enforced), never the
-- service role. Address stays the PK: one pending challenge per wallet.

-- Nonces are ephemeral (10-minute TTL); clear any pre-RLS rows so the
-- NOT NULL owner column can be added safely.
DELETE FROM public.wallet_link_nonces;

ALTER TABLE public.wallet_link_nonces
  ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS wallet_link_nonces_user_idx ON public.wallet_link_nonces (user_id);

ALTER TABLE public.wallet_link_nonces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wallet_link_nonces_owner_select ON public.wallet_link_nonces;
CREATE POLICY wallet_link_nonces_owner_select ON public.wallet_link_nonces
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS wallet_link_nonces_owner_insert ON public.wallet_link_nonces;
CREATE POLICY wallet_link_nonces_owner_insert ON public.wallet_link_nonces
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE (own rows only) is required because the challenge route upserts:
-- re-requesting a challenge replaces the caller's own pending nonce for the
-- same address (INSERT ... ON CONFLICT (address) DO UPDATE).
DROP POLICY IF EXISTS wallet_link_nonces_owner_update ON public.wallet_link_nonces;
CREATE POLICY wallet_link_nonces_owner_update ON public.wallet_link_nonces
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS wallet_link_nonces_owner_delete ON public.wallet_link_nonces;
CREATE POLICY wallet_link_nonces_owner_delete ON public.wallet_link_nonces
  FOR DELETE
  USING (user_id = auth.uid());

-- Any authenticated user may clear EXPIRED nonces. Without this, an abandoned
-- expired nonce from another account is invisible under RLS and would block
-- that address's challenge upsert forever (or force a service-role dependency
-- on the deployment). Live nonces remain owner-only.
DROP POLICY IF EXISTS wallet_link_nonces_delete_expired ON public.wallet_link_nonces;
CREATE POLICY wallet_link_nonces_delete_expired ON public.wallet_link_nonces
  FOR DELETE
  TO authenticated
  USING (expires_at < NOW());
