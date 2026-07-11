export interface AuthChallenge {
  challenge: string;
  walletAddress: string;
  timestamp: number;
  expiresAt: number;
}

export interface AuthSession {
  sessionId: string;
  walletAddress: string;
  challengeId: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

export interface JWTPayload {
  walletAddress: string;
  sessionId: string;
  challengeId: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

export interface ChallengeResponse {
  success: boolean;
  challenge?: string;
  challengeId?: string;
  message?: string;
  expiresAt?: number;
  error?: string;
}

export interface SessionInfo {
  isAuthenticated: boolean;
  walletAddress?: string;
  sessionId?: string;
  expiresAt?: number;
  isExpired?: boolean;
  timeRemaining?: number;
}

export interface AuthConfig {
  jwtSecret: string;
  refreshSecret: string;
  sessionDurationHours: number;
  challengeExpiryMinutes: number;
  devMode: boolean;
}

export interface RateLimitInfo {
  authenticated: boolean;
  limits: {
    opensea: number;
    aiMessages: number;
    summaries: number;
    totalTokens: number;
  };
  used: {
    opensea: number;
    aiMessages: number;
    summaries: number;
    totalTokens: number;
  };
  remaining: {
    opensea: number;
    aiMessages: number;
    summaries: number;
    totalTokens: number;
  };
} 