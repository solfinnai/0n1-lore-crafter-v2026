// Chat Archive System - Global storage with Supabase migration support

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

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

export interface ArchivedChat {
  id: string
  characterId: string // pfpId
  characterName: string
  characterArchetype: string
  characterBackground: string
  userId?: string // for future multi-user support
  
  // Session metadata
  sessionStart: Date
  sessionEnd: Date
  messageCount: number
  conversationDuration: number // in minutes
  
  // Content
  title: string // Auto-generated, user-editable
  summary: string // AI-generated summary
  keyTopics: string[]
  messages: Message[]
  savedMemorySegments: SavedMemorySegment[]
  memorySegmentCount: number
  
  // Analytics metadata
  metadata: {
    totalTokens?: number
    averageResponseTime?: number
    userEngagementScore?: number // calculated metric
    characterConsistencyScore?: number // for character analysis
    conversationQuality?: number // AI-evaluated
    platform: string // "web" for now
    version: string // app version
  }
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastAccessedAt?: Date
}

// User behavior tracking (for cross-character analysis)
export interface UserBehaviorMetrics {
  userId?: string
  totalChats: number
  totalMessages: number
  averageSessionDuration: number
  favoriteCharacterTypes: string[]
  conversationPatterns: {
    peakHours: number[]
    preferredTopics: string[]
    averageMessagesPerSession: number
  }
  lastUpdated: Date
}

// Character development insights
export interface CharacterInsights {
  characterId: string
  characterName: string
  
  // Performance metrics
  totalChats: number
  averageSessionDuration: number
  userRetentionRate: number
  averageUserSatisfaction: number
  
  // Conversation analysis
  commonTopics: string[]
  conversationStarters: string[]
  userPreferences: string[]
  developmentAreas: string[]
  
  // Character consistency
  personalityConsistency: number
  loreAdherence: number
  responseQuality: number
  
  lastUpdated: Date
}

const ARCHIVE_STORAGE_KEY = "oni-chat-archives"
const USER_METRICS_KEY = "oni-user-metrics"
const CHARACTER_INSIGHTS_KEY = "oni-character-insights"

// Auto-generate chat title using AI-like logic (simplified for now)
export function generateChatTitle(messages: Message[]): string {
  if (messages.length === 0) return "Empty Chat"
  
  // Get first few user messages for context
  const userMessages = messages
    .filter(m => m.role === "user")
    .slice(0, 3)
    .map(m => m.content)
  
  if (userMessages.length === 0) return "System Chat"
  
  // Simple title generation (can be enhanced with actual AI later)
  const firstMessage = userMessages[0].toLowerCase()
  
  // Common conversation starters
  if (firstMessage.includes("hello") || firstMessage.includes("hi")) {
    return "Introduction & Greetings"
  }
  if (firstMessage.includes("tell me about")) {
    return "Character Exploration"
  }
  if (firstMessage.includes("what") && firstMessage.includes("?")) {
    return "Q&A Session"
  }
  if (firstMessage.includes("story") || firstMessage.includes("adventure")) {
    return "Storytelling Session"
  }
  if (firstMessage.includes("help") || firstMessage.includes("advice")) {
    return "Help & Guidance"
  }
  
  // Extract key topics from first message
  const words = firstMessage.split(" ").filter(w => w.length > 3)
  if (words.length > 0) {
    const keyWord = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    return `Discussion about ${keyWord}`
  }
  
  // Fallback with timestamp
  const date = new Date().toLocaleDateString()
  return `Chat from ${date}`
}

// Generate AI summary of conversation
export function generateChatSummary(messages: Message[], maxLength: number = 150): string {
  if (messages.length === 0) return "No messages in this conversation."
  
  // Get key messages
  const userMessages = messages.filter(m => m.role === "user")
  const assistantMessages = messages.filter(m => m.role === "assistant")
  
  if (userMessages.length === 0) return "System messages only."
  
  // Simple summarization (can be enhanced with actual AI later)
  const topics: string[] = []
  const firstUserMessage = userMessages[0].content
  const lastUserMessage = userMessages[userMessages.length - 1].content
  
  // Extract topics
  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase()
    if (content.includes("story")) topics.push("storytelling")
    if (content.includes("question")) topics.push("Q&A")
    if (content.includes("help")) topics.push("assistance")
    if (content.includes("character") || content.includes("personality")) topics.push("character development")
    if (content.includes("adventure") || content.includes("quest")) topics.push("adventure")
  })
  
  const uniqueTopics = [...new Set(topics)]
  const topicsStr = uniqueTopics.length > 0 ? uniqueTopics.join(", ") : "general conversation"
  
  const summary = `${messages.length} message conversation covering ${topicsStr}. Started with "${firstUserMessage.slice(0, 50)}..." and discussed various topics with the character.`
  
  return summary.length > maxLength ? summary.slice(0, maxLength) + "..." : summary
}

// Extract key topics from conversation
export function extractKeyTopics(messages: Message[]): string[] {
  const topics = new Set<string>()
  
  messages.forEach(msg => {
    const content = msg.content.toLowerCase()
    
    // Common conversation topics
    if (content.includes("story") || content.includes("tale")) topics.add("storytelling")
    if (content.includes("adventure") || content.includes("quest")) topics.add("adventure")
    if (content.includes("character") || content.includes("personality")) topics.add("character development")
    if (content.includes("help") || content.includes("advice")) topics.add("assistance")
    if (content.includes("question") || content.includes("ask")) topics.add("Q&A")
    if (content.includes("power") || content.includes("ability")) topics.add("abilities")
    if (content.includes("background") || content.includes("history")) topics.add("backstory")
    if (content.includes("relationship") || content.includes("friend")) topics.add("relationships")
    if (content.includes("goal") || content.includes("objective")) topics.add("goals")
    if (content.includes("memory") || content.includes("remember")) topics.add("memory")
  })
  
  return Array.from(topics)
}

// Calculate user engagement score
export function calculateEngagementScore(messages: Message[], duration: number): number {
  if (messages.length === 0 || duration === 0) return 0
  
  const userMessages = messages.filter(m => m.role === "user")
  const avgUserMessageLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length
  const messagesPerMinute = messages.length / duration
  const conversationBalance = Math.min(userMessages.length, messages.length - userMessages.length) / Math.max(userMessages.length, messages.length - userMessages.length, 1)
  
  // Normalize to 0-10 scale
  const lengthScore = Math.min(avgUserMessageLength / 100, 3) // 0-3 points for message length
  const frequencyScore = Math.min(messagesPerMinute * 2, 4) // 0-4 points for frequency
  const balanceScore = conversationBalance * 3 // 0-3 points for conversation balance
  
  return Math.round((lengthScore + frequencyScore + balanceScore) * 10) / 10
}

// Get all archived chats
export function getArchivedChats(): ArchivedChat[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY)
    if (!stored) return []
    
    const chats = JSON.parse(stored)
    // Convert date strings back to Date objects
    return chats.map((chat: any) => ({
      ...chat,
      sessionStart: new Date(chat.sessionStart),
      sessionEnd: new Date(chat.sessionEnd),
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      lastAccessedAt: chat.lastAccessedAt ? new Date(chat.lastAccessedAt) : undefined,
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      savedMemorySegments: chat.savedMemorySegments.map((seg: any) => ({
        ...seg,
        timestamp: new Date(seg.timestamp)
      }))
    }))
  } catch (error) {
    console.error("Error loading archived chats:", error)
    return []
  }
}

// Archive a chat session
export function archiveChat(
  characterId: string,
  characterName: string,
  characterArchetype: string,
  characterBackground: string,
  messages: Message[],
  savedMemorySegments: SavedMemorySegment[],
  sessionStart: Date,
  customTitle?: string
): string {
  const now = new Date()
  const duration = (now.getTime() - sessionStart.getTime()) / (1000 * 60) // minutes
  
  const archivedChat: ArchivedChat = {
    id: `chat_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
    characterId,
    characterName,
    characterArchetype,
    characterBackground,
    
    sessionStart,
    sessionEnd: now,
    messageCount: messages.length,
    conversationDuration: Math.round(duration * 10) / 10,
    
    title: customTitle || generateChatTitle(messages),
    summary: generateChatSummary(messages),
    keyTopics: extractKeyTopics(messages),
    messages: messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })),
    savedMemorySegments,
    memorySegmentCount: savedMemorySegments.length,
    
    metadata: {
      totalTokens: messages.reduce((sum, msg) => sum + msg.content.length, 0), // rough estimate
      userEngagementScore: calculateEngagementScore(messages, duration),
      platform: "web",
      version: "1.0.0"
    },
    
    createdAt: now,
    updatedAt: now
  }
  
  // Store the archived chat
  const existingChats = getArchivedChats()
  const updatedChats = [...existingChats, archivedChat]
  
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updatedChats))
    
    // Update analytics
    updateUserMetrics(archivedChat)
    updateCharacterInsights(archivedChat)
    
    return archivedChat.id
  } catch (error) {
    console.error("Error archiving chat:", error)
    throw new Error("Failed to archive chat")
  }
}

// Update chat title
export function updateChatTitle(chatId: string, newTitle: string): boolean {
  const chats = getArchivedChats()
  const chatIndex = chats.findIndex(chat => chat.id === chatId)
  
  if (chatIndex === -1) return false
  
  chats[chatIndex].title = newTitle
  chats[chatIndex].updatedAt = new Date()
  
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(chats))
    return true
  } catch (error) {
    console.error("Error updating chat title:", error)
    return false
  }
}

// Get chat by ID
export function getArchivedChat(chatId: string): ArchivedChat | null {
  const chats = getArchivedChats()
  const chat = chats.find(chat => chat.id === chatId)
  
  if (chat) {
    // Update last accessed timestamp
    chat.lastAccessedAt = new Date()
    updateArchivedChat(chat)
  }
  
  return chat || null
}

// Update an archived chat
export function updateArchivedChat(updatedChat: ArchivedChat): boolean {
  const chats = getArchivedChats()
  const chatIndex = chats.findIndex(chat => chat.id === updatedChat.id)
  
  if (chatIndex === -1) return false
  
  chats[chatIndex] = { ...updatedChat, updatedAt: new Date() }
  
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(chats))
    return true
  } catch (error) {
    console.error("Error updating archived chat:", error)
    return false
  }
}

// Delete archived chat
export function deleteArchivedChat(chatId: string): boolean {
  const chats = getArchivedChats()
  const filteredChats = chats.filter(chat => chat.id !== chatId)
  
  if (filteredChats.length === chats.length) return false // Nothing deleted
  
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(filteredChats))
    return true
  } catch (error) {
    console.error("Error deleting archived chat:", error)
    return false
  }
}

// Get chats for specific character
export function getCharacterChats(characterId: string): ArchivedChat[] {
  return getArchivedChats().filter(chat => chat.characterId === characterId)
}

// Search archived chats
export function searchArchivedChats(query: string): ArchivedChat[] {
  const chats = getArchivedChats()
  const lowerQuery = query.toLowerCase()
  
  return chats.filter(chat => 
    chat.title.toLowerCase().includes(lowerQuery) ||
    chat.summary.toLowerCase().includes(lowerQuery) ||
    chat.characterName.toLowerCase().includes(lowerQuery) ||
    chat.keyTopics.some(topic => topic.toLowerCase().includes(lowerQuery)) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
  )
}

// Analytics functions (for future backend analysis)
function updateUserMetrics(chat: ArchivedChat) {
  // Implementation for user behavior tracking
  // This will be expanded for backend analysis
}

function updateCharacterInsights(chat: ArchivedChat) {
  // Implementation for character development insights
  // This will be expanded for backend analysis
}

// Export for Supabase migration
export function exportChatData(): {
  chats: ArchivedChat[]
  userMetrics: any
  characterInsights: any
} {
  return {
    chats: getArchivedChats(),
    userMetrics: typeof window !== "undefined" ? localStorage.getItem(USER_METRICS_KEY) : null,
    characterInsights: typeof window !== "undefined" ? localStorage.getItem(CHARACTER_INSIGHTS_KEY) : null
  }
} 