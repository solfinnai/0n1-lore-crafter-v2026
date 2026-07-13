-- Phase 2 souls schema (JSONB, auth.uid RLS, tombstones)
-- Apply to a NEW Supabase project only — do not revive the burned old project.

CREATE TABLE IF NOT EXISTS public.souls (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nft_id TEXT NOT NULL,
  local_id TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, nft_id)
);

CREATE INDEX IF NOT EXISTS souls_user_updated_idx ON public.souls (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS souls_user_deleted_idx ON public.souls (user_id, deleted_at);

ALTER TABLE public.souls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS souls_owner_all ON public.souls;
CREATE POLICY souls_owner_all ON public.souls
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Wallet proofs (not logins) — populated after SIWE-lite verify route
CREATE TABLE IF NOT EXISTS public.linked_wallets (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, address),
  UNIQUE (address)
);

ALTER TABLE public.linked_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS linked_wallets_owner_all ON public.linked_wallets;
CREATE POLICY linked_wallets_owner_all ON public.linked_wallets
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- One-time SIWE nonces (Postgres, not in-memory)
CREATE TABLE IF NOT EXISTS public.wallet_link_nonces (
  address TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
