import { NextRequest } from "next/server"

// Shared rate limiting for all chat endpoints
const chatRequestCounts = new Map<string, { count: number; resetTime: number }>()
const nonChatRequestCounts = new Map<string, { count: number; resetTime: number }>()

// Daily usage tracking per wallet address
const dailyUsageCounts = new Map<string, {
  aiMessages: number
  summaries: number
  totalTokens: number
  resetTime: number
}>()

export const RATE_LIMITS = {
  CHAT_ENDPOINTS: {
    requests: 60,
    window: 60 * 1000,
  },
  OPENSEA_ENDPOINTS: {
    requests: 100,
    window: 60 * 1000,
  },
  OWNERSHIP_ENDPOINTS: {
    requests: 60,
    window: 60 * 1000,
  },
}

export const DAILY_LIMITS = {
  ai_messages: 100,
  summaries: 20,
  total_tokens: 200000,
}

export const SAMPLE_DAILY_LIMIT = 30
const sampleDailyCounts = new Map<string, { count: number; resetTime: number }>()

function nextMidnightReset(): number {
  const nextMidnight = new Date()
  nextMidnight.setHours(24, 0, 0, 0)
  return nextMidnight.getTime()
}

function emptyUsage(resetTime: number) {
  return { aiMessages: 0, summaries: 0, totalTokens: 0, resetTime }
}

/** Resolve wallet for caps: top-level body.walletAddress OR memoryProfile.metadata.walletAddress */
export function resolveWalletFromBody(body: any): string | null {
  const top = body?.walletAddress || body?.address
  if (typeof top === "string" && top.trim()) return top.trim().toLowerCase()
  const meta = body?.memoryProfile?.metadata?.walletAddress
  if (typeof meta === "string" && meta.trim()) return meta.trim().toLowerCase()
  return null
}

/**
 * Per-IP daily cap for sample (demo-wallet) sessions.
 */
export function checkSampleDailyLimit(request: NextRequest): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const ip = getClientIP(request)
  const now = Date.now()
  const key = `sample:${ip}`
  const entry = sampleDailyCounts.get(key)

  if (!entry || now >= entry.resetTime) {
    const resetTime = now + 24 * 60 * 60 * 1000
    sampleDailyCounts.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: SAMPLE_DAILY_LIMIT - 1, resetTime }
  }

  if (entry.count >= SAMPLE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: SAMPLE_DAILY_LIMIT - entry.count, resetTime: entry.resetTime }
}

export function createSampleLimitResponse(resetTime: number) {
  return {
    error: "Sample limit reached",
    message:
      "You've used today's sample allowance. Own a 0N1? Connect your wallet for full access - or come back tomorrow.",
    resetTime,
    sampleLimit: true,
  }
}

export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    return ips[0]
  }
  const realIP = request.headers.get("x-real-ip")
  if (realIP) return realIP
  return "unknown"
}

export async function getWalletAddress(request: NextRequest): Promise<string | null> {
  try {
    const url = new URL(request.url)
    const addressFromQuery = url.searchParams.get("address")
    if (addressFromQuery) return addressFromQuery.toLowerCase()
    const body = await request.json()
    return resolveWalletFromBody(body)
  } catch {
    return null
  }
}

function checkRateLimit(
  identifier: string,
  requestCounts: Map<string, { count: number; resetTime: number }>,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const userRequests = requestCounts.get(identifier)

  if (!userRequests || now > userRequests.resetTime) {
    const newResetTime = now + windowMs
    requestCounts.set(identifier, { count: 1, resetTime: newResetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime: newResetTime }
  }

  if (userRequests.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: userRequests.resetTime }
  }

  userRequests.count++
  return {
    allowed: true,
    remaining: maxRequests - userRequests.count,
    resetTime: userRequests.resetTime,
  }
}

/**
 * Pure read of daily usage — NEVER increments.
 * Use this for usage-check polls and response header refreshes.
 */
export function getDailyUsage(walletAddress: string): {
  allowed: boolean
  remaining: { aiMessages: number; summaries: number; totalTokens: number }
  resetTime: number
  usage: { aiMessages: number; summaries: number; totalTokens: number }
} {
  const now = Date.now()
  const resetTime = nextMidnightReset()
  const identifier = `daily:${walletAddress.toLowerCase()}`
  let userUsage = dailyUsageCounts.get(identifier)

  if (!userUsage || now > userUsage.resetTime) {
    userUsage = emptyUsage(resetTime)
    // Do not write an incremented row on read — only seed empty if missing so remaining is full
  }

  const usage = {
    aiMessages: userUsage.aiMessages,
    summaries: userUsage.summaries,
    totalTokens: userUsage.totalTokens,
  }

  return {
    allowed: true,
    remaining: {
      aiMessages: Math.max(0, DAILY_LIMITS.ai_messages - usage.aiMessages),
      summaries: Math.max(0, DAILY_LIMITS.summaries - usage.summaries),
      totalTokens: Math.max(0, DAILY_LIMITS.total_tokens - usage.totalTokens),
    },
    resetTime: userUsage.resetTime || resetTime,
    usage,
  }
}

/**
 * Check whether a charge would be allowed, then optionally record it.
 * Prefer: getDailyUsage for reads; recordDailyUsage after a successful AI call;
 * or checkAndRecordDailyUsage when gating before the call.
 */
export function checkAndRecordDailyUsage(
  walletAddress: string,
  type: "ai_messages" | "summaries",
  tokenCount: number = 0,
): {
  allowed: boolean
  remaining: { aiMessages: number; summaries: number; totalTokens: number }
  resetTime: number
} {
  const now = Date.now()
  const resetTime = nextMidnightReset()
  const identifier = `daily:${walletAddress.toLowerCase()}`
  let userUsage = dailyUsageCounts.get(identifier)

  if (!userUsage || now > userUsage.resetTime) {
    userUsage = emptyUsage(resetTime)
    dailyUsageCounts.set(identifier, userUsage)
  }

  const newAiMessages = userUsage.aiMessages + (type === "ai_messages" ? 1 : 0)
  const newSummaries = userUsage.summaries + (type === "summaries" ? 1 : 0)
  const newTotalTokens = userUsage.totalTokens + tokenCount

  if (
    newAiMessages > DAILY_LIMITS.ai_messages ||
    newSummaries > DAILY_LIMITS.summaries ||
    newTotalTokens > DAILY_LIMITS.total_tokens
  ) {
    return {
      allowed: false,
      remaining: {
        aiMessages: Math.max(0, DAILY_LIMITS.ai_messages - userUsage.aiMessages),
        summaries: Math.max(0, DAILY_LIMITS.summaries - userUsage.summaries),
        totalTokens: Math.max(0, DAILY_LIMITS.total_tokens - userUsage.totalTokens),
      },
      resetTime: userUsage.resetTime,
    }
  }

  userUsage.aiMessages = newAiMessages
  userUsage.summaries = newSummaries
  userUsage.totalTokens = newTotalTokens

  return {
    allowed: true,
    remaining: {
      aiMessages: DAILY_LIMITS.ai_messages - newAiMessages,
      summaries: DAILY_LIMITS.summaries - newSummaries,
      totalTokens: DAILY_LIMITS.total_tokens - newTotalTokens,
    },
    resetTime: userUsage.resetTime,
  }
}

/**
 * @deprecated Use getDailyUsage (read) or checkAndRecordDailyUsage (mutate).
 * Kept as an alias to checkAndRecordDailyUsage for any straggling imports —
 * callers that passed tokenCount=0 "just to read" MUST switch to getDailyUsage.
 */
export function checkDailyUsage(
  walletAddress: string,
  type: "ai_messages" | "summaries",
  tokenCount: number = 0,
): {
  allowed: boolean
  remaining: { aiMessages: number; summaries: number; totalTokens: number }
  resetTime: number
} {
  return checkAndRecordDailyUsage(walletAddress, type, tokenCount)
}

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
    RATE_LIMITS.CHAT_ENDPOINTS.window,
  )
  return { ...result, ip }
}

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
    RATE_LIMITS.OPENSEA_ENDPOINTS.window,
  )
  return { ...result, ip }
}

export function checkOpenSeaRateLimitEnhanced(
  request: NextRequest,
  isAuthenticated: boolean = false,
): {
  allowed: boolean
  remaining: number
  resetTime: number
  ip: string
  enhanced: boolean
} {
  const ip = getClientIP(request)
  const maxRequests = isAuthenticated ? 100 : RATE_LIMITS.OPENSEA_ENDPOINTS.requests
  const identifier = isAuthenticated ? `opensea_auth:${ip}` : `opensea:${ip}`
  const result = checkRateLimit(identifier, nonChatRequestCounts, maxRequests, RATE_LIMITS.OPENSEA_ENDPOINTS.window)
  return { ...result, ip, enhanced: isAuthenticated }
}

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
    RATE_LIMITS.OWNERSHIP_ENDPOINTS.window,
  )
  return { ...result, ip }
}

export function createRateLimitResponse(remaining: number, resetTime: number, endpointType: string = "chat") {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000)
  return {
    error: `Rate limit exceeded for ${endpointType} endpoints. Please try again in ${resetInSeconds} seconds.`,
    retryAfter: resetInSeconds,
    remaining,
    resetTime: new Date(resetTime).toISOString(),
  }
}

export function createDailyLimitResponse(
  remaining: { aiMessages: number; summaries: number; totalTokens: number },
  resetTime: number,
  limitType: string,
) {
  const resetInHours = Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60))
  return {
    error: `Daily ${limitType} limit exceeded. Resets in ~${resetInHours} hours at midnight.`,
    dailyLimits: DAILY_LIMITS,
    remaining,
    resetTime: new Date(resetTime).toISOString(),
    resetInHours,
  }
}

export function cleanupRateLimitMaps() {
  const now = Date.now()
  for (const [key, value] of chatRequestCounts.entries()) {
    if (now > value.resetTime) chatRequestCounts.delete(key)
  }
  for (const [key, value] of nonChatRequestCounts.entries()) {
    if (now > value.resetTime) nonChatRequestCounts.delete(key)
  }
  for (const [key, value] of dailyUsageCounts.entries()) {
    if (now > value.resetTime) dailyUsageCounts.delete(key)
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitMaps, 5 * 60 * 1000)
}
