"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, FileText, Zap, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsageData {
  aiMessages: { used: number; limit: number }
  summaries: { used: number; limit: number }
  tokens: { used: number; limit: number }
  resetTime?: string
}

interface UsageIndicatorProps {
  usage: UsageData
  className?: string
  compact?: boolean
  showWarnings?: boolean
}

export function UsageIndicator({ usage, className = "", compact = false, showWarnings = true }: UsageIndicatorProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string>("")

  useEffect(() => {
    if (!usage.resetTime) return

    const updateTimeUntilReset = () => {
      const now = new Date().getTime()
      const resetTime = new Date(usage.resetTime!).getTime()
      const timeDiff = resetTime - now

      if (timeDiff <= 0) {
        setTimeUntilReset("Resetting...")
        return
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeUntilReset(`Resets in ${hours}h ${minutes}m`)
      } else {
        setTimeUntilReset(`Resets in ${minutes}m`)
      }
    }

    updateTimeUntilReset()
    const interval = setInterval(updateTimeUntilReset, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [usage.resetTime])

  const getUsageStatus = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 95) return { status: "critical", color: "bg-red-500", textColor: "text-red-400" }
    if (percentage >= 80) return { status: "warning", color: "bg-yellow-500", textColor: "text-yellow-400" }
    if (percentage >= 60) return { status: "moderate", color: "bg-blue-500", textColor: "text-blue-400" }
    return { status: "good", color: "bg-green-500", textColor: "text-green-400" }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default: return <CheckCircle className="h-4 w-4 text-green-400" />
    }
  }

  const messagesStatus = getUsageStatus(usage.aiMessages.used, usage.aiMessages.limit)
  const summariesStatus = getUsageStatus(usage.summaries.used, usage.summaries.limit)
  const tokensStatus = getUsageStatus(usage.tokens.used, usage.tokens.limit)

  const hasWarnings = showWarnings && (
    messagesStatus.status === "warning" || messagesStatus.status === "critical" ||
    summariesStatus.status === "warning" || summariesStatus.status === "critical" ||
    tokensStatus.status === "warning" || tokensStatus.status === "critical"
  )

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span className={messagesStatus.textColor}>
            {usage.aiMessages.used}/{usage.aiMessages.limit}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span className={summariesStatus.textColor}>
            {usage.summaries.used}/{usage.summaries.limit}
          </span>
        </div>
        {hasWarnings && <AlertTriangle className="h-3 w-3 text-yellow-400" />}
      </div>
    )
  }

  return (
    <Card className={`bg-black/40 border-purple-500/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Daily Usage
          {timeUntilReset && (
            <Badge variant="outline" className="ml-auto text-xs border-purple-500/30">
              <Clock className="h-3 w-3 mr-1" />
              {timeUntilReset}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span>AI Messages</span>
              {getStatusIcon(messagesStatus.status)}
            </div>
            <span className={messagesStatus.textColor}>
              {usage.aiMessages.used} / {usage.aiMessages.limit}
            </span>
          </div>
          <Progress 
            value={(usage.aiMessages.used / usage.aiMessages.limit) * 100} 
            className="h-2"
            style={{ 
              background: 'rgba(139, 92, 246, 0.1)',
            }}
          />
        </div>

        {/* Summaries */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Summaries</span>
              {getStatusIcon(summariesStatus.status)}
            </div>
            <span className={summariesStatus.textColor}>
              {usage.summaries.used} / {usage.summaries.limit}
            </span>
          </div>
          <Progress 
            value={(usage.summaries.used / usage.summaries.limit) * 100} 
            className="h-2"
          />
        </div>

        {/* Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span>Tokens</span>
              {getStatusIcon(tokensStatus.status)}
            </div>
            <span className={tokensStatus.textColor}>
              {usage.tokens.used.toLocaleString()} / {usage.tokens.limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={(usage.tokens.used / usage.tokens.limit) * 100} 
            className="h-2"
          />
        </div>

        {/* Smart Warnings */}
        {showWarnings && hasWarnings && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="text-yellow-300 font-medium">Usage Warning</p>
                {messagesStatus.status === "critical" && (
                  <p className="text-yellow-200">You've almost reached your daily message limit! It resets tomorrow.</p>
                )}
                {messagesStatus.status === "warning" && (
                  <p className="text-yellow-200">You're using {Math.round((usage.aiMessages.used / usage.aiMessages.limit) * 100)}% of your daily messages. Plan your remaining conversations wisely.</p>
                )}
                {summariesStatus.status === "critical" && (
                  <p className="text-yellow-200">Summary generation limit almost reached!</p>
                )}
                {tokensStatus.status === "warning" && (
                  <p className="text-yellow-200">High token usage detected. Try shorter messages or simpler queries.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 