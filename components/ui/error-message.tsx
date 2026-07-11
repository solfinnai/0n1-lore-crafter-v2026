"use client"

import { AlertTriangle, Clock, Zap, MessageSquare, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ErrorMessageProps {
  error: string
  type?: "rate_limit" | "daily_limit" | "api_error" | "general"
  resetTime?: string
  remaining?: {
    aiMessages?: number
    summaries?: number
    tokens?: number
  }
  onRetry?: () => void
  onSwitchModel?: () => void
  className?: string
}

export function ErrorMessage({ 
  error, 
  type = "general", 
  resetTime, 
  remaining, 
  onRetry, 
  onSwitchModel,
  className = ""
}: ErrorMessageProps) {
  
  const getTimeUntilReset = () => {
    if (!resetTime) return null
    
    const now = new Date().getTime()
    const reset = new Date(resetTime).getTime()
    const timeDiff = reset - now
    
    if (timeDiff <= 0) return "Resetting now..."
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getErrorContent = () => {
    switch (type) {
      case "rate_limit":
        return {
          title: "Rate Limit Reached",
          message: "You're sending messages too quickly. Please slow down to avoid being blocked.",
          icon: <Clock className="h-5 w-5 text-blue-400" />,
          suggestions: [
            "Wait a moment before sending your next message",
            "Consider using the AI Assistant for quick suggestions",
            "Plan your messages to make them more comprehensive"
          ],
          actions: onRetry ? ["retry"] : []
        }
      
      case "daily_limit":
        return {
          title: "Daily Limit Exceeded",
          message: "You've reached your daily usage limit. Your access will restore at midnight.",
          icon: <Zap className="h-5 w-5 text-yellow-400" />,
          suggestions: [
                        "Use the character creation tools (no limits)",
            "Explore your NFT collection and memories",
            "Come back tomorrow for fresh limits"
          ],
          actions: onSwitchModel ? ["switch_model"] : []
        }
      
      case "api_error":
        return {
          title: "Service Temporarily Unavailable",
          message: "The AI service is experiencing issues. This is usually temporary.",
          icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
          suggestions: [
                        "Wait a few minutes and try again",
            "Check if other features are working",
            "Contact support if this persists"
          ],
          actions: onRetry && onSwitchModel ? ["retry", "switch_model"] : onRetry ? ["retry"] : []
        }
      
      default:
        return {
          title: "Something Went Wrong",
          message: error || "An unexpected error occurred. Please try again.",
          icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
          suggestions: [
            "Refresh the page and try again",
            "Check your internet connection",
            "Try a different browser if the issue persists"
          ],
          actions: onRetry ? ["retry"] : []
        }
    }
  }

  const { title, message, icon, suggestions, actions } = getErrorContent()
  const timeUntilReset = getTimeUntilReset()

  return (
    <Card className={`bg-red-500/5 border-red-500/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-medium text-red-300 mb-1">{title}</h3>
              <p className="text-sm text-red-200/80">{message}</p>
            </div>

            {/* Reset Time */}
            {timeUntilReset && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-red-500/30 text-red-300">
                  <Clock className="h-3 w-3 mr-1" />
                  Resets in {timeUntilReset}
                </Badge>
              </div>
            )}

            {/* Remaining Usage */}
            {remaining && (
              <div className="flex items-center gap-4 text-xs text-red-200/70">
                {remaining.aiMessages !== undefined && (
                  <span>Messages: {remaining.aiMessages} left</span>
                )}
                {remaining.summaries !== undefined && (
                  <span>Summaries: {remaining.summaries} left</span>
                )}
                {remaining.tokens !== undefined && (
                  <span>Tokens: {remaining.tokens.toLocaleString()} left</span>
                )}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-300">What you can do:</p>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-red-200/80 flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            {actions.length > 0 && (
              <div className="flex gap-2 pt-2">
                {actions.includes("retry") && onRetry && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onRetry}
                    className="border-red-500/30 hover:bg-red-500/10 text-red-300"
                  >
                    Try Again
                  </Button>
                )}
                {actions.includes("switch_model") && onSwitchModel && (
                  <Button 
                    size="sm" 
                    onClick={onSwitchModel}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    Switch Model
                  </Button>
                )}
              </div>
            )}

            {/* Help Link */}
            {type === "daily_limit" && (
              <div className="pt-2 border-t border-red-500/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-200 p-0 h-auto"
                  asChild
                >
                  <a href="/help/usage-limits" target="_blank" className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Learn about usage limits
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 