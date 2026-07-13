"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSoulByNftId, type StoredSoul } from "@/lib/storage-wrapper"
import { createAgentConfig, type AgentConfig } from "@/lib/ai-agent"
import { ArrowLeft, Send, Bot, User, Share, Settings, Clock, Brain, Edit, RotateCcw, Archive } from 'lucide-react'
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

import {
  getCharacterMemories,
  saveCharacterMemories,
  createCharacterMemory,
  addMessageToMemory,
  getMemoryStats,
  type ConversationMemory,
} from "@/lib/memory"

import { upgradeToEnhancedMemory, type EnhancedMemory, MemoryCategory } from "@/lib/memory-enhanced"


import { ContextProvider } from "@/components/context-provider"
import { ContextExplorer } from "@/components/context-explorer"
import { UnifiedSoulHeader } from "@/components/unified-soul-header"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertTriangle } from "lucide-react"
import {
  CharacterMemoryProfile,
  getMemoryProfile,
  saveMemoryProfile,
  createDefaultMemoryProfile,
  addContextEntry,
  getAllTags,
  migrateLegacyEntries,
} from "@/lib/memory-types"

// New memory saving components
import { EnhancedChatMessage } from "@/components/enhanced-chat-message"
import { MemoryCategoryPicker } from "@/components/memory-category-picker"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { ChatArchiveBrowser } from "@/components/chat-archive-browser"

// Chat Archive System
import { archiveChat, getArchivedChats, type ArchivedChat } from "@/lib/chat-archive"

// Wallet and ownership verification
import { useWallet } from "@/components/wallet/wallet-provider"
import { verifyNftOwnership, createOwnershipError } from "@/lib/ownership"

// Usage tracking and UX improvements
import { UsageIndicator } from "@/components/ui/usage-indicator"
import { ErrorMessage } from "@/components/ui/error-message"
import { useUsageTracking } from "@/hooks/use-usage-tracking"

// Enhanced message interface to support memory features
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Memory segment interface for tracking saved text
interface SavedMemorySegment {
  id: string
  messageId: string
  text: string
  startIndex: number
  endIndex: number
  tags: string[]
  importance: number
  timestamp: Date
}

export default function AgentPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected, isInitializing: walletInitializing } = useWallet()
  const [soul, setSoul] = useState<StoredSoul | null>(null)
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [memory, setMemory] = useState<ConversationMemory | null>(null)
  const [enhancedMemory, setEnhancedMemory] = useState<EnhancedMemory | null>(null)
  const [memoryStats, setMemoryStats] = useState<any>(null)
  const [isFirstConversation, setIsFirstConversation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState("claude-opus-4-8")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(800)
  const [contextMode, setContextMode] = useState<"basic" | "enhanced">("enhanced")
  const [showMemoryPanel, setShowMemoryPanel] = useState(false)
  const [showContextExplorer, setShowContextExplorer] = useState(false)
  const [memoryProfile, setMemoryProfile] = useState<CharacterMemoryProfile | null>(null)
  const [enhancedPersonality, setEnhancedPersonality] = useState(false)
  const [responseStyle, setResponseStyle] = useState("dialogue")

  // Chat session tracking
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date())
  const [showArchiveBrowser, setShowArchiveBrowser] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // New memory saving states
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [savedMemorySegments, setSavedMemorySegments] = useState<SavedMemorySegment[]>([])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [pendingMemoryData, setPendingMemoryData] = useState<{
    text: string
    messageId?: string
    isFullMessage?: boolean
  } | null>(null)

  // Ownership verification state
  const [ownershipVerified, setOwnershipVerified] = useState<boolean | null>(null)
  
  // Usage tracking
  const { usage, updateUsage, isNearLimit, getWarningMessage, canUseFeature } = useUsageTracking()

  // Temporary localStorage clearing function for debugging


  // Load saved memory segments on mount
  useEffect(() => {
    if (soul?.data.pfpId) {
      const saved = localStorage.getItem(`memory-segments-${soul.data.pfpId}`)
      if (saved) {
        try {
          setSavedMemorySegments(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to load saved memory segments:', e)
        }
      }
    }
  }, [soul?.data.pfpId])

  // Save memory segments to localStorage
  const saveMemorySegments = (segments: SavedMemorySegment[]) => {
    if (soul?.data.pfpId) {
      localStorage.setItem(`memory-segments-${soul.data.pfpId}`, JSON.stringify(segments))
      setSavedMemorySegments(segments)
    }
  }

  // Handle saving memory (from category picker)
  const handleSaveMemory = (memoryData: {
    text: string
    tags: string[]
    importance: number
    messageId?: string
    isFullMessage?: boolean
  }) => {
    // Create memory segment
    const segment: SavedMemorySegment = {
      id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messageId: memoryData.messageId || '',
      text: memoryData.text,
      startIndex: 0,
      endIndex: memoryData.text.length,
      tags: memoryData.tags,
      importance: memoryData.importance,
      timestamp: new Date(),
    }

    const updatedSegments = [...savedMemorySegments, segment]
    saveMemorySegments(updatedSegments)

    // Add to memory profile system
    if (memoryProfile) {
      const updatedProfile = addContextEntry(memoryProfile, {
        type: "context",
        content: memoryData.text,
        tags: memoryData.tags.filter(tag => !['Personal', 'Professional', 'Technical', 'Creative', 'Important Facts', 'Preferences', 'Goals', 'Other'].includes(tag)),
        customTags: memoryData.tags.filter(tag => ['Personal', 'Professional', 'Technical', 'Creative', 'Important Facts', 'Preferences', 'Goals', 'Other'].includes(tag)),
        importance: memoryData.importance,
      })

      setMemoryProfile(updatedProfile)
      saveMemoryProfile(updatedProfile)
    }

    // Add to enhanced memory system for backwards compatibility
    if (enhancedMemory) {
      const categoryMap: Record<string, MemoryCategory> = {
        'Personal': MemoryCategory.PERSONAL,
        'Professional': MemoryCategory.FACT,
        'Technical': MemoryCategory.FACT,
        'Creative': MemoryCategory.PREFERENCE,
        'Important Facts': MemoryCategory.FACT,
        'Preferences': MemoryCategory.PREFERENCE,
        'Goals': MemoryCategory.FACT,
        'Other': MemoryCategory.FACT,
      }

      const category = categoryMap[memoryData.tags[0]] || MemoryCategory.FACT

      const newMemory = {
        ...enhancedMemory,
        contextualMemories: [
          ...enhancedMemory.contextualMemories,
          {
            id: segment.id,
            content: memoryData.text,
            importance: memoryData.importance,
            recency: 10,
            relevance: 8,
            category,
            timestamp: new Date(),
            relatedTopics: memoryData.tags,
            emotionalTone: "neutral" as const,
          },
        ],
      }

      setEnhancedMemory(newMemory)
    }

    // If full message was saved, mark it as selected
    if (memoryData.isFullMessage && memoryData.messageId) {
      setSelectedMessages(prev => new Set([...prev, memoryData.messageId!]))
    }

    setShowCategoryPicker(false)
    setPendingMemoryData(null)
  }

  // Handle message checkbox toggle
  const handleMessageSelect = (messageId: string, isSelected: boolean) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(messageId)
      } else {
        newSet.delete(messageId)
      }
      return newSet
    })
  }

  // Handle text selection save
  const handleTextSelectionSave = (messageId: string, selectedText: string) => {
    setPendingMemoryData({
      text: selectedText,
      messageId,
      isFullMessage: false
    })
    setShowCategoryPicker(true)
  }

  // Handle full message save
  const handleFullMessageSave = (messageId: string, content: string) => {
    setPendingMemoryData({
      text: content,
      messageId,
      isFullMessage: true
    })
    setShowCategoryPicker(true)
  }

  // Clear selected messages
  const handleClearSelection = () => {
    setSelectedMessages(new Set())
  }

  // Bulk save selected messages
  const handleBulkSave = () => {
    const selectedMessagesArray = messages.filter(msg => selectedMessages.has(msg.id))
    if (selectedMessagesArray.length === 0) return

    const combinedText = selectedMessagesArray
      .map(msg => `${msg.role === 'user' ? 'User' : soul?.data.soulName}: ${msg.content}`)
      .join('\n\n')

    setPendingMemoryData({
      text: combinedText,
      isFullMessage: true
    })
    setShowCategoryPicker(true)
  }

  // Check if message is saved
  const isMessageSaved = (messageId: string) => {
    return selectedMessages.has(messageId)
  }

  // Get saved segments for message
  const getMessageSegments = (messageId: string) => {
    return savedMemorySegments.filter(segment => segment.messageId === messageId)
  }

  // Start new chat function
  const handleStartNewChat = async () => {
    if (!soul) return

    try {
      // Archive current chat if there are messages
      if (messages.length > 0) {
        const archiveId = archiveChat(
          soul.data.pfpId,
          soul.data.soulName,
          soul.data.archetype,
          soul.data.background,
          messages,
          savedMemorySegments,
          sessionStartTime
        )
        
        console.log(`Chat archived with ID: ${archiveId}`)
      }

      // Clear current chat state
      setMessages([])
      setSelectedMessages(new Set())
      setSavedMemorySegments([])
      setSessionStartTime(new Date())

      // Reset memory state to fresh conversation
      if (memory) {
        const freshMemory = createCharacterMemory(soul.data.pfpId, soul.data.soulName)
        setMemory(freshMemory)
        setEnhancedMemory(upgradeToEnhancedMemory(freshMemory))
        setIsFirstConversation(true)
      }

      // Show success notification
      console.log("New chat started successfully")
      
    } catch (error) {
      console.error("Error starting new chat:", error)
      setError("Failed to start new chat. Please try again.")
    }
  }

  // Restore chat from archive
  const handleRestoreChat = (archivedChat: ArchivedChat) => {
    try {
      // Archive current chat if there are messages
      if (messages.length > 0) {
        archiveChat(
          soul!.data.pfpId,
          soul!.data.soulName,
          soul!.data.archetype,
          soul!.data.background,
          messages,
          savedMemorySegments,
          sessionStartTime
        )
      }

      // Restore the archived chat
      setMessages(archivedChat.messages)
      setSessionStartTime(archivedChat.sessionStart)
      setSavedMemorySegments(archivedChat.savedMemorySegments)
      
      // Note: Only purposefully saved memory goes to character memory
      // The archived chat messages don't automatically restore to memory
      setIsFirstConversation(false)

      console.log(`Chat restored: ${archivedChat.title}`)
      setShowArchiveBrowser(false)
      
    } catch (error) {
      console.error("Error restoring chat:", error)
      setError("Failed to restore chat. Please try again.")
    }
  }

  const addUserContext = (contextData: {
    content: string
    tags: string[]
    customTags: string[]
    importance: number
  }) => {
    if (!memoryProfile) return

    // Add to new unified context system
    const updatedProfile = addContextEntry(memoryProfile, {
      type: "context",
      content: contextData.content,
      tags: contextData.tags,
      customTags: contextData.customTags,
      importance: contextData.importance,
    })

    setMemoryProfile(updatedProfile)
    saveMemoryProfile(updatedProfile)

    // Also update legacy memory system for backwards compatibility
    if (enhancedMemory) {
      const newMemory = {
        ...enhancedMemory,
        contextualMemories: [
          ...enhancedMemory.contextualMemories,
          {
            id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: contextData.content,
            importance: contextData.importance || 5,
            recency: 10, // Most recent
            relevance: 8, // Assume it's relevant since user is adding it now
            category: MemoryCategory.FACT, // Default category for new context
            timestamp: new Date(),
            relatedTopics: [...contextData.tags, ...contextData.customTags],
            emotionalTone: "neutral" as const,
          },
        ],
      }

      setEnhancedMemory(newMemory)

      // Also update the base memory
      if (memory) {
        const updatedMemory = {
          ...memory,
          keyMemories: [
            ...memory.keyMemories,
            {
              id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: contextData.content,
              importance: contextData.importance || 5,
              timestamp: new Date(),
              category: "fact" as any,
            },
          ],
        }

        setMemory(updatedMemory)
        saveCharacterMemories(params.id as string, updatedMemory)
      }
    }

    // Add a system message to acknowledge the added context
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `I'll remember that ${contextData.content}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, systemMessage])
  }

  // Load chat settings from localStorage on mount
  useEffect(() => {
    if (soul?.data.pfpId) {
      const savedSettings = localStorage.getItem(`chat-settings-${soul.data.pfpId}`)
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          // Older saved settings may reference retired OpenAI/Llama models - map them to Claude
          setModel(settings.model?.startsWith("claude") ? settings.model : "claude-opus-4-8")
          setTemperature(settings.temperature || 0.7)
          setMaxTokens(settings.maxTokens || 800)
          setContextMode(settings.contextMode || "enhanced")
          setEnhancedPersonality(settings.enhancedPersonality || false)
          setResponseStyle(settings.responseStyle || "dialogue")
        } catch (e) {
          console.error('Failed to load chat settings:', e)
        }
      }
    }
  }, [soul?.data.pfpId])

  // Save chat settings to localStorage whenever they change
  const saveSettings = (newSettings: { model?: string, temperature?: number, maxTokens?: number, contextMode?: string, enhancedPersonality?: boolean, responseStyle?: string }) => {
    if (soul?.data.pfpId) {
      const currentSettings = {
        model,
        temperature,
        maxTokens,
        contextMode,
        enhancedPersonality,
        responseStyle,
        ...newSettings
      }
      localStorage.setItem(`chat-settings-${soul.data.pfpId}`, JSON.stringify(currentSettings))
    }
  }

  // Custom setters that also save to localStorage
  const setModelWithSave = (newModel: string) => {
    setModel(newModel)
    saveSettings({ model: newModel })
  }

  const setTemperatureWithSave = (newTemperature: number) => {
    setTemperature(newTemperature)
    saveSettings({ temperature: newTemperature })
  }

  const setMaxTokensWithSave = (newMaxTokens: number) => {
    setMaxTokens(newMaxTokens)
    saveSettings({ maxTokens: newMaxTokens })
  }

  const setContextModeWithSave = (newContextMode: "basic" | "enhanced") => {
    setContextMode(newContextMode)
    saveSettings({ contextMode: newContextMode })
  }

  const setEnhancedPersonalityWithSave = (newEnhancedPersonality: boolean) => {
    setEnhancedPersonality(newEnhancedPersonality)
    saveSettings({ enhancedPersonality: newEnhancedPersonality })
  }

  const setResponseStyleWithSave = (newResponseStyle: string) => {
    setResponseStyle(newResponseStyle)
    saveSettings({ responseStyle: newResponseStyle })
  }

  // Auto-update agent config whenever settings change
  useEffect(() => {
    if (soul) {
      const config = createAgentConfig(soul.data, {
        model,
        temperature,
        maxTokens,
      })
      setAgentConfig(config)
    }
  }, [soul, model, temperature, maxTokens])

  // Load soul data and initialize agent on mount
  useEffect(() => {
    const loadAndInitializeAgent = async () => {
      if (typeof window === 'undefined') return
      
      const nftId = params.id as string
      if (nftId) {
        const foundSoul = getSoulByNftId(nftId)
        setSoul(foundSoul)

        if (foundSoul) {
          // Load existing memory
          let characterMemory = getCharacterMemories(nftId)
          if (!characterMemory) {
            characterMemory = createCharacterMemory(nftId, foundSoul.data.soulName)
            setIsFirstConversation(true)
          }

          setMemory(characterMemory)
          saveCharacterMemories(nftId, characterMemory)

          // Initialize enhanced memory
          const enhanced = upgradeToEnhancedMemory(characterMemory)
          setEnhancedMemory(enhanced)

          // Get or create memory profile
          let profile = getMemoryProfile(nftId)
          if (!profile) {
            profile = createDefaultMemoryProfile(
              nftId,
              foundSoul.data,
              characterMemory,
              enhanced
            )
            saveMemoryProfile(profile)
          }
          setMemoryProfile(profile)

          // Load and set messages from memory
          const memoryMessages: Message[] = characterMemory.messages.map((msg, index) => ({
            id: `${msg.timestamp.getTime()}-${index}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          }))
          setMessages(memoryMessages)

          // Add welcome message only for first conversation
          if (characterMemory.messages.length === 0) {
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content: `Hello! I'm ${foundSoul.data.soulName}, your AI agent based on 0N1 Force #${foundSoul.data.pfpId}. I embody all the lore and personality you've created for this character. How can I help you today?`,
              timestamp: new Date(),
            }
            setMessages([welcomeMessage])

            // Add to memory
            const updatedMemory = addMessageToMemory(characterMemory, welcomeMessage)
            setMemory(updatedMemory)
            saveCharacterMemories(nftId, updatedMemory)
          }

          // Get memory stats
          const stats = getMemoryStats(nftId)
          setMemoryStats(stats)

          // Check for restore query parameter
          const urlParams = new URLSearchParams(window.location.search)
          const restoreId = urlParams.get('restore')
          if (restoreId) {
            // Load and restore the archived chat
            const allArchivedChats = getArchivedChats()
            const chatToRestore = allArchivedChats.find(chat => chat.id === restoreId)
            if (chatToRestore) {
              handleRestoreChat(chatToRestore)
              // Clean up URL parameter
              window.history.replaceState({}, '', window.location.pathname)
            }
          }

          // Agent config will be created automatically by the settings useEffect
        }
      }
    }
    
    loadAndInitializeAgent()
    setIsInitializing(false)
  }, [params.id]) // Removed model, temperature, maxTokens dependencies since they're handled separately now

  // Ownership verification effect
  useEffect(() => {
    // Wait until the wallet connection has been restored from localStorage,
    // otherwise a hard page load always redirects before the wallet hydrates
    if (walletInitializing) return

    const verifyOwnership = async () => {
      const nftId = params.id as string

      // First check if wallet is connected
      if (!isConnected || !address) {
        // Redirect to homepage with connection prompt
        router.push("/?connect=true")
        return
      }

      // Check NFT ownership
      try {
        const owns = await verifyNftOwnership(address, nftId)
        setOwnershipVerified(owns)
        
        if (!owns) {
          // User doesn't own this NFT
          setError(createOwnershipError(nftId))
        }
      } catch (error) {
        console.error("Ownership verification failed:", error)
        setOwnershipVerified(false)
        setError("Unable to verify NFT ownership. Please try again.")
      }
    }

    // Only verify if we have the necessary data
    if (params.id) {
      verifyOwnership()
    }
  }, [params.id, isConnected, address, router, walletInitializing])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !agentConfig || isLoading || !memory || ownershipVerified !== true) return
    
    // Check usage limits before sending
    if (!canUseFeature('messages')) {
      setError("Daily message limit reached. Try again tomorrow.")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    // Add to memory
    let updatedMemory = addMessageToMemory(memory, userMessage)
    setMemory(updatedMemory)
    saveCharacterMemories(params.id as string, updatedMemory)

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Prompt is built server-side in /api/ai-chat from memoryProfile + shared canon guardrails.
      // Do not compute a client systemPrompt here — it was never sent (zombie path removed).
      const characterMemoryProfile = {
        characterData: {
          ...soul!.data,
          personalitySettings: soul!.data.personalitySettings
        },
        conversationMemory: updatedMemory,
        overview: {
          relationshipLevel: memoryStats?.relationshipScore || 0,
          totalInteractions: memoryStats?.totalMessages || 0,
          lastActivity: new Date().toISOString()
        }
      }

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          nftId: params.id,
          memoryProfile: characterMemoryProfile,
          enhancedPersonality: enhancedPersonality,
          responseStyle: responseStyle,
          // Top-level wallet so sample daily caps and wallet caps see the same field
          walletAddress: address,
        }),
      })

      // Update usage tracking from response headers
      updateUsage(response.headers)

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle specific error types
        if (response.status === 429) {
          if (errorData.dailyLimits) {
            setError("daily_limit:" + JSON.stringify(errorData))
          } else {
            setError("rate_limit:" + JSON.stringify(errorData))
          }
        } else {
          setError("api_error:" + (errorData.error || "Failed to get response"))
        }
        return
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date(),
      }

      // Add assistant message to memory
      updatedMemory = addMessageToMemory(updatedMemory, assistantMessage)
      setMemory(updatedMemory)
      saveCharacterMemories(params.id as string, updatedMemory)

      // Update enhanced memory
      if (enhancedMemory) {
        const updatedEnhanced = upgradeToEnhancedMemory(updatedMemory)
        setEnhancedMemory(updatedEnhanced)
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update memory stats
      const stats = getMemoryStats(params.id as string)
      setMemoryStats(stats)
    } catch (error: any) {
      console.error("Error sending message:", error)
      setError(error.message || "Failed to communicate with the AI agent")

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

  const copyAgentUrl = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Ownership verification check
  if (ownershipVerified === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-red-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center">
              <span className="text-red-400 text-2xl">🔒</span>
            </div>
            <p className="text-xl text-red-300 mb-4">Access Denied</p>
            <p className="text-muted-foreground mb-6 max-w-md">
              You don't own 0N1 Force #{params.id}. You can only access characters you own.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/souls")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Back to Your Souls
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/?connect=true")}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
              >
                Connect Different Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Still verifying ownership
  if (ownershipVerified === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-purple-300 mb-2">Verifying NFT Ownership</p>
            <p className="text-muted-foreground text-sm">Checking if you own 0N1 Force #{params.id}...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!soul) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <p className="text-xl text-purple-300 mb-6">Soul not found</p>
            <Button
              onClick={() => router.push("/souls")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Back to Souls
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const contextProviderComponent = (
    <ContextProvider 
      onAddContext={addUserContext}
      existingTags={memoryProfile ? getAllTags(memoryProfile) : []}
      pinnedTags={memoryProfile ? memoryProfile.contextNotes.tagManagement.pinnedTags : []}
    />
  )

  const handleSettings = () => {
    setShowSettings(true)
  }

  const handleArchive = () => {
    setShowArchiveBrowser(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <UnifiedSoulHeader 
        soul={soul}
        contextProviderComponent={contextProviderComponent}
        onSettings={handleSettings}
        onArchive={handleArchive}
      />

      {/* Hidden Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="border border-purple-500/30 bg-black/90 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Agent Settings</DialogTitle>
            <DialogDescription>Customize your AI agent's behavior and responses.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={setModelWithSave}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-opus-4-8">Claude Opus 4.8 (Recommended)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All conversations are powered by Claude via your Anthropic API key
              </p>
            </div>

            <div className="space-y-2">
              <Label>Temperature: {temperature}</Label>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperatureWithSave(value[0])}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values make responses more creative, lower values more focused.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens: {maxTokens}</Label>
              <Slider
                value={[maxTokens]}
                onValueChange={(value) => setMaxTokensWithSave(value[0])}
                max={2000}
                min={100}
                step={100}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Maximum length of responses.</p>
            </div>

            <div className="space-y-2">
              <Label>Context Mode</Label>
              <Select
                value={contextMode}
                onValueChange={(value) => setContextModeWithSave(value as "basic" | "enhanced")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="enhanced">Enhanced (Recommended)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Enhanced mode provides better context awareness and memory.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enhanced-personality">Enhanced Personality Mode</Label>
                <Switch
                  id="enhanced-personality"
                  checked={enhancedPersonality}
                  onCheckedChange={setEnhancedPersonalityWithSave}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enables more authentic, aggressive, and uncensored character personalities. Use for edgy or confrontational characters.
              </p>
              {enhancedPersonality && (
                <div className="text-xs text-orange-400 bg-orange-900/20 border border-orange-500/30 rounded p-2">
                  ⚠️ Enhanced mode may produce more explicit, aggressive, or confrontational responses suitable for mature audiences.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Response Style</Label>
              <Select value={responseStyle} onValueChange={setResponseStyleWithSave}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dialogue">💬 Dialogue Only</SelectItem>
                  <SelectItem value="narrative">📖 Narrative Style</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {responseStyle === "dialogue" 
                  ? "Focus on direct speech and conversation without physical descriptions." 
                  : "Include physical actions, body language, and scene descriptions."}
              </p>
            </div>

            <div className="text-xs text-green-400 bg-green-900/20 border border-green-500/30 rounded p-2 mt-4">
              ✓ Settings are automatically saved and applied
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 min-h-screen flex flex-col">
        {/* Character Info & Usage Tracking */}
        <div className="mb-4 space-y-3">
          {/* NO CHARACTER SUMMARIES OR PREVIEW SECTIONS */}
          {/* All character preview content has been completely removed */}
          


          {/* Usage Indicator - Primary Display */}
          <UsageIndicator 
            usage={usage} 
            compact={false}
            showWarnings={true}
            className=""
          />
          

        </div>

        {/* Additional Smart Warnings (if not already shown in Usage Indicator) */}
        {getWarningMessage() && !address && (
          <div className="mb-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-300 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{getWarningMessage()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error Message */}
        {error && (
          <div className="mb-4">
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
                onRetry={() => setError(null)}
              />
            ) : error.startsWith('rate_limit:') ? (
              <ErrorMessage
                error="You're sending messages too quickly"
                type="rate_limit"
                onRetry={() => setError(null)}
              />
            ) : error.startsWith('api_error:') ? (
              <ErrorMessage
                error={error.replace('api_error:', '')}
                type="api_error"
                onRetry={() => setError(null)}
              />
            ) : (
              <ErrorMessage
                error={error}
                type="general"
                onRetry={() => setError(null)}
              />
            )}
          </div>
        )}

        {/* Chat Interface - Now Much More Prominent */}
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-400" />
                Chat with {soul.data.soulName}
              </CardTitle>
              
              {/* Start New Chat Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartNewChat}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full">
            <ScrollArea className="flex-1 min-h-[60vh] px-4">
              <div className="space-y-4 pb-4 pt-4">
                {messages.map((message) => (
                  <EnhancedChatMessage
                    key={message.id}
                    message={message}
                    isSelected={selectedMessages.has(message.id)}
                    onSelectionChange={(messageId: string, selected: boolean) => handleMessageSelect(messageId, selected)}
                    onSaveToMemory={(text: string, messageId: string) => {
                      if (text === message.content) {
                        handleFullMessageSave(messageId, text)
                      } else {
                        handleTextSelectionSave(messageId, text)
                      }
                    }}
                    savedSegments={getMessageSegments(message.id).map(segment => ({
                      start: segment.startIndex,
                      end: segment.endIndex,
                      id: segment.id
                    }))}
                    isMemorySaved={isMessageSaved(message.id)}
                    characterImageUrl={soul?.data.imageUrl}
                  />
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-muted">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator className="mt-auto" />

            {/* Input */}
            <div className="p-4 bg-black/40">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${soul.data.soulName}...`}
                  className="flex-1 bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Panel */}
      {showMemoryPanel && enhancedMemory && (
        <div className="fixed right-0 top-0 h-screen w-80 bg-black/90 border-l border-purple-500/30 backdrop-blur-sm z-50 overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Memory System
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowMemoryPanel(false)}>
                ✕
              </Button>
            </div>

            <Tabs defaultValue="relevant">
              <TabsList className="w-full">
                <TabsTrigger value="relevant">Relevant</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="important">Important</TabsTrigger>
              </TabsList>

              <TabsContent value="relevant">
                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Most Relevant to Current Conversation</h4>
                  {enhancedMemory.contextualMemories
                    .sort((a, b) => b.relevance - a.relevance)
                    .slice(0, 5)
                    .map((memory) => (
                      <div key={memory.id} className="p-2 rounded bg-purple-900/20 border border-purple-500/30 text-xs">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="mb-1">
                            {memory.category}
                          </Badge>
                          <span className="text-purple-300">Relevance: {memory.relevance}/10</span>
                        </div>
                        <p>{memory.content}</p>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="recent">
                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Recent Memories</h4>
                  {enhancedMemory.contextualMemories
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .slice(0, 5)
                    .map((memory) => (
                      <div key={memory.id} className="p-2 rounded bg-purple-900/20 border border-purple-500/30 text-xs">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="mb-1">
                            {memory.category}
                          </Badge>
                          <span className="text-purple-300">{new Date(memory.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p>{memory.content}</p>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="important">
                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Important Memories</h4>
                  {enhancedMemory.contextualMemories
                    .sort((a, b) => b.importance - a.importance)
                    .slice(0, 5)
                    .map((memory) => (
                      <div key={memory.id} className="p-2 rounded bg-purple-900/20 border border-purple-500/30 text-xs">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="mb-1">
                            {memory.category}
                          </Badge>
                          <span className="text-purple-300">Importance: {memory.importance}/10</span>
                        </div>
                        <p>{memory.content}</p>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Conversation Threads</h4>
              {Object.values(enhancedMemory.conversationThreads).length > 0 ? (
                <div className="space-y-2">
                  {Object.values(enhancedMemory.conversationThreads)
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 3)
                    .map((thread) => (
                      <div key={thread.id} className="p-2 rounded bg-purple-900/20 border border-purple-500/30 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{thread.title}</span>
                          <Clock className="h-3 w-3 text-purple-300" />
                        </div>
                        <p className="mt-1 text-muted-foreground">{thread.summary}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No conversation threads yet</p>
              )}
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">User Profile</h4>
              <div className="p-2 rounded bg-purple-900/20 border border-purple-500/30 text-xs">
                {memory?.userProfile.name ? (
                  <p>
                    <span className="font-medium">Name:</span> {memory.userProfile.name}
                  </p>
                ) : (
                  <p className="text-muted-foreground">Name unknown</p>
                )}

                {memory?.userProfile.preferences && memory.userProfile.preferences.length > 0 ? (
                  <>
                    <p className="font-medium mt-1">Preferences:</p>
                    <ul className="list-disc list-inside">
                      {memory.userProfile.preferences.slice(0, 3).map((pref, i) => (
                        <li key={i} className="text-muted-foreground">
                          {pref}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-muted-foreground mt-1">No preferences recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Explorer */}
      {showContextExplorer && enhancedMemory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[80vh]">
            <ContextExplorer
              memory={enhancedMemory}
              characterData={soul.data}
              onClose={() => setShowContextExplorer(false)}
            />
          </div>
        </div>
      )}

      {/* Memory Category Picker Modal */}
      {showCategoryPicker && pendingMemoryData && (
        <MemoryCategoryPicker
          isOpen={showCategoryPicker}
          onClose={() => {
            setShowCategoryPicker(false)
            setPendingMemoryData(null)
          }}
          onSave={(data) => {
            handleSaveMemory({
              text: data.text,
              tags: [data.category, ...data.tags],
              importance: data.importance,
              messageId: pendingMemoryData.messageId,
              isFullMessage: pendingMemoryData.isFullMessage
            })
          }}
          selectedText={pendingMemoryData.text}
          existingTags={savedMemorySegments.flatMap(segment => segment.tags)}
        />
      )}

      {/* Bulk Action Bar */}
      {selectedMessages.size > 0 && (
        <BulkActionBar
          selectedCount={selectedMessages.size}
          onClearSelection={handleClearSelection}
          onBulkSave={handleBulkSave}
        />
      )}

      {/* Chat Archive Browser */}
      <ChatArchiveBrowser
        isOpen={showArchiveBrowser}
        onClose={() => setShowArchiveBrowser(false)}
        onRestoreChat={handleRestoreChat}
        currentCharacterId={soul?.data.pfpId}
      />
    </div>
  )
}
