import { NextRequest, NextResponse } from 'next/server'
import { getDailyUsage, resolveUsageKey } from '@/lib/rate-limit'
import { getRequestUser } from '@/lib/supabase-server'

// Usage-meter poll. Identity resolution (Phase 2):
// 1. Valid Supabase session (Authorization: Bearer <jwt>) → the user's id is
//    the daily-usage bucket key (same key the AI routes charge).
// 2. Logged out with a wallet → the client-supplied wallet (?address= /
//    body.walletAddress) selects the bucket. Usage counters are not sensitive
//    and this keeps logged-out behavior identical; nothing here grants access.
// 3. Logged out with no wallet → a trusted-IP bucket (`ip:<addr>`), the SAME
//    key the AI routes charge anonymous callers under, so the meter reflects
//    anonymous spend instead of erroring.
export async function POST(request: NextRequest) {
  try {
    const auth = await getRequestUser(request)

    let wallet: string | null = null

    const url = new URL(request.url)
    const param = url.searchParams.get('address') || url.searchParams.get('walletAddress')
    if (param) wallet = param.toLowerCase()

    if (!auth && !wallet) {
      try {
        const body = await request.json()
        if (typeof body?.walletAddress === 'string' && body.walletAddress) {
          wallet = body.walletAddress.toLowerCase()
        }
      } catch {
        // no/invalid body — fall back to the trusted-IP bucket below
      }
    }

    const usageKey = resolveUsageKey(request, auth?.user.id, wallet)

    // Pure read — must NEVER increment (usage meter polls this every 5 minutes)
    const usage = getDailyUsage(usageKey)

    const headers = new Headers()
    headers.set('X-Daily-Remaining-AI-Messages', usage.remaining.aiMessages.toString())
    headers.set('X-Daily-Remaining-Summaries', usage.remaining.summaries.toString())
    headers.set('X-Daily-Remaining-Tokens', usage.remaining.totalTokens.toString())
    headers.set('X-Daily-Reset', new Date(usage.resetTime).toISOString())
    headers.set('X-Authenticated', (!!auth).toString())

    return new NextResponse(JSON.stringify({
      success: true,
      walletAddress: usageKey,
      authenticated: !!auth,
      usage: usage.remaining
    }), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}
