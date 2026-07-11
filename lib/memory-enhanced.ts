import type { ConversationMemory, MemorySummary } from "./memory"

// Enhanced memory categorization
export enum MemoryCategory {
  PERSONAL = "personal",
  RELATIONSHIP = "relationship",
  EVENT = "event",
  PREFERENCE = "preference",
  FACT = "fact",
  EMOTIONAL = "emotional",
  NARRATIVE = "narrative",
}

// Enhanced memory structure with importance scoring
export interface EnhancedMemory extends ConversationMemory {
  contextualMemories: Array<{
    id: string
    content: string
    importance: number
    recency: number // 0-10 scale, 10 being most recent
    relevance: number // Dynamically calculated based on current conversation
    category: MemoryCategory
    timestamp: Date
    relatedTopics: string[]
    emotionalTone?: "positive" | "negative" | "neutral"
  }>
  conversationThreads: Record<
    string,
    {
      id: string
      title: string
      summary: string
      lastUpdated: Date
      messageIds: string[]
    }
  >
  worldKnowledge: Array<{
    id: string
    topic: string
    content: string
    source: "user" | "lore"
    timestamp: Date
  }>
}

// Calculate memory relevance to current conversation
export function calculateMemoryRelevance(
  memory: EnhancedMemory,
  currentMessages: Array<{ role: string; content: string }>,
  recentMessageCount = 3,
): EnhancedMemory {
  // Get the most recent messages for context
  const recentMessages = currentMessages.slice(-recentMessageCount)
  const recentContent = recentMessages
    .map((m) => m.content)
    .join(" ")
    .toLowerCase()

  // Update relevance scores for each memory
  const updatedMemories = memory.contextualMemories.map((mem) => {
    // Simple relevance calculation based on keyword matching
    // In a production system, you might use embeddings or more sophisticated NLP
    const keywords = [...mem.relatedTopics, ...mem.content.toLowerCase().split(/\s+/)]
    const matchCount = keywords.filter((word) => word.length > 3 && recentContent.includes(word.toLowerCase())).length

    return {
      ...mem,
      relevance: Math.min(10, matchCount * 2), // Scale from 0-10
    }
  })

  return {
    ...memory,
    contextualMemories: updatedMemories,
  }
}

// Generate a more nuanced memory summary
export function generateEnhancedMemorySummary(memory: EnhancedMemory): MemorySummary & {
  emotionalContext: string
  narrativeThreads: string
  worldContext: string
  relevantMemories: string
} {
  // Get base summary
  const baseSummary = {
    recentInteractions: memory.messages
      .slice(-6)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n"),
    keyRelationshipFacts: memory.keyMemories
      .filter((m) => [MemoryCategory.PERSONAL, MemoryCategory.RELATIONSHIP].includes(m.category as MemoryCategory))
      .map((m) => m.content)
      .join("; "),
    userPreferences: memory.keyMemories
      .filter((m) => m.category === MemoryCategory.PREFERENCE)
      .map((m) => m.content)
      .join("; "),
    importantEvents: memory.keyMemories
      .filter((m) => m.category === MemoryCategory.EVENT)
      .map((m) => m.content)
      .join("; "),
    ongoingTopics: memory.keyMemories
      .filter((m) => m.category === MemoryCategory.FACT)
      .map((m) => m.content)
      .join("; "),
  }

  // Add enhanced context
  return {
    ...baseSummary,
    emotionalContext:
      memory.contextualMemories
        .filter((m) => m.category === MemoryCategory.EMOTIONAL && m.importance > 5)
        .map((m) => m.content)
        .join("; ") || "No emotional context recorded",
    narrativeThreads:
      Object.values(memory.conversationThreads || {})
        .slice(0, 3)
        .map((t) => `${t.title}: ${t.summary}`)
        .join("; ") || "No narrative threads established",
    worldContext:
      memory.worldKnowledge
        .slice(0, 5)
        .map((k) => `${k.topic}: ${k.content}`)
        .join("; ") || "No world knowledge established",
    relevantMemories:
      memory.contextualMemories
        .filter((m) => m.relevance > 7)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5)
        .map((m) => m.content)
        .join("; ") || "No highly relevant memories",
  }
}

// Extract conversation threads from messages
export function extractConversationThreads(memory: EnhancedMemory): Record<string, any> {
  // This would use more sophisticated NLP in production
  // For now, we'll use a simple time-based clustering
  const threads: Record<string, any> = {}
  let currentThreadId = ""
  let currentThreadMessages: string[] = []
  let lastMessageTime: Date | null = null

  memory.messages.forEach((msg) => {
    const currentTime = new Date(msg.timestamp)

    // Start a new thread if more than 3 hours between messages
    if (!lastMessageTime || currentTime.getTime() - lastMessageTime.getTime() > 3 * 60 * 60 * 1000) {
      if (currentThreadMessages.length > 0) {
        // Summarize and save the previous thread
        const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        threads[threadId] = {
          id: threadId,
          title: `Conversation on ${lastMessageTime?.toLocaleDateString()}`,
          summary: `Discussion about ${currentThreadMessages.slice(0, 2).join(" ")}...`,
          lastUpdated: lastMessageTime || new Date(),
          messageIds: currentThreadMessages,
        }
      }

      // Start new thread
      currentThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      currentThreadMessages = [msg.id]
    } else {
      // Continue current thread
      currentThreadMessages.push(msg.id)
    }

    lastMessageTime = currentTime
  })

  // Save the last thread
  if (currentThreadMessages.length > 0 && lastMessageTime) {
    threads[currentThreadId] = {
      id: currentThreadId,
      title: `Conversation on ${lastMessageTime.toLocaleDateString()}`,
      summary: `Discussion about ${currentThreadMessages.slice(0, 2).join(" ")}...`,
      lastUpdated: lastMessageTime,
      messageIds: currentThreadMessages,
    }
  }

  return threads
}

// Convert standard memory to enhanced memory
export function upgradeToEnhancedMemory(memory: ConversationMemory): EnhancedMemory {
  return {
    ...memory,
    contextualMemories: memory.keyMemories.map((km) => ({
      id: km.id,
      content: km.content,
      importance: km.importance,
      recency: 5, // Default middle value
      relevance: 5, // Default middle value
      category: km.category as MemoryCategory,
      timestamp: km.timestamp,
      relatedTopics: km.content.split(/\s+/).filter((word) => word.length > 3),
      emotionalTone: "neutral",
    })),
    conversationThreads: extractConversationThreads({
      ...memory,
      contextualMemories: [],
      conversationThreads: {},
      worldKnowledge: [],
    } as EnhancedMemory),
    worldKnowledge: [],
  }
}
