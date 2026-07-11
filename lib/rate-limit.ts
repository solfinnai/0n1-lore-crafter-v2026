import { NextRequest } from "next/server"

// Shared rate limiting for all chat endpoints
const chatRequestCounts = new Map<string, { count: number; resetTime: number }>()
const nonChatRequestCounts = new Map<string, { count: number; resetTime: number }>()

// Daily usage tracking per wallet address
const dailyUsageCounts = new Map<string, { 
  aiMessages: number; 
  summaries: number; 
  totalTokens: number; 
  resetTime: number 
}>()

// Rate limiting configuration
export const RATE_LIMITS = {
  // Chat endpoints (shared limit across all)
  CHAT_ENDPOINTS: {
    requests: 60,        // Increased from 20 to 60 per minute per IP
    window: 60 * 1000   // 1 minute window
  },
  // Non-chat endpoints (separate limits)
  OPENSEA_ENDPOINTS: {
    requests: 100,       // Increased from 30 to 100 per minute per IP
    window: 60 * 1000   // 1 minute window
  },
  OWNERSHIP_ENDPOINTS: {
    requests: 60,        // Increased from 30 to 60 per minute per IP
    window: 60 * 1000   // 1 minute window
  }
}

// Daily limits per wallet (cost protection)
export const DAILY_LIMITS = {
  ai_messages: 100,      // Increased from 20 to 100 per day
  summaries: 20,         // Increased from 5 to 20 per day
  total_tokens: 200000   // Increased from 50k to 200k tokens per day
}

// Extract IP address from request (handles Vercel forwarding)
export function getClientIP(request: NextRequest): string {
  // Check for forwarded IP (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP in the chain
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0]
  }

  // Fallback to other headers
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP

  // Final fallback
  return 'unknown'
}

// Extract wallet address from request body or query params
export async function getWalletAddress(request: NextRequest): Promise<string | null> {
  try {
    // Try query params first (for ownership verification)
    const url = new URL(request.url)
    const addressFromQuery = url.searchParams.get('address')
    if (addressFromQuery) return addressFromQuery.toLowerCase()

    // Try request body (for AI chat endpoints)
    const body = await request.json()
    
    // Different endpoints may pass wallet address differently
    if (body.walletAddress) return body.walletAddress.toLowerCase()
    if (body.address) return body.address.toLowerCase()
    if (body.nftId && body.characterData?.walletAddress) {
      return body.characterData.walletAddress.toLowerCase()
    }
    
    return null
  } catch (error) {
    // If we can't parse JSON or extract wallet, return null
    return null
  }
}

// Generic rate limiting function
function checkRateLimit(
  identifier: string, 
  requestCounts: Map<string, { count: number; resetTime: number }>,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const userRequests = requestCounts.get(identifier)
  
  if (!userRequests || now > userRequests.resetTime) {
    // Reset or initialize counter
    const newResetTime = now + windowMs
    requestCounts.set(identifier, { count: 1, resetTime: newResetTime })
    return { 
      allowed: true, 
      remaining: maxRequests - 1, 
      resetTime: newResetTime 
    }
  }
  
  if (userRequests.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: userRequests.resetTime 
    }
  }
  
  userRequests.count++
  return { 
    allowed: true, 
    remaining: maxRequests - userRequests.count, 
    resetTime: userRequests.resetTime 
  }
}

// Daily usage checking and updating
export function checkDailyUsage(
  walletAddress: string,
  type: 'ai_messages' | 'summaries',
  tokenCount: number = 0
): {
  allowed: boolean
  remaining: { aiMessages: number; summaries: number; totalTokens: number }
  resetTime: number
} {
  const now = Date.now()
  const nextMidnight = new Date()
  nextMidnight.setHours(24, 0, 0, 0) // Next midnight
  const resetTime = nextMidnight.getTime()
  
  const identifier = `daily:${walletAddress}`
  const userUsage = dailyUsageCounts.get(identifier)
  
  // Initialize or reset if past midnight
  if (!userUsage || now > userUsage.resetTime) {
    const newUsage = {
      aiMessages: type === 'ai_messages' ? 1 : 0,
      summaries: type === 'summaries' ? 1 : 0,
      totalTokens: tokenCount,
      resetTime
    }
    dailyUsageCounts.set(identifier, newUsage)
    
    return {
      allowed: true,
      remaining: {
        aiMessages: DAILY_LIMITS.ai_messages - newUsage.aiMessages,
        summaries: DAILY_LIMITS.summaries - newUsage.summaries,
        totalTokens: DAILY_LIMITS.total_tokens - newUsage.totalTokens
      },
      resetTime
    }
  }
  
  // Check limits
  const newAiMessages = userUsage.aiMessages + (type === 'ai_messages' ? 1 : 0)
  const newSummaries = userUsage.summaries + (type === 'summaries' ? 1 : 0)
  const newTotalTokens = userUsage.totalTokens + tokenCount
  
  // Check if any limit would be exceeded
  if (newAiMessages > DAILY_LIMITS.ai_messages ||
      newSummaries > DAILY_LIMITS.summaries ||
      newTotalTokens > DAILY_LIMITS.total_tokens) {
    return {
      allowed: false,
      remaining: {
        aiMessages: Math.max(0, DAILY_LIMITS.ai_messages - userUsage.aiMessages),
        summaries: Math.max(0, DAILY_LIMITS.summaries - userUsage.summaries),
        totalTokens: Math.max(0, DAILY_LIMITS.total_tokens - userUsage.totalTokens)
      },
      resetTime: userUsage.resetTime
    }
  }
  
  // Update usage
  userUsage.aiMessages = newAiMessages
  userUsage.summaries = newSummaries
  userUsage.totalTokens = newTotalTokens
  
  return {
    allowed: true,
    remaining: {
      aiMessages: DAILY_LIMITS.ai_messages - newAiMessages,
      summaries: DAILY_LIMITS.summaries - newSummaries,
      totalTokens: DAILY_LIMITS.total_tokens - newTotalTokens
    },
    resetTime: userUsage.resetTime
  }
}

// Rate limiting for chat endpoints (shared across all chat interfaces)
export function checkChatRateLimit(request: NextRequest): {
  allowed: boolean
  remaining: number
  resetTime: number
  ip: string
} {
  const ip = getClientIP(request)
  const result = checkRateLimit(
    `chat:${ip}`, 
    chatRequestCounts, 
    RATE_LIMITS.CHAT_ENDPOINTS.requests,
    RATE_LIMITS.CHAT_ENDPOINTS.window
  )
  
  return { ...result, ip }
}

// Rate limiting for OpenSea endpoints
export function checkOpenSeaRateLimit(request: NextRequest): {
  allowed: boolean
  remaining: number
  resetTime: number
  ip: string
} {
  const ip = getClientIP(request)
  const result = checkRateLimit(
    `opensea:${ip}`, 
    nonChatRequestCounts, 
    RATE_LIMITS.OPENSEA_ENDPOINTS.requests,
    RATE_LIMITS.OPENSEA_ENDPOINTS.window
  )
  
  return { ...result, ip }
}

// Enhanced rate limiting for OpenSea endpoints with authentication awareness
export function checkOpenSeaRateLimitEnhanced(request: NextRequest, isAuthenticated: boolean = false): {
  allowed: boolean
  remaining: number
  resetTime: number
  ip: string
  enhanced: boolean
} {
  const ip = getClientIP(request)
  
  // Use higher limits for authenticated users
  const maxRequests = isAuthenticated ? 100 : RATE_LIMITS.OPENSEA_ENDPOINTS.requests // 100 vs 30
  const identifier = isAuthenticated ? `opensea_auth:${ip}` : `opensea:${ip}`
  
  const result = checkRateLimit(
    identifier, 
    nonChatRequestCounts, 
    maxRequests,
    RATE_LIMITS.OPENSEA_ENDPOINTS.window
  )
  
  return { ...result, ip, enhanced: isAuthenticated }
}

// Rate limiting for ownership endpoints
export function checkOwnershipRateLimit(request: NextRequest): {
  allowed: boolean
  remaining: number
  resetTime: number
  ip: string
} {
  const ip = getClientIP(request)
  const result = checkRateLimit(
    `ownership:${ip}`, 
    nonChatRequestCounts, 
    RATE_LIMITS.OWNERSHIP_ENDPOINTS.requests,
    RATE_LIMITS.OWNERSHIP_ENDPOINTS.window
  )
  
  return { ...result, ip }
}

// Helper to format rate limit error response
export function createRateLimitResponse(
  remaining: number, 
  resetTime: number, 
  endpointType: string = "chat"
) {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000)
  
  return {
    error: `Rate limit exceeded for ${endpointType} endpoints. Please try again in ${resetInSeconds} seconds.`,
    retryAfter: resetInSeconds,
    remaining,
    resetTime: new Date(resetTime).toISOString()
  }
}

// Helper to format daily limit error response
export function createDailyLimitResponse(
  remaining: { aiMessages: number; summaries: number; totalTokens: number },
  resetTime: number,
  limitType: string
) {
  const resetInHours = Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60))
  
  return {
    error: `Daily ${limitType} limit exceeded. Resets in ~${resetInHours} hours at midnight.`,
    dailyLimits: DAILY_LIMITS,
    remaining,
    resetTime: new Date(resetTime).toISOString(),
    resetInHours
  }
}

// Cleanup old entries periodically (prevent memory leaks)
export function cleanupRateLimitMaps() {
  const now = Date.now()
  
  // Clean chat rate limits
  for (const [key, value] of chatRequestCounts.entries()) {
    if (now > value.resetTime) {
      chatRequestCounts.delete(key)
    }
  }
  
  // Clean non-chat rate limits
  for (const [key, value] of nonChatRequestCounts.entries()) {
    if (now > value.resetTime) {
      nonChatRequestCounts.delete(key)
    }
  }
  
  // Clean daily usage limits
  for (const [key, value] of dailyUsageCounts.entries()) {
    if (now > value.resetTime) {
      dailyUsageCounts.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitMaps, 5 * 60 * 1000)
} 