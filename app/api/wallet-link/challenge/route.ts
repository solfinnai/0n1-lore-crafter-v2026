// POST /api/wallet-link/challenge — start linking a wallet to the signed-in
// Supabase account (handoff §6.2: wallets are proofs, not logins).
//
// Requires a Supabase session (Authorization: Bearer <jwt>). Generates a
// one-time nonce, stores it in wallet_link_nonces THROUGH THE USER-SCOPED
// CLIENT (RLS: user_id = auth.uid()), and returns the exact message the wallet
// must sign. /api/wallet-link/verify reconstructs the same message server-side.

import { NextRequest, NextResponse } from 'next/server'
import { getAddress } from 'ethers'
import { getRequestUser, isSupabaseConfigured } from '@/lib/supabase-server'
import { buildWalletLinkMessage, WALLET_LINK_CHALLENGE_TTL_MS } from '@/lib/wallet-link'

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
        message: 'Linking a wallet requires a valid Supabase session (Authorization: Bearer <token>).',
      },
      { status: 401 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let address: string
  try {
    address = getAddress(String(body?.address ?? ''))
  } catch {
    return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 })
  }

  const nonce = crypto.randomUUID()
  const expiresAtIso = new Date(Date.now() + WALLET_LINK_CHALLENGE_TTL_MS).toISOString()

  // Challenge slots are per (address, user): another account requesting a
  // challenge for the same address can never block this one (squatting DoS).
  // True ownership is decided at verify time against linked_wallets
  // UNIQUE(address) — the nonce table needs no global address uniqueness.
  const { error } = await auth.client
    .from('wallet_link_nonces')
    .upsert(
      { address, user_id: auth.user.id, nonce, expires_at: expiresAtIso },
      { onConflict: 'address,user_id' }
    )

  if (error) {
    console.error('wallet-link challenge upsert failed', error)
    return NextResponse.json(
      { error: 'Could not create link challenge' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    address,
    nonce,
    expiresAt: expiresAtIso,
    message: buildWalletLinkMessage(address, nonce, expiresAtIso),
  })
}
