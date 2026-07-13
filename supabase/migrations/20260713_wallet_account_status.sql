-- Wallet sign-in preflight (unified identity, phase 2c).
--
-- Answers ONE question before the client calls signInWithWeb3: if this wallet
-- signs in, where does it land?
--   'wallet_account' -> the linked account HAS a web3 identity for this
--                       address, so signInWithWeb3 logs into that same user.
--                       Safe to proceed.
--   'email_account'  -> the wallet is linked (as an ownership proof) to an
--                       account signInWithWeb3 CANNOT reach — proceeding would
--                       mint a duplicate user. The client must detour to email
--                       sign-in instead. (GoTrue has no web3 linkIdentity yet:
--                       supabase/auth#2238. Replace this detour when it ships.)
--   'unlinked'       -> no claim on this wallet; proceed (a wallet-born
--                       account is created/reached and then self-linked via
--                       /api/wallet-link/self).
--
-- SECURITY DEFINER because linked_wallets is owner-RLS'd and auth.identities
-- is not readable by API roles; the function therefore returns ONLY the bare
-- enum — never a user id, email, or row — so anon-role callers (including
-- direct PostgREST calls that bypass the rate-limited route) learn nothing but
-- this tri-state, which the sign-in UX reveals anyway.
CREATE OR REPLACE FUNCTION public.wallet_account_status(wallet_addr text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN EXISTS (
          SELECT 1 FROM auth.identities i
          WHERE i.user_id = lw.user_id
            AND i.provider = 'web3'
            AND lower(i.identity_data->>'address') = lower(wallet_addr)
        ) THEN 'wallet_account'
        ELSE 'email_account'
      END
      FROM public.linked_wallets lw
      WHERE lower(lw.address) = lower(wallet_addr)
      LIMIT 1
    ),
    'unlinked'
  );
$$;

REVOKE ALL ON FUNCTION public.wallet_account_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_account_status(text) TO anon, authenticated;
