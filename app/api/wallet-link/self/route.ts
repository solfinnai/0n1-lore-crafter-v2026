// POST /api/wallet-link/self — session-as-proof self-linking (phase 2c).
//
// A wallet-born Supabase user's verified JWT already carries the
// web3:ethereum identity, so the session itself IS the ownership proof: no
// challenge, no extra signature. Inserts the linked_wallets row for the
// caller's own web3 identity through the user-scoped client (RLS enforces
// user_id = auth.uid()). Called right after a successful signInWithWeb3 so
// wallet-born accounts become discoverable by the sign-in preflight.
//
// Email-born users have no web3 identity and get a 400 — they link wallets via
// the signed-challenge flow (/api/wallet-link/challenge + /verify) instead.

import { NextRequest, NextResponse } from 'next/server'
import { getAddress } from 'ethers'
import { getRequestUser, isSupabaseConfigured } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Accounts are not configured on this deployment' },
      { status: 503 }
    )
  }

  const auth = await getRequestUser(request)
  if (!auth) {
    return NextResponse.json(
      {
        error: 'Sign in required',
        message: 'Self-linking requires a valid Supabase session (Authorization: Bearer <token>).',
      },
      { status: 401 }
    )
  }

  const rawAddress = auth.user.identities?.find((i) => i.provider === 'web3')?.identity_data
    ?.address as string | undefined

  let address: string
  try {
    address = getAddress(String(rawAddress ?? ''))
  } catch {
    return NextResponse.json(
      {
        error: 'No wallet identity on this account',
        message: 'Only accounts created by wallet sign-in can self-link; use the challenge flow instead.',
      },
      { status: 400 }
    )
  }

  // Idempotent: RLS shows only our own rows, so a hit is this user's link.
  const { data: existing } = await auth.client
    .from('linked_wallets')
    .select('address')
    .eq('address', address)
    .maybeSingle()

  if (!existing) {
    const { error: insertError } = await auth.client
      .from('linked_wallets')
      .insert({ user_id: auth.user.id, address })

    if (insertError) {
      // unique(address): the wallet is linked to a DIFFERENT account. The
      // preflight should have routed this sign-in away; tolerate the race
      // without failing the sign-in — the caller treats this as advisory.
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'wallet already linked to another account' },
          { status: 409 }
        )
      }
      console.error('wallet-link self: linked_wallets insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to self-link wallet' }, { status: 500 })
    }
  }

  return NextResponse.json({ linked: true, address })
}
