// POST /api/wallet-login/preflight — where would this wallet land if it signed
// in? Called by the sign-in dialog BEFORE any signature request, so the
// email-linked case detours to email sign-in without prompting the wallet at
// all (unified identity, phase 2c; see the wallet_account_status migration).
//
// Anonymous by design (the caller is signed out). Returns ONLY the tri-state
// enum. Rate-limited per IP; the underlying RPC is enum-only, so even direct
// PostgREST calls that skip this route learn nothing more.

import { NextRequest, NextResponse } from 'next/server'
import { getAddress } from 'ethers'
import { createAnonClient, isSupabaseConfigured } from '@/lib/supabase-server'
import { checkOwnershipRateLimit, createRateLimitResponse } from '@/lib/rate-limit'

export type WalletAccountStatus = 'wallet_account' | 'email_account' | 'unlinked'

const STATUSES: readonly WalletAccountStatus[] = ['wallet_account', 'email_account', 'unlinked']

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Accounts are not configured on this deployment' },
      { status: 503 }
    )
  }

  const rate = checkOwnershipRateLimit(request)
  if (!rate.allowed) {
    return NextResponse.json(createRateLimitResponse(rate.remaining, rate.resetTime, 'wallet'), {
      status: 429,
    })
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

  const client = createAnonClient()
  if (!client) {
    return NextResponse.json({ error: 'Accounts are not configured' }, { status: 503 })
  }

  const { data, error } = await client.rpc('wallet_account_status', { wallet_addr: address })

  if (error || !STATUSES.includes(data as WalletAccountStatus)) {
    // Fail OPEN to 'unlinked': wallet sign-in keeps working exactly as before
    // this route existed (worst case a duplicate account — now non-destructive
    // thanks to park/restore) instead of being bricked by a missing RPC.
    console.error('wallet-login preflight: wallet_account_status failed', error)
    return NextResponse.json({ status: 'unlinked', degraded: true })
  }

  return NextResponse.json({ status: data })
}
