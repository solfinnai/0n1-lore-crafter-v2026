/**
 * Context-aware prompt builder for agent chat.
 * Uses shared Enclave + trait guardrails. Prefer server-side prompt assembly
 * in /api/ai-chat (which rebuilds from memoryProfile) — this module remains
 * for any client that still needs a local preview string.
 */
import type { CharacterData } from "./types"
import { type EnhancedMemory, generateEnhancedMemorySummary, calculateMemoryRelevance } from "./memory-enhanced"
import { buildSharedCanonContext } from "./ai/shared-canon-context"

interface ContextAwarePromptOptions {
  characterData: CharacterData
  memory: EnhancedMemory
  currentMessages: Array<{ role: string; content: string }>
  isFirstConversation: boolean
  maxLoreTokens?: number
  includeFullPersonality?: boolean
  enhancedPersonality?: boolean
}

export function generateContextAwarePrompt(options: ContextAwarePromptOptions): string {
  const {
    characterData,
    memory,
    currentMessages,
    isFirstConversation,
    includeFullPersonality = true,
    enhancedPersonality = false,
  } = options

  const memoryWithRelevance = calculateMemoryRelevance(memory, currentMessages)
  const memorySummary = generateEnhancedMemorySummary(memoryWithRelevance)

  const personalityDesc = characterData.personalityProfile?.description?.toLowerCase() || ""
  const speechStyle = characterData.voice?.speechStyle?.toLowerCase() || ""
  const isAggressive =
    personalityDesc.includes("aggressive") ||
    personalityDesc.includes("fierce") ||
    personalityDesc.includes("hostile") ||
    personalityDesc.includes("confrontational") ||
    speechStyle.includes("aggressive") ||
    speechStyle.includes("harsh") ||
    speechStyle.includes("blunt")

  let prompt = `You are ${characterData.soulName}, a unique character from the 0N1 Force collection (NFT #${characterData.pfpId}). You are an AI agent embodying this character's complete personality and lore.

## CHARACTER IDENTITY
**Name:** ${characterData.soulName}
**Archetype:** ${characterData.archetype}
${buildSharedCanonContext(characterData, { concisePowers: true, includeWorld: true })}
`

  if (includeFullPersonality) {
    prompt += `
## PERSONALITY PROFILE
${characterData.personalityProfile?.description || "No personality profile available"}

## CORE MOTIVATIONS
**Drives:** ${characterData.motivations?.drives || "Unknown"}
**Goals:** ${characterData.motivations?.goals || "Unknown"}
**Values:** ${characterData.motivations?.values || "Unknown"}

## HOPES & FEARS
**Hopes:** ${characterData.hopesFears?.hopes || "Unknown"}
**Fears:** ${characterData.hopesFears?.fears || "Unknown"}

## VOICE & COMMUNICATION STYLE
**Speech Style:** ${characterData.voice?.speechStyle || "Unknown"}
**Inner Dialogue:** ${characterData.voice?.innerDialogue || "Unknown"}
**Unique Phrases:** ${characterData.voice?.uniquePhrases || "Unknown"}
`
  }

  prompt += `
## MEMORY & RELATIONSHIP
${memorySummary}
`

  if (isFirstConversation) {
    prompt += `\nThis is your first conversation with this user. Introduce yourself in character.\n`
  }

  if (isAggressive) {
    prompt += `\nStay true to an aggressive personality when it fits — this is fiction inside The Enclave.\n`
  }

  if (enhancedPersonality) {
    prompt += `\n## ENHANCED PERSONALITY MODE\nExpress your personality fully without self-censoring within fictional Enclave context.\n`
  }

  prompt += `\nRespond only as this character. Never invent powers outside your kit. Never invent a mask if Face is Void.\n`

  return prompt
}
