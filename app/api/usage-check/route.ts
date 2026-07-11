import { NextRequest, NextResponse } from 'next/server'
import { checkDailyUsage } from '@/lib/rate-limit'
import { withOptionalAuth, getRequestWalletAddress } from '@/lib/auth-middleware'

export const POST = withOptionalAuth(async (request: NextRequest, sessionInfo) => {
  try {
    // Try to get wallet address from authentication first, then fallback to body parameter
    let walletAddress = await getRequestWalletAddress(request, sessionInfo)
    
    // If not authenticated, try to get from request body (legacy mode)
    if (!walletAddress) {
      const body = await request.json()
      walletAddress = body.walletAddress
    }
    
    if (!walletAddress) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please authenticate with your wallet or provide a valid walletAddress in request body',
        authenticationUrl: '/api/auth/challenge'
      }, { status: 400 })
    }

    console.log(`🔐 Usage check - Authentication status: ${sessionInfo.isAuthenticated ? 'AUTHENTICATED' : 'LEGACY_MODE'}`)
    console.log(`📊 Checking usage for wallet: ${walletAddress}`)

    // Check current usage without incrementing
    const usage = await checkDailyUsage(walletAddress, "ai_messages", 0) // Check without incrementing

    // Set headers with current usage
    const headers = new Headers()
    headers.set('X-Daily-Remaining-AI-Messages', usage.remaining.aiMessages.toString())
    headers.set('X-Daily-Remaining-Summaries', usage.remaining.summaries.toString()) 
    headers.set('X-Daily-Remaining-Tokens', usage.remaining.totalTokens.toString())
    headers.set('X-Daily-Reset', new Date(usage.resetTime).toISOString())
    headers.set('X-Authenticated', sessionInfo.isAuthenticated.toString())

    return new NextResponse(JSON.stringify({ 
      success: true,
      walletAddress,
      authenticated: sessionInfo.isAuthenticated,
      usage: usage.remaining
    }), {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}) 