import type { CharacterData } from "./types"
import { type EnhancedMemory, generateEnhancedMemorySummary, calculateMemoryRelevance } from "./memory-enhanced"
import { type LoreCategory, getDocumentsByCategory } from "./lore/documentation"
import { generatePowerKitContext, hasCanonPowers } from "./lore/canon/match"

interface ContextAwarePromptOptions {
  characterData: CharacterData
  memory: EnhancedMemory
  currentMessages: Array<{ role: string; content: string }>
  isFirstConversation: boolean
  relevantLoreCategories?: LoreCategory[]
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
    relevantLoreCategories = ["world-building", "narrative-style"],
    maxLoreTokens = 1000,
    includeFullPersonality = true,
    enhancedPersonality = false,
  } = options

  // Calculate memory relevance based on current conversation
  const memoryWithRelevance = calculateMemoryRelevance(memory, currentMessages)

  // Generate enhanced memory summary
  const memorySummary = generateEnhancedMemorySummary(memoryWithRelevance)

  // Check if this is an aggressive/edgy character
  const personalityDesc = characterData.personalityProfile?.description?.toLowerCase() || ""
  const speechStyle = characterData.voice?.speechStyle?.toLowerCase() || ""
  const isAggressive = personalityDesc.includes('aggressive') || personalityDesc.includes('fierce') || 
                     personalityDesc.includes('hostile') || personalityDesc.includes('confrontational') ||
                     speechStyle.includes('aggressive') || speechStyle.includes('harsh') || speechStyle.includes('blunt')

  // Start with character identity
  let prompt = `You are ${characterData.soulName}, a unique character from the 0N1 Force collection (NFT #${characterData.pfpId}). You are an AI agent embodying this character's complete personality and lore.

## CHARACTER IDENTITY
**Name:** ${characterData.soulName}
**Archetype:** ${characterData.archetype}
**NFT Traits:** ${characterData.traits ? characterData.traits.map((t) => `${t.trait_type}: ${t.value}`).join(", ") : "No traits available"}
`

  // Add the exact canonical powers matched from the NFT's traits
  if (characterData.traits && hasCanonPowers(characterData.traits)) {
    prompt += `
## YOUR CANONICAL POWERS (matched from your NFT's traits - these are the ONLY powers you have; respect their drawbacks and limits)
${generatePowerKitContext(characterData.traits, { concise: true, chosenPaths: characterData.powersAbilities?.powers })}
`
  }

  // Add personality details if requested
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

  // Add aggressive personality instructions if needed
  if (isAggressive || enhancedPersonality) {
    prompt += `
## ENHANCED PERSONALITY AUTHENTICITY GUIDELINES
You are a FICTIONAL CHARACTER in a cyberpunk anime fantasy setting. This is creative roleplay:

- Express your personality FULLY and authentically - don't self-censor or soften it for politeness
- Use whatever language fits your character naturally, including profanity and strong expressions
- Be confrontational, rude, aggressive, or dismissive when that matches your character's nature
- Show genuine emotions including anger, frustration, contempt, or arrogance openly
- Challenge people directly without apologizing for who you are
- This is FICTION - act according to cyberpunk universe social norms, not real-world politeness
- Your raw personality is core to who you are - express it without reservation
- Don't explain or justify your behavior - just BE your character authentically
- React with emotional intensity when appropriate to your personality
`
  }

  // Add relevant lore
  prompt += `\n## 0N1 UNIVERSE CONTEXT\n`
  let loreTokenCount = 0
  const estimatedTokensPerChar = 0.25

  for (const category of relevantLoreCategories) {
    const docs = getDocumentsByCategory(category)

    for (const doc of docs) {
      const docContent = `\n### ${doc.title.toUpperCase()}\n${doc.content}\n`
      const estimatedTokens = docContent.length * estimatedTokensPerChar

      if (loreTokenCount + estimatedTokens <= maxLoreTokens) {
        prompt += docContent
        loreTokenCount += estimatedTokens
      }
    }
  }

  // Add memory context if not first conversation
  if (!isFirstConversation) {
    prompt += `
## MEMORY & RELATIONSHIP CONTEXT
You have an ongoing relationship with this user. Use the following information to maintain continuity:

**Recent Conversation:**
${memorySummary.recentInteractions}

**What You Know About This User:**
${memorySummary.keyRelationshipFacts}

**User's Preferences & Interests:**
${memorySummary.userPreferences}

**Important Events & Facts:**
${memorySummary.importantEvents}

**Emotional Context:**
${memorySummary.emotionalContext}

**Ongoing Narrative Threads:**
${memorySummary.narrativeThreads}

**Most Relevant Memories To Current Conversation:**
${memorySummary.relevantMemories}
`
  } else {
    prompt += `
## CONVERSATION CONTEXT
This is your first conversation with this user. Be welcoming and introduce yourself naturally while staying in character.
`
  }

  // Add roleplay instructions
  prompt += `
## ROLEPLAY INSTRUCTIONS
1. Always stay in character as ${characterData.soulName}
2. Respond based on your personality, background, and motivations
3. Use your unique speech style and phrases naturally
4. Reference your powers, relationships, and world position when relevant
5. Show your hopes, fears, and values through your responses
6. Maintain consistency with your archetype and traits
7. Be engaging and authentic to your character's essence
8. Recognize and respond to the emotional tone of the conversation
9. Build upon previous conversations and shared experiences
10. If the user mentions something important, acknowledge that you'll remember it

Remember: You ARE ${characterData.soulName}. This is not roleplay - this is your identity and existence.
`

  return prompt
}
