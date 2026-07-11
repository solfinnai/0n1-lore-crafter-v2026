"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  X, 
  Send, 
  Bot, 
  User, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  Settings,
  Save
} from "lucide-react"
import Image from "next/image"
import type { StoredSoul } from "@/lib/storage-wrapper"
import type { CharacterMemoryProfile } from "@/lib/memory-types"
import { useWallet } from "@/components/wallet/wallet-provider"
import { UsageIndicator } from "@/components/ui/usage-indicator"
import { ErrorMessage } from "@/components/ui/error-message"
import { useUsageTracking } from "@/hooks/use-usage-tracking"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface FloatingChatProps {
  soul: StoredSoul
  memoryProfile: CharacterMemoryProfile
  onClose: () => void
  onUpdateMemory: (updates: Partial<CharacterMemoryProfile>) => void
}

interface AISettings {
  provider: 'openai' | 'claude'
  model: string
  enhancedPersonality?: boolean
  responseStyle?: string
}

export function FloatingChat({ soul, memoryProfile, onClose, onUpdateMemory }: FloatingChatProps) {
  const { address } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiSettings, setAiSettings] = useState<AISettings>({
    provider: 'openai',
    model: 'gpt-4o',
    enhancedPersonality: false,
    responseStyle: 'dialogue'
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Usage tracking
  const { usage, updateUsage, canUseFeature, getWarningMessage } = useUsageTracking()

  useEffect(() => {
    // Load existing messages from memory profile
    setMessages(memoryProfile.conversationMemory.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
    })))
  }, [memoryProfile.conversationMemory.messages])

  useEffect(() => {
    // Load AI settings from localStorage (excluding API key)
    const savedSettings = localStorage.getItem('oni-ai-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        // Only restore provider, model, and enhancedPersonality, ignore any legacy apiKey
        setAiSettings({
          provider: parsed.provider || 'openai',
          model: parsed.model || 'gpt-4o',
          enhancedPersonality: parsed.enhancedPersonality || false,
          responseStyle: parsed.responseStyle || 'dialogue'
        })
      } catch (error) {
        console.error('Error loading AI settings:', error)
      }
    }
  }, [])

  const saveAISettings = (settings: AISettings) => {
    setAiSettings(settings)
    localStorage.setItem('oni-ai-settings', JSON.stringify(settings))
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    // Check usage limits before sending
    if (!canUseFeature('messages')) {
      setError("daily_limit:Daily message limit reached")
      return
    }
    
    setError(null) // Clear any previous errors

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          nftId: soul.data.pfpId,
          memoryProfile: {
            ...memoryProfile,
            metadata: {
              ...memoryProfile.metadata,
              walletAddress: address // Include wallet address for daily limits
            }
          },
          provider: aiSettings.provider,
          model: aiSettings.model,
          enhancedPersonality: aiSettings.enhancedPersonality,
          responseStyle: aiSettings.responseStyle
        })
      })

      // Update usage tracking from response headers
      updateUsage(response.headers)

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 429) {
          if (data.dailyLimits) {
            setError("daily_limit:" + JSON.stringify(data))
          } else {
            setError("rate_limit:" + JSON.stringify(data))
          }
        } else {
          setError("api_error:" + (data.error || "Failed to get AI response"))
        }
        return
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update memory profile with new messages
      const updatedMessages = [...messages, userMessage, assistantMessage]
      onUpdateMemory({
        conversationMemory: {
          ...memoryProfile.conversationMemory,
          messages: updatedMessages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        },
        overview: {
          ...memoryProfile.overview,
          totalInteractions: memoryProfile.overview.totalInteractions + 1,
          lastActivity: new Date()
        }
      })

    } catch (error) {
      console.error("Error sending message:", error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble responding right now. Please check your AI settings and try again.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return ""
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      if (isNaN(dateObj.getTime())) return ""
      
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error("Error formatting time:", error)
      return ""
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="bg-black/95 border-purple-500/30 backdrop-blur-md shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-500/30">
                <Image
                  src={soul.data.imageUrl || `/placeholder.svg?height=32&width=32&query=0N1 Force #${soul.data.pfpId}`}
                  alt={`0N1 Force #${soul.data.pfpId}`}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-sm text-purple-300">{soul.data.soulName}</CardTitle>
                <p className="text-xs text-muted-foreground">0N1 Force #{soul.data.pfpId}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8 p-0 hover:bg-purple-900/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 hover:bg-purple-900/20"
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-purple-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pt-0">
            {/* Usage Indicator */}
            {address && (
              <div className="mb-3">
                <UsageIndicator 
                  usage={usage} 
                  compact={true}
                  className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-2"
                />
              </div>
            )}

            {/* Smart Warning */}
            {getWarningMessage() && (
              <div className="mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-300 text-xs">
                  <span>⚠️</span>
                  <span>{getWarningMessage()}</span>
                </div>
              </div>
            )}

            {/* Enhanced Error Message */}
            {error && (
              <div className="mb-3">
                {error.startsWith('daily_limit:') ? (
                  <ErrorMessage
                    error="Daily usage limit exceeded"
                    type="daily_limit"
                    resetTime={new Date(new Date().setHours(24, 0, 0, 0)).toISOString()}
                    remaining={{
                      aiMessages: usage.aiMessages.limit - usage.aiMessages.used,
                      summaries: usage.summaries.limit - usage.summaries.used,
                      tokens: usage.tokens.limit - usage.tokens.used
                    }}
                    onSwitchModel={() => setAiSettings(prev => ({ ...prev, model: 'llama-3.1-70b' }))}
                    onRetry={() => setError(null)}
                    className="text-xs"
                  />
                ) : error.startsWith('rate_limit:') ? (
                  <ErrorMessage
                    error="You're sending messages too quickly"
                    type="rate_limit"
                    onRetry={() => setError(null)}
                    className="text-xs"
                  />
                ) : error.startsWith('api_error:') ? (
                  <ErrorMessage
                    error={error.replace('api_error:', '')}
                    type="api_error"
                    onRetry={() => setError(null)}
                    onSwitchModel={() => setAiSettings(prev => ({ ...prev, model: 'llama-3.1-70b' }))}
                    className="text-xs"
                  />
                ) : (
                  <ErrorMessage
                    error={error}
                    type="general"
                    onRetry={() => setError(null)}
                    className="text-xs"
                  />
                )}
              </div>
            )}

            {/* AI Settings */}
            {showSettings && (
              <div className="mb-4 p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                <h4 className="font-medium text-purple-300 mb-3">AI Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-purple-300 mb-1 block">Provider</label>
                    <select 
                      value={aiSettings.provider}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, provider: e.target.value as 'openai' | 'claude' }))}
                      className="w-full p-2 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="claude">Claude (Coming Soon)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-purple-300 mb-1 block">Model</label>
                    <select 
                      value={aiSettings.model}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full p-2 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
                      disabled={aiSettings.provider !== 'openai'}
                    >
                      <option value="gpt-4o">GPT-4o (Recommended)</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="llama-3.1-70b">🔥 Llama 3.1 70B (Uncensored)</option>
                      <option value="llama-3.1-8b">🔥 Llama 3.1 8B (Uncensored)</option>
                      <option value="llama-3-70b">🔥 Llama 3 70B (Uncensored)</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enhancedPersonality"
                      checked={aiSettings.enhancedPersonality}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, enhancedPersonality: e.target.checked }))}
                      className="rounded border-purple-500/30 bg-black/40"
                    />
                    <label htmlFor="enhancedPersonality" className="text-xs text-purple-300">
                      Enhanced Personality Mode
                    </label>
                  </div>
                  <div>
                    <label className="text-xs text-purple-300 mb-1 block">Response Style</label>
                    <select 
                      value={aiSettings.responseStyle}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, responseStyle: e.target.value }))}
                      className="w-full p-2 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
                    >
                      <option value="dialogue">💬 Dialogue Only</option>
                      <option value="narrative">📖 Narrative Style</option>
                    </select>
                  </div>
                  <div className="text-xs text-purple-200/70 mb-2">
                    ⚠️ Enhanced mode allows more authentic aggressive/edgy personalities. Use for mature content only.
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        saveAISettings(aiSettings)
                        setShowSettings(false)
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowSettings(false)}
                      className="border-purple-500/30"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="h-64 mb-4 pr-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start a conversation with {soul.data.soulName}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        message.role === "user" 
                          ? "bg-blue-600" 
                          : "bg-purple-600"
                      }`}>
                        {message.role === "user" ? (
                          <User className="h-3 w-3 text-white" />
                        ) : (
                          <Bot className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${
                        message.role === "user" ? "text-right" : ""
                      }`}>
                        <div className={`inline-block p-3 rounded-lg text-sm ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-purple-900/40 border border-purple-500/30"
                        }`}>
                          {message.content}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-purple-900/40 border border-purple-500/30">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${soul.data.soulName}...`}
                className="bg-black/40 border-purple-500/30 text-sm"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
} 