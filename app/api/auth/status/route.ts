import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getDevModeInfo } from '@/lib/auth';
import { getSessionStats } from '@/lib/session';
import { SessionInfo } from '@/lib/auth-types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    let sessionInfo: SessionInfo = { isAuthenticated: false };
    let tokenInfo = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      sessionInfo = await validateToken(token);
      
      if (sessionInfo.isAuthenticated) {
        tokenInfo = {
          walletAddress: sessionInfo.walletAddress,
          sessionId: sessionInfo.sessionId,
          expiresAt: sessionInfo.expiresAt,
          timeRemaining: sessionInfo.timeRemaining,
          isExpired: sessionInfo.isExpired
        };
      }
    }

    // Get system stats
    const sessionStats = getSessionStats();
    const devModeInfo = getDevModeInfo();

    return NextResponse.json({
      authenticated: sessionInfo.isAuthenticated,
      session: tokenInfo,
      system: {
        activeSessions: sessionStats.activeSessions,
        activeChallenges: sessionStats.activeChallenges,
        timestamp: sessionStats.timestamp,
        devMode: devModeInfo
      },
      endpoints: {
        challenge: '/api/auth/challenge',
        verify: '/api/auth/verify',
        refresh: '/api/auth/refresh',
        logout: '/api/auth/logout'
      },
      rate_limits: sessionInfo.isAuthenticated ? {
        opensea: '100 requests/hour',
        ai_messages: '50 per day',
        summaries: '15 per day',
        tokens: '150,000 per day',
        note: 'Authenticated user limits'
      } : {
        opensea: '30 requests/hour',
        ai_messages: '20 per day',
        summaries: '5 per day',
        tokens: '50,000 per day',
        note: 'Unauthenticated user limits'
      }
    });

  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Failed to check authentication status' 
      },
      { status: 500 }
    );
  }
} 