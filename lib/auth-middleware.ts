import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedWallet, validateToken, isDevMode } from './auth';
import { SessionInfo, RateLimitInfo } from './auth-types';

/**
 * Enhanced rate limits for authenticated vs unauthenticated users
 */
const RATE_LIMITS = {
  UNAUTHENTICATED: {
    opensea: 30,           // requests per hour
    aiMessages: 20,        // per day
    summaries: 5,          // per day  
    totalTokens: 50000     // per day
  },
  AUTHENTICATED: {
    opensea: 100,          // requests per hour (3x increase)
    aiMessages: 50,        // per day (2.5x increase)
    summaries: 15,         // per day (3x increase)
    totalTokens: 150000    // per day (3x increase)
  }
};

/**
 * Authentication middleware wrapper for API routes
 */
export function withAuth(
  handler: (req: NextRequest, sessionInfo: SessionInfo) => Promise<NextResponse> | NextResponse,
  options: {
    required?: boolean;
    requireOwnership?: boolean;
    devMode?: boolean;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { required = false, requireOwnership = false, devMode = true } = options;
      
      // Get authorization header
      const authHeader = req.headers.get('Authorization');
      let sessionInfo: SessionInfo = { isAuthenticated: false };
      
      // Development mode bypass
      if (devMode && isDevMode()) {
        const urlParams = new URL(req.url).searchParams;
        const devWallet = urlParams.get('address') || urlParams.get('walletAddress');
        
        if (devWallet) {
          console.log(`🚧 DEV MODE: Auto-authenticating wallet ${devWallet}`);
          sessionInfo = {
            isAuthenticated: true,
            walletAddress: devWallet.toLowerCase(),
            sessionId: 'dev-mode',
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            isExpired: false,
            timeRemaining: 24 * 60 * 60 * 1000
          };
        }
      }
      
      // Try to authenticate from header if not in dev mode
      if (!sessionInfo.isAuthenticated && authHeader) {
        const walletAddress = await getAuthenticatedWallet(authHeader);
        if (walletAddress) {
          const token = authHeader.substring(7);
          sessionInfo = await validateToken(token);
        }
      }
      
      // Check if authentication is required
      if (required && !sessionInfo.isAuthenticated) {
        return NextResponse.json(
          {
            error: 'Authentication required',
            message: 'You must authenticate with your wallet to access this endpoint.',
            code: 'AUTH_REQUIRED',
            authenticationUrl: '/api/auth/challenge'
          },
          { status: 401 }
        );
      }
      
      // Check ownership requirement (placeholder for now)
      if (requireOwnership && sessionInfo.isAuthenticated) {
        // TODO: Implement NFT ownership verification
        // For now, just log the requirement
        console.log(`🔒 Ownership verification required for ${sessionInfo.walletAddress}`);
      }
      
      // Add rate limit info to response headers
      const rateLimitInfo = getRateLimitInfo(sessionInfo.isAuthenticated);
      const response = await handler(req, sessionInfo);
      
      // Add authentication headers
      addAuthHeaders(response, sessionInfo, rateLimitInfo);
      
      return response;
      
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        {
          error: 'Authentication error',
          message: 'An error occurred during authentication.',
          code: 'AUTH_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simpler middleware for optional authentication
 */
export function withOptionalAuth(
  handler: (req: NextRequest, sessionInfo: SessionInfo) => Promise<NextResponse> | NextResponse
) {
  return withAuth(handler, { required: false });
}

/**
 * Middleware for required authentication
 */
export function withRequiredAuth(
  handler: (req: NextRequest, sessionInfo: SessionInfo) => Promise<NextResponse> | NextResponse
) {
  return withAuth(handler, { required: true });
}

/**
 * Middleware for ownership-based authentication
 */
export function withOwnershipAuth(
  handler: (req: NextRequest, sessionInfo: SessionInfo) => Promise<NextResponse> | NextResponse
) {
  return withAuth(handler, { required: true, requireOwnership: true });
}

/**
 * Get rate limit information based on authentication status
 */
function getRateLimitInfo(isAuthenticated: boolean): RateLimitInfo {
  const limits = isAuthenticated ? RATE_LIMITS.AUTHENTICATED : RATE_LIMITS.UNAUTHENTICATED;
  
  // TODO: Integrate with existing rate limit system
  // For now, return placeholder data
  return {
    authenticated: isAuthenticated,
    limits,
    used: {
      opensea: 0,
      aiMessages: 0,
      summaries: 0,
      totalTokens: 0
    },
    remaining: {
      opensea: limits.opensea,
      aiMessages: limits.aiMessages,
      summaries: limits.summaries,
      totalTokens: limits.totalTokens
    }
  };
}

/**
 * Add authentication and rate limit headers to response
 */
function addAuthHeaders(
  response: NextResponse,
  sessionInfo: SessionInfo,
  rateLimitInfo: RateLimitInfo
): void {
  // Authentication headers
  response.headers.set('X-Authenticated', sessionInfo.isAuthenticated.toString());
  
  if (sessionInfo.isAuthenticated) {
    response.headers.set('X-Wallet-Address', sessionInfo.walletAddress || '');
    response.headers.set('X-Session-ID', sessionInfo.sessionId || '');
    
    if (sessionInfo.expiresAt) {
      response.headers.set('X-Session-Expires', sessionInfo.expiresAt.toString());
    }
    
    if (sessionInfo.timeRemaining) {
      response.headers.set('X-Session-Time-Remaining', sessionInfo.timeRemaining.toString());
    }
  }
  
  // Rate limit headers
  response.headers.set('X-RateLimit-Authenticated', rateLimitInfo.authenticated.toString());
  response.headers.set('X-RateLimit-OpenSea-Limit', rateLimitInfo.limits.opensea.toString());
  response.headers.set('X-RateLimit-OpenSea-Remaining', rateLimitInfo.remaining.opensea.toString());
  response.headers.set('X-RateLimit-AI-Messages-Limit', rateLimitInfo.limits.aiMessages.toString());
  response.headers.set('X-RateLimit-AI-Messages-Remaining', rateLimitInfo.remaining.aiMessages.toString());
  response.headers.set('X-RateLimit-Summaries-Limit', rateLimitInfo.limits.summaries.toString());
  response.headers.set('X-RateLimit-Summaries-Remaining', rateLimitInfo.remaining.summaries.toString());
  response.headers.set('X-RateLimit-Tokens-Limit', rateLimitInfo.limits.totalTokens.toString());
  response.headers.set('X-RateLimit-Tokens-Remaining', rateLimitInfo.remaining.totalTokens.toString());
}

/**
 * Extract wallet address from request (authenticated or legacy)
 */
export async function getRequestWalletAddress(
  req: NextRequest,
  sessionInfo: SessionInfo
): Promise<string | null> {
  // If authenticated, use session wallet address
  if (sessionInfo.isAuthenticated && sessionInfo.walletAddress) {
    return sessionInfo.walletAddress;
  }
  
  // Fall back to legacy URL parameter (for backward compatibility)
  const url = new URL(req.url);
  const addressParam = url.searchParams.get('address') || url.searchParams.get('walletAddress');
  
  if (addressParam) {
    console.log(`⚠️ Using legacy wallet address parameter: ${addressParam}`);
    console.log(`⚠️ Consider upgrading to authenticated endpoints for better security`);
    return addressParam.toLowerCase();
  }
  
  return null;
}

/**
 * Utility to create authentication error responses
 */
export function createAuthErrorResponse(
  message: string,
  code: string = 'AUTH_ERROR',
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      error: 'Authentication error',
      message,
      code,
      authenticationUrl: '/api/auth/challenge'
    },
    { status }
  );
}

/**
 * Utility to create ownership error responses
 */
export function createOwnershipErrorResponse(
  tokenId?: string
): NextResponse {
  return NextResponse.json(
    {
      error: 'Ownership verification failed',
      message: tokenId
        ? `You don't own 0N1 Force #${tokenId}. You can only access characters you own.`
        : 'You must own the required NFT to access this resource.',
      code: 'OWNERSHIP_REQUIRED',
      tokenId
    },
    { status: 403 }
  );
}

/**
 * Development mode info endpoint
 */
export function getDevModeStatus() {
  return {
    enabled: isDevMode(),
    message: isDevMode()
      ? 'Development mode is active - wallet signatures are bypassed'
      : 'Development mode is disabled - full authentication required',
    instructions: isDevMode()
      ? 'Add ?address=0x... to any request to auto-authenticate'
      : 'Set AUTH_DEV_MODE=true in .env.local to enable development mode'
  };
} 