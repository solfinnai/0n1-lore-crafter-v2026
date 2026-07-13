"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@/components/wallet/wallet-provider"
import { authHeaders } from "@/lib/auth-headers"

interface UsageData {
  aiMessages: { used: number; limit: number }
  summaries: { used: number; limit: number }
  tokens: { used: number; limit: number }
  resetTime?: string
}

interface UsageTrackingHook {
  usage: UsageData
  updateUsage: (headers: Headers) => void
  isNearLimit: (type: keyof UsageData) => boolean
  getWarningMessage: () => string | null
  canUseFeature: (type: 'messages' | 'summaries') => boolean
  refreshUsage: () => Promise<void>
}

export function useUsageTracking(): UsageTrackingHook {
  const { address } = useWallet()
  // Limits must match DAILY_LIMITS in lib/rate-limit.ts
  const [usage, setUsage] = useState<UsageData>({
    aiMessages: { used: 0, limit: 100 },
    summaries: { used: 0, limit: 20 },
    tokens: { used: 0, limit: 200000 },
    resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
  })

  const updateUsage = useCallback((headers: Headers) => {
    const aiMessages = headers.get('X-Daily-Remaining-AI-Messages')
    const summaries = headers.get('X-Daily-Remaining-Summaries')
    const tokens = headers.get('X-Daily-Remaining-Tokens')
    const resetTime = headers.get('X-Daily-Reset')

    // Only update from responses that actually carry usage headers
    if (aiMessages === null && summaries === null && tokens === null) return

    const usedFrom = (remaining: string | null, limit: number, prevUsed: number) =>
      remaining === null ? prevUsed : Math.max(0, limit - parseInt(remaining))

    setUsage(prev => ({
      aiMessages: {
        used: usedFrom(aiMessages, prev.aiMessages.limit, prev.aiMessages.used),
        limit: prev.aiMessages.limit
      },
      summaries: {
        used: usedFrom(summaries, prev.summaries.limit, prev.summaries.used),
        limit: prev.summaries.limit
      },
      tokens: {
        used: usedFrom(tokens, prev.tokens.limit, prev.tokens.used),
        limit: prev.tokens.limit
      },
      resetTime: resetTime || prev.resetTime
    }))
  }, [])

  const isNearLimit = useCallback((type: keyof UsageData) => {
    const data = usage[type] as { used: number; limit: number }
    const percentage = (data.used / data.limit) * 100
    return percentage >= 80
  }, [usage])

  const canUseFeature = useCallback((type: 'messages' | 'summaries') => {
    if (type === 'messages') {
      return usage.aiMessages.used < usage.aiMessages.limit
    }
    return usage.summaries.used < usage.summaries.limit
  }, [usage])

  const getWarningMessage = useCallback(() => {
    const messagesPercentage = (usage.aiMessages.used / usage.aiMessages.limit) * 100
    const summariesPercentage = (usage.summaries.used / usage.summaries.limit) * 100
    const tokensPercentage = (usage.tokens.used / usage.tokens.limit) * 100

    if (messagesPercentage >= 95) {
      return `You've used ${usage.aiMessages.used}/${usage.aiMessages.limit} daily messages. They reset at midnight.`
    }
    
    if (messagesPercentage >= 80) {
      return `You've used ${Math.round(messagesPercentage)}% of your daily messages. Plan your remaining conversations wisely.`
    }

    if (summariesPercentage >= 90) {
      return `You've used ${usage.summaries.used}/${usage.summaries.limit} daily summaries.`
    }

    if (tokensPercentage >= 80) {
      return "High token usage detected. Try shorter messages or simpler queries."
    }

    return null
  }, [usage])

  const refreshUsage = useCallback(async () => {
    if (!address) return

    try {
      // Make a lightweight request to get current usage
      const response = await fetch('/api/usage-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ walletAddress: address })
      })

      if (response.ok) {
        updateUsage(response.headers)
      }
    } catch (error) {
      console.error('Failed to refresh usage:', error)
    }
  }, [address, updateUsage])

  // Refresh usage on wallet change or component mount
  useEffect(() => {
    if (address) {
      refreshUsage()
    }
  }, [address, refreshUsage])

  // Auto-refresh usage every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshUsage, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshUsage])

  return {
    usage,
    updateUsage,
    isNearLimit,
    getWarningMessage,
    canUseFeature,
    refreshUsage
  }
} 