// POST /api/wallet-link/verify — complete linking a wallet to the signed-in
// Supabase account (handoff §6.2).
//
// Requires a Supabase session. Loads the caller's own nonce row (RLS),
// RECONSTRUCTS the challenge message server-side (a client-supplied message is
// never trusted), recovers the signer with ethers.verifyMessage, and on match
// inserts into linked_wallets through the user-scoped client (RLS enforces
// user_id = auth.uid()). unique(address) → 409 when the wallet is already
// linked to a different account. EIP-1271 smart-contract wallets are not
// supported (same policy as lib/canon-submission.ts): ecrecover cannot verify
// them offline, so they fail with a clear 400.

import { NextRequest, NextResponse } from 'next/server'
import { getAddress, verifyMessage } from 'ethers'
import { getRequestUser, isSupabaseConfigured } from '@/lib/supabase-server'
import { buildWalletLinkMessage } from '@/lib/wallet-link'

const EIP1271_HINT =
  'Smart-contract wallets (EIP-1271, e.g. Safe) are not supported — their signatures cannot be verified offline. Please link a regular (EOA) wallet.'

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

  const signature = body?.signature
  if (typeof signature !== 'string' || signature.trim() === '') {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Load the caller's own nonce row — RLS hides other users' rows, so a nonce
  // issued to a different account simply looks like "no pending challenge".
  const { data: nonceRow, error: nonceError } = await auth.client
    .from('wallet_link_nonces')
    .select('nonce, expires_at')
    .eq('address', address)
    .maybeSingle()

  if (nonceError || !nonceRow) {
    return NextResponse.json(
      {
        error: 'No pending link challenge for this wallet',
        message: 'Request a new challenge via /api/wallet-link/challenge and sign that message.',
      },
      { status: 400 }
    )
  }

  const expiresAtIso = new Date(nonceRow.expires_at).toISOString()
  if (Date.now() > new Date(expiresAtIso).getTime()) {
    await auth.client.from('wallet_link_nonces').delete().eq('address', address)
    return NextResponse.json(
      { error: 'Link challenge expired', message: 'Request a new challenge and sign it within 10 minutes.' },
      { status: 400 }
    )
  }

  // Reconstruct the exact message server-side from the stored nonce row.
  const message = buildWalletLinkMessage(address, nonceRow.nonce, expiresAtIso)

  let recovered: string
  try {
    recovered = getAddress(verifyMessage(message, signature))
  } catch {
    return NextResponse.json(
      { error: 'Invalid signature', message: `The signature could not be verified. ${EIP1271_HINT}` },
      { status: 400 }
    )
  }

  if (recovered !== address) {
    return NextResponse.json(
      {
        error: 'Signature does not match wallet',
        message: `The message was signed by ${recovered}, not the wallet being linked. ${EIP1271_HINT}`,
      },
      { status: 400 }
    )
  }

  // Idempotent re-link: RLS means we can only see our own linked_wallets rows,
  // so a hit here is this user's existing link for this address.
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
      // unique(address) fires across ALL users regardless of RLS visibility.
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            error: 'wallet already linked to another account',
            message:
              'This wallet is already linked to a different account. Unlink it there first, or sign in to that account.',
          },
          { status: 409 }
        )
      }
      console.error('wallet-link verify: linked_wallets insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to link wallet' }, { status: 500 })
    }
  }

  // One-time nonce: consume it.
  await auth.client.from('wallet_link_nonces').delete().eq('address', address)

  return NextResponse.json({ linked: true, address })
}
