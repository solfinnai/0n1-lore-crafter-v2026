import { randomBytes, createHash } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { ethers } from 'ethers';
import { 
  AuthChallenge, 
  AuthSession, 
  JWTPayload, 
  AuthResponse, 
  ChallengeResponse, 
  SessionInfo,
  AuthConfig 
} from './auth-types';
import {
  createSession,
  getSession,
  revokeSession,
  extendSession,
  createChallenge,
  getChallenge,
  consumeChallenge,
  revokeAllUserSessions
} from './session';

/**
 * Configuration
 */
function getAuthConfig(): AuthConfig {
  return {
    jwtSecret: process.env.JWT_SECRET || 'fallback_dev_secret_min_32_chars_long',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_min_32_chars',
    sessionDurationHours: parseInt(process.env.SESSION_DURATION_HOURS || '24'),
    challengeExpiryMinutes: parseInt(process.env.CHALLENGE_EXPIRY_MINUTES || '5'),
    devMode: process.env.NODE_ENV === 'development' && process.env.AUTH_DEV_MODE === 'true'
  };
}

/**
 * Generate a unique challenge for wallet signature
 */
export function generateAuthChallenge(walletAddress: string): ChallengeResponse {
  try {
    const config = getAuthConfig();
    const challengeId = randomBytes(16).toString('hex');
    const challenge = randomBytes(32).toString('hex');
    const timestamp = new Date().toISOString();
    const expiryMinutes = config.challengeExpiryMinutes;
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
    
    // Create human-readable message for signing
    const message = `Sign this message to authenticate with 0N1 Lore Crafter:

Wallet: ${walletAddress}
Challenge: ${challenge}
Timestamp: ${timestamp}
Expires: ${expiryTime}

This signature proves ownership of your wallet.
Only sign this on the official 0N1 Lore Crafter website.`;

    // Store challenge
    const challengeData = createChallenge(challengeId, walletAddress, message);
    
    console.log(`🎯 Generated auth challenge for wallet ${walletAddress}`);
    console.log(`🎯 Challenge ID: ${challengeId}`);
    console.log(`🎯 Challenge expires: ${expiryTime}`);
    
    return {
      success: true,
      challenge: message,
      challengeId,
      message: `Please sign this message to authenticate your wallet ownership.`,
      expiresAt: challengeData.expiresAt
    };
  } catch (error) {
    console.error('Error generating auth challenge:', error);
    return {
      success: false,
      error: 'Failed to generate authentication challenge'
    };
  }
}

/**
 * Verify wallet signature and create session
 */
export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  challengeId: string
): Promise<AuthResponse> {
  try {
    const config = getAuthConfig();
    
    // Development mode bypass
    if (config.devMode) {
      console.log('🚧 DEV MODE: Bypassing signature verification');
      return await createAuthenticatedSession(walletAddress, challengeId || 'dev-mode');
    }
    
    // Get and consume challenge
    const challengeData = consumeChallenge(challengeId);
    if (!challengeData) {
      return {
        success: false,
        error: 'Invalid or expired authentication challenge. Please request a new challenge.'
      };
    }
    
    // Verify the challenge belongs to this wallet
    if (challengeData.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        success: false,
        error: 'Challenge was generated for a different wallet address.'
      };
    }
    
    // Verify signature using ethers
    try {
      const recoveredAddress = ethers.verifyMessage(challengeData.challenge, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        console.log(`❌ Signature verification failed:`);
        console.log(`   Expected: ${walletAddress.toLowerCase()}`);
        console.log(`   Recovered: ${recoveredAddress.toLowerCase()}`);
        
        return {
          success: false,
          error: 'Invalid signature. The signature does not match the wallet address.'
        };
      }
    } catch (signatureError) {
      console.error('Signature verification error:', signatureError);
      return {
        success: false,
        error: 'Invalid signature format. Please try signing the message again.'
      };
    }
    
    // Create authenticated session
    console.log(`✅ Signature verified for wallet ${walletAddress}`);
    return await createAuthenticatedSession(walletAddress, challengeId);
    
  } catch (error) {
    console.error('Error verifying wallet signature:', error);
    return {
      success: false,
      error: 'Authentication verification failed. Please try again.'
    };
  }
}

/**
 * Create authenticated session with JWT tokens
 */
async function createAuthenticatedSession(
  walletAddress: string,
  challengeId: string
): Promise<AuthResponse> {
  try {
    const config = getAuthConfig();
    const sessionId = randomBytes(16).toString('hex');
    
    // Create session
    const session = createSession(sessionId, walletAddress, challengeId);
    
    // Generate JWT token
    const jwtPayload: JWTPayload = {
      walletAddress: walletAddress.toLowerCase(),
      sessionId: sessionId,
      challengeId: challengeId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(session.expiresAt / 1000)
    };
    
    const secret = new TextEncoder().encode(config.jwtSecret);
    const token = await new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(session.expiresAt)
      .sign(secret);
    
    // Generate refresh token
    const refreshPayload = {
      sessionId: sessionId,
      walletAddress: walletAddress.toLowerCase(),
      type: 'refresh'
    };
    
    const refreshSecret = new TextEncoder().encode(config.refreshSecret);
    const refreshToken = await new SignJWT(refreshPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(session.expiresAt + 7 * 24 * 60 * 60 * 1000) // 7 days for refresh
      .sign(refreshSecret);
    
    console.log(`🎉 Authentication successful for wallet ${walletAddress}`);
    console.log(`🎉 Session created: ${sessionId}`);
    console.log(`🎉 Token expires: ${new Date(session.expiresAt).toISOString()}`);
    
    return {
      success: true,
      token,
      refreshToken,
      expiresAt: session.expiresAt
    };
    
  } catch (error) {
    console.error('Error creating authenticated session:', error);
    return {
      success: false,
      error: 'Failed to create authentication session. Please try again.'
    };
  }
}

/**
 * Validate JWT token and return session info
 */
export async function validateToken(token: string): Promise<SessionInfo> {
  try {
    const config = getAuthConfig();
    const secret = new TextEncoder().encode(config.jwtSecret);
    
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    const jwtPayload = payload as unknown as JWTPayload;
    
    // Get session
    const session = getSession(jwtPayload.sessionId);
    if (!session) {
      return {
        isAuthenticated: false,
        isExpired: true
      };
    }
    
    // Check if session is still valid
    const now = Date.now();
    const isExpired = session.expiresAt < now;
    
    if (isExpired) {
      return {
        isAuthenticated: false,
        isExpired: true,
        walletAddress: session.walletAddress,
        sessionId: session.sessionId
      };
    }
    
    // Return valid session info
    return {
      isAuthenticated: true,
      walletAddress: session.walletAddress,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      isExpired: false,
      timeRemaining: session.expiresAt - now
    };
    
  } catch (error) {
    // Token is invalid or expired
    return {
      isAuthenticated: false,
      isExpired: true
    };
  }
}

/**
 * Refresh JWT token using refresh token
 */
export async function refreshAuthToken(refreshToken: string): Promise<AuthResponse> {
  try {
    const config = getAuthConfig();
    const refreshSecret = new TextEncoder().encode(config.refreshSecret);
    
    // Verify refresh token
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    const refreshPayload = payload as any;
    
    if (refreshPayload.type !== 'refresh') {
      return {
        success: false,
        error: 'Invalid refresh token type'
      };
    }
    
    // Extend session
    const session = extendSession(refreshPayload.sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found or expired'
      };
    }
    
    // Generate new JWT token
    const jwtPayload: JWTPayload = {
      walletAddress: session.walletAddress,
      sessionId: session.sessionId,
      challengeId: session.challengeId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(session.expiresAt / 1000)
    };
    
    const secret = new TextEncoder().encode(config.jwtSecret);
    const newToken = await new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(session.expiresAt)
      .sign(secret);
    
    console.log(`🔄 Token refreshed for wallet ${session.walletAddress}`);
    
    return {
      success: true,
      token: newToken,
      refreshToken, // Keep same refresh token
      expiresAt: session.expiresAt
    };
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      success: false,
      error: 'Failed to refresh authentication token'
    };
  }
}

/**
 * Logout and revoke session
 */
export async function logout(token: string): Promise<{ success: boolean }> {
  try {
    const sessionInfo = await validateToken(token);
    
    if (sessionInfo.isAuthenticated && sessionInfo.sessionId) {
      revokeSession(sessionInfo.sessionId);
      console.log(`👋 Logged out wallet ${sessionInfo.walletAddress}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: true }; // Always return success for logout
  }
}

/**
 * Logout all sessions for a wallet
 */
export async function logoutAllSessions(walletAddress: string): Promise<{ success: boolean; revokedCount: number }> {
  try {
    const revokedCount = revokeAllUserSessions(walletAddress);
    console.log(`👋 Logged out all sessions for wallet ${walletAddress}`);
    
    return { success: true, revokedCount };
  } catch (error) {
    console.error('Error logging out all sessions:', error);
    return { success: false, revokedCount: 0 };
  }
}

/**
 * Extract wallet address from Authorization header
 */
export async function getAuthenticatedWallet(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const sessionInfo = await validateToken(token);
  
  return sessionInfo.isAuthenticated ? sessionInfo.walletAddress || null : null;
}

/**
 * Development mode helpers
 */
export function isDevMode(): boolean {
  const config = getAuthConfig();
  return config.devMode;
}

export function getDevModeInfo(): { enabled: boolean; reason?: string } {
  const config = getAuthConfig();
  
  if (!config.devMode) {
    const reasons = [];
    if (process.env.NODE_ENV !== 'development') {
      reasons.push('NODE_ENV is not development');
    }
    if (process.env.AUTH_DEV_MODE !== 'true') {
      reasons.push('AUTH_DEV_MODE is not set to true');
    }
    
    return {
      enabled: false,
      reason: `Dev mode disabled: ${reasons.join(', ')}`
    };
  }
  
  return {
    enabled: true,
    reason: 'Dev mode active: NODE_ENV=development and AUTH_DEV_MODE=true'
  };
} 