export interface ConversationMemory {
  id: string
  nftId: string
  characterName: string
  createdAt: Date
  lastUpdated: Date
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }>
  keyMemories: Array<{
    id: string
    content: string
    importance: number
    timestamp: Date
    category: "personal" | "relationship" | "event" | "preference" | "fact"
  }>
  userProfile: {
    name?: string
    preferences: string[]
    relationshipNotes: string[]
    importantTopics: string[]
  }
}

export interface MemorySummary {
  recentInteractions: string
  keyRelationshipFacts: string
  userPreferences: string
  importantEvents: string
  ongoingTopics: string
}

// Storage keys
const MEMORY_STORAGE_KEY = "ai_agent_memories"
const CONVERSATION_STORAGE_KEY = "ai_agent_conversations"

// Get all memories for a character
export function getCharacterMemories(nftId: string): ConversationMemory | null {
  try {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY)
    if (!stored) return null

    const memories: Record<string, ConversationMemory> = JSON.parse(stored)
    const memory = memories[nftId]

    if (memory) {
      // Parse dates
      memory.createdAt = new Date(memory.createdAt)
      memory.lastUpdated = new Date(memory.lastUpdated)
      memory.messages = memory.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
      memory.keyMemories = memory.keyMemories.map((mem) => ({
        ...mem,
        timestamp: new Date(mem.timestamp),
      }))
    }

    return memory || null
  } catch (error) {
    console.error("Error loading character memories:", error)
    return null
  }
}

// Save character memories
export function saveCharacterMemories(nftId: string, memory: ConversationMemory): void {
  try {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY)
    const memories: Record<string, ConversationMemory> = stored ? JSON.parse(stored) : {}

    memories[nftId] = {
      ...memory,
      lastUpdated: new Date(),
    }

    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories))
  } catch (error) {
    console.error("Error saving character memories:", error)
  }
}

// Create new memory for character
export function createCharacterMemory(nftId: string, characterName: string): ConversationMemory {
  return {
    id: `memory_${nftId}_${Date.now()}`,
    nftId,
    characterName,
    createdAt: new Date(),
    lastUpdated: new Date(),
    messages: [],
    keyMemories: [],
    userProfile: {
      preferences: [],
      relationshipNotes: [],
      importantTopics: [],
    },
  }
}

// Add message to memory
export function addMessageToMemory(
  memory: ConversationMemory,
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  },
): ConversationMemory {
  const updatedMemory = {
    ...memory,
    messages: [...memory.messages, message],
    lastUpdated: new Date(),
  }

  // Extract key information from the conversation
  if (message.role === "user") {
    extractKeyMemories(updatedMemory, message.content)
  }

  // Keep only last 50 messages to prevent storage bloat
  if (updatedMemory.messages.length > 50) {
    updatedMemory.messages = updatedMemory.messages.slice(-50)
  }

  return updatedMemory
}

// Extract key memories from user messages
function extractKeyMemories(memory: ConversationMemory, userMessage: string): void {
  const message = userMessage.toLowerCase()

  // Extract name mentions
  const namePatterns = [/my name is (\w+)/, /i'm (\w+)/, /call me (\w+)/, /i am (\w+)/]

  for (const pattern of namePatterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      memory.userProfile.name = match[1]
      addKeyMemory(memory, `User's name is ${match[1]}`, "personal", 9)
      break
    }
  }

  // Extract preferences
  const preferencePatterns = [
    /i like (.+)/,
    /i love (.+)/,
    /i enjoy (.+)/,
    /i prefer (.+)/,
    /i hate (.+)/,
    /i don't like (.+)/,
  ]

  for (const pattern of preferencePatterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      const preference = match[1].split(/[.!?]/)[0] // Get first sentence
      memory.userProfile.preferences.push(preference)
      addKeyMemory(memory, `User ${match[0]}`, "preference", 7)
      break
    }
  }

  // Extract important topics or events
  const importantPatterns = [/remember that/, /important to know/, /don't forget/, /keep in mind/]

  for (const pattern of importantPatterns) {
    if (message.includes(pattern.source.replace(/\//g, ""))) {
      addKeyMemory(memory, userMessage, "fact", 8)
      break
    }
  }
}

// Add a key memory
function addKeyMemory(
  memory: ConversationMemory,
  content: string,
  category: "personal" | "relationship" | "event" | "preference" | "fact",
  importance: number,
): void {
  const keyMemory = {
    id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    importance,
    timestamp: new Date(),
    category,
  }

  memory.keyMemories.push(keyMemory)

  // Keep only top 20 most important memories
  memory.keyMemories.sort((a, b) => b.importance - a.importance)
  if (memory.keyMemories.length > 20) {
    memory.keyMemories = memory.keyMemories.slice(0, 20)
  }
}

// Generate memory summary for AI context
export function generateMemorySummary(memory: ConversationMemory): MemorySummary {
  const recentMessages = memory.messages.slice(-6) // Last 6 messages
  const recentInteractions = recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")

  const personalMemories = memory.keyMemories.filter((m) => m.category === "personal")
  const relationshipMemories = memory.keyMemories.filter((m) => m.category === "relationship")
  const preferenceMemories = memory.keyMemories.filter((m) => m.category === "preference")
  const eventMemories = memory.keyMemories.filter((m) => m.category === "event")
  const factMemories = memory.keyMemories.filter((m) => m.category === "fact")

  return {
    recentInteractions: recentInteractions || "No recent interactions",
    keyRelationshipFacts:
      [
        memory.userProfile.name ? `User's name: ${memory.userProfile.name}` : "",
        ...personalMemories.map((m) => m.content),
        ...relationshipMemories.map((m) => m.content),
      ]
        .filter(Boolean)
        .join("; ") || "No relationship information yet",
    userPreferences:
      [...memory.userProfile.preferences, ...preferenceMemories.map((m) => m.content)].join("; ") ||
      "No known preferences",
    importantEvents: eventMemories.map((m) => m.content).join("; ") || "No significant events recorded",
    ongoingTopics: factMemories.map((m) => m.content).join("; ") || "No ongoing topics",
  }
}

// Generate memory-aware system prompt
export function generateMemoryAwarePrompt(
  baseSystemPrompt: string,
  memorySummary: MemorySummary,
  isFirstConversation: boolean,
): string {
  if (isFirstConversation) {
    return `${baseSystemPrompt}

## CONVERSATION CONTEXT
This is your first conversation with this user. Be welcoming and introduce yourself naturally while staying in character.`
  }

  return `${baseSystemPrompt}

## MEMORY & RELATIONSHIP CONTEXT
You have an ongoing relationship with this user. Use the following information to maintain continuity and build upon your shared history:

**Recent Conversation Context:**
${memorySummary.recentInteractions}

**What You Know About This User:**
${memorySummary.keyRelationshipFacts}

**User's Preferences & Interests:**
${memorySummary.userPreferences}

**Important Events & Facts:**
${memorySummary.importantEvents}

**Ongoing Topics:**
${memorySummary.ongoingTopics}

## MEMORY INSTRUCTIONS
- Reference relevant past conversations naturally
- Remember the user's name and use it appropriately
- Build upon previous topics and shared experiences
- Show growth in your relationship over time
- If the user mentions something important, acknowledge that you'll remember it
- Be consistent with what you've learned about the user
- Don't repeat information unnecessarily, but show that you remember

Remember: You have a history with this user. Act like you know them based on your shared conversations.`
}

// Clear all memories (for testing/reset)
export function clearAllMemories(): void {
  localStorage.removeItem(MEMORY_STORAGE_KEY)
}

// Get memory statistics
export function getMemoryStats(nftId: string): {
  totalMessages: number
  totalMemories: number
  relationshipDuration: string
  lastInteraction: string
} | null {
  const memory = getCharacterMemories(nftId)
  if (!memory) return null

  const now = new Date()
  const daysSinceCreation = Math.floor((now.getTime() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const daysSinceLastUpdate = Math.floor((now.getTime() - memory.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))

  return {
    totalMessages: memory.messages.length,
    totalMemories: memory.keyMemories.length,
    relationshipDuration: daysSinceCreation === 0 ? "Today" : `${daysSinceCreation} days`,
    lastInteraction: daysSinceLastUpdate === 0 ? "Today" : `${daysSinceLastUpdate} days ago`,
  }
}
