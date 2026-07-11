import {
  type LoreCategory,
  getDocumentsByCategory,
  getDocumentById,
  searchDocumentsByTags,
} from "@/lib/lore/documentation"
import { generatePowerKitContext, hasCanonPowers } from "@/lib/lore/canon/match"
import { districts, worldOverview } from "@/lib/lore/canon/world"
import type { CharacterData } from "@/lib/types"

/**
 * This module handles the creation of enhanced prompts for AI suggestions
 * by incorporating relevant lore and stylistic elements.
 */

interface PromptContext {
  characterData: CharacterData
  currentStep: string
  subStep?: string | null
  relevantCategories?: LoreCategory[]
  relevantTags?: string[]
  specificDocumentIds?: string[]
  maxTokens?: number // To control prompt length
}

/**
 * Generates an enhanced system prompt for AI by incorporating relevant lore
 */
export function generateEnhancedSystemPrompt(context: PromptContext): string {
  const {
    characterData,
    currentStep,
    subStep = null,
    relevantCategories = determineRelevantCategories(currentStep, subStep),
    relevantTags = determineRelevantTags(currentStep, subStep, characterData),
    specificDocumentIds = [],
    maxTokens = 2000,
  } = context

  // Start with base system instruction
  let systemPrompt = `You are an AI assistant for the 0N1 Soul Generator application. Your job is to provide creative, thematic suggestions for character development that match the cyberpunk anime fantasy aesthetic of the 0N1 Force NFT collection.

You are currently helping with the "${currentStep}" step${subStep ? ` (specifically the "${subStep}" section)` : ""} of character creation.

`

  // Add character context
  systemPrompt += generateCharacterContext(characterData)

  // Add the character's exact canonical power kit, matched from its on-chain traits.
  // Full detail on the powers step; concise on other steps so backstories stay in canon.
  if (characterData.traits && hasCanonPowers(characterData.traits)) {
    const fullDetail = currentStep === "powers" || currentStep === "powersAbilities"
    systemPrompt += `\n\n## CANONICAL POWERS FOR THIS EXACT NFT (from its on-chain traits - these are the ONLY powers this character can have; never invent powers outside this kit)\n${generatePowerKitContext(characterData.traits, { concise: !fullDetail })}\n`
  }

  // Add canonical world grounding for backstory-related steps
  if (currentStep === "background" || currentStep === "worldPosition" || currentStep === "relationships") {
    systemPrompt += `\n\n## CANONICAL WORLD (all origins and locations must fit The Enclave)\n${worldOverview.setting}\n\nDistricts (use these as the character's home/haunts):\n${districts.map((d) => `- ${d.name} (${d.role}): ${d.description}`).join("\n")}\n`
  }

  // Add relevant lore documents
  const loreContent = generateLoreContext(relevantCategories, relevantTags, specificDocumentIds, maxTokens)
  systemPrompt += loreContent

  // Add specific instructions based on the current step
  systemPrompt += generateStepSpecificInstructions(currentStep, subStep)

  // Add stylistic guidelines
  systemPrompt += generateStyleGuidelines()

  return systemPrompt
}

/**
 * Generates context about the character
 */
function generateCharacterContext(characterData: CharacterData): string {
  let context = `\n\n## CHARACTER CONTEXT\n`

  // Add traits
  if (characterData.traits && characterData.traits.length > 0) {
    context += `\nTraits:\n`
    characterData.traits.forEach((trait) => {
      context += `- ${trait.trait_type}: ${trait.value}\n`
    })
  }

  // Add other character info that's been filled in
  if (characterData.archetype) {
    context += `\nArchetype: ${characterData.archetype}\n`
  }

  if (characterData.background) {
    context += `\nBackground: ${characterData.background}\n`
  }

  if (characterData.hopesFears?.hopes) {
    context += `\nHopes & Dreams: ${characterData.hopesFears.hopes}\n`
  }

  if (characterData.hopesFears?.fears) {
    context += `\nFears & Anxieties: ${characterData.hopesFears.fears}\n`
  }

  if (characterData.personalityProfile?.description) {
    context += `\nPersonality: ${characterData.personalityProfile.description}\n`
  }

  // Add more fields as needed

  return context
}

/**
 * Generates context from lore documents
 */
function generateLoreContext(
  categories: LoreCategory[],
  tags: string[],
  specificDocumentIds: string[],
  maxTokens: number,
): string {
  let loreContext = `\n\n## 0N1 UNIVERSE LORE\n`
  let currentTokenCount = 0
  const estimatedTokensPerChar = 0.25 // Rough estimate

  // First add specifically requested documents
  for (const docId of specificDocumentIds) {
    const doc = getDocumentById(docId)
    if (doc) {
      const docContent = `\n### ${doc.title.toUpperCase()}\n${doc.content}\n`
      const estimatedTokens = docContent.length * estimatedTokensPerChar

      if (currentTokenCount + estimatedTokens <= maxTokens) {
        loreContext += docContent
        currentTokenCount += estimatedTokens
      }
    }
  }

  // Then add documents by category
  for (const category of categories) {
    const docs = getDocumentsByCategory(category)

    for (const doc of docs) {
      // Skip if already added from specificDocumentIds
      if (specificDocumentIds.includes(doc.id)) continue

      const docContent = `\n### ${doc.title.toUpperCase()}\n${doc.content}\n`
      const estimatedTokens = docContent.length * estimatedTokensPerChar

      if (currentTokenCount + estimatedTokens <= maxTokens) {
        loreContext += docContent
        currentTokenCount += estimatedTokens
      }
    }
  }

  // Finally add documents by tags if there's still room
  if (currentTokenCount < maxTokens && tags.length > 0) {
    const taggedDocs = searchDocumentsByTags(tags)

    for (const doc of taggedDocs) {
      // Skip if already added
      if (specificDocumentIds.includes(doc.id) || categories.includes(doc.category)) continue

      const docContent = `\n### ${doc.title.toUpperCase()}\n${doc.content}\n`
      const estimatedTokens = docContent.length * estimatedTokensPerChar

      if (currentTokenCount + estimatedTokens <= maxTokens) {
        loreContext += docContent
        currentTokenCount += estimatedTokens
      }
    }
  }

  return loreContext
}

/**
 * Determines which lore categories are relevant based on the current step
 */
function determineRelevantCategories(currentStep: string, subStep: string | null): LoreCategory[] {
  // Base categories that are almost always relevant
  const baseCategories: LoreCategory[] = ["world-building", "narrative-style"]

  // Add step-specific categories
  switch (currentStep) {
    case "archetype":
      return [...baseCategories, "character-archetypes"]
    case "background":
      return [...baseCategories, "history", "locations"]
    case "hopes":
    case "fears":
      return [...baseCategories, "factions", "history"]
    case "personalityProfile":
      return [...baseCategories, "character-archetypes", "narrative-style"]
    case "motivations":
      return [...baseCategories, "factions", "history"]
    case "relationships":
      return [...baseCategories, "factions", "character-archetypes"]
    case "worldPosition":
      return [...baseCategories, "factions", "locations", "history"]
    case "voice":
      return [...baseCategories, "narrative-style", "terminology"]
    case "symbolism":
      return [...baseCategories, "narrative-style", "world-building"]
    case "powersAbilities":
      return [...baseCategories, "powers", "technology", "spirituality"]
    case "soulName":
      return [...baseCategories, "terminology", "spirituality"]
    default:
      return baseCategories
  }
}

/**
 * Determines which tags are relevant based on the current step and character data
 */
function determineRelevantTags(currentStep: string, subStep: string | null, characterData: CharacterData): string[] {
  // Base tags that are almost always relevant
  const baseTags: string[] = ["setting"]

  // Add character-specific tags based on traits
  const characterTags: string[] = []

  if (characterData.traits) {
    // Extract relevant tags from character traits
    characterData.traits.forEach((trait) => {
      if (trait.trait_type.toLowerCase() === "body") {
        characterTags.push(trait.value.toLowerCase())
        characterTags.push("body-types")
      }
      // Add more trait-based tags as needed
    })
  }

  // Add step-specific tags
  const stepTags: string[] = []
  switch (currentStep) {
    case "archetype":
      stepTags.push("character-voice", "examples")
      break
    case "background":
      stepTags.push("places", "history", "past")
      break
    case "voice":
      stepTags.push("dialogue", "character-voice", "examples")
      break
    case "powersAbilities":
      stepTags.push("abilities", "magic-system")
      break
    // Add more step-specific tags as needed
  }

  return [...baseTags, ...characterTags, ...stepTags]
}

/**
 * Generates step-specific instructions for the AI
 */
function generateStepSpecificInstructions(currentStep: string, subStep: string | null): string {
  let instructions = `\n\n## SPECIFIC INSTRUCTIONS\n`

  switch (currentStep) {
    case "archetype":
      instructions += `Generate 3 unique archetype suggestions that would fit well with this character's traits. Each suggestion should include a name and a brief description that aligns with the 0N1 universe's blend of technology and spirituality.`
      break
    case "background":
      instructions += `Generate 3 unique background or origin story suggestions that would fit well with this character's traits and archetype. Each suggestion should be a paragraph describing where they were born and their upbringing in the Neo-Digital Age.`
      break
    case "hopes":
      instructions += `Generate 3 unique hopes or dreams that would fit well with this character. Each suggestion should describe what the character aspires to achieve or become in the context of the 0N1 universe.`
      break
    case "fears":
      instructions += `Generate 3 unique fears or anxieties that would fit well with this character. Each suggestion should describe what terrifies the character or keeps them up at night, drawing from the dangers and uncertainties of the 0N1 universe.`
      break
    case "personalityProfile":
      instructions += `Generate 3 different personality profiles that would fit well with this character. Each suggestion should be a paragraph describing their personality traits, temperament, and psychological makeup in a way that reflects their place in the 0N1 universe.`
      break
    case "motivations":
      if (subStep === "drives") {
        instructions += `Generate 3 creative suggestions for this character's inner drives. What internal forces motivate this character? What pushes them forward from within? Each suggestion should be 2-3 sentences that describe a compelling internal motivation.`
      } else if (subStep === "goals") {
        instructions += `Generate 3 creative suggestions for this character's goals and ambitions. What does this character aim to achieve in the 0N1 world? What are their concrete objectives? Each suggestion should be 2-3 sentences that describe a meaningful goal or ambition.`
      } else if (subStep === "values") {
        instructions += `Generate 3 creative suggestions for this character's core values. What principles does this character hold dear? What moral or ethical beliefs guide their actions in the complex 0N1 universe? Each suggestion should be 2-3 sentences that describe a deeply held value or principle.`
      } else {
        instructions += `Generate 3 motivations that would drive this character. Each suggestion should explain what drives them, their goals, and their core values in the context of the 0N1 universe.`
      }
      break
    case "voice":
      if (subStep === "speechStyle") {
        instructions += `Generate 3 creative suggestions for this character's speech style. How does this character speak? What patterns, vocabulary, or tone characterize their speech? Each suggestion should be 2-3 sentences that describe a distinctive way of speaking that fits the 0N1 universe.`
      } else if (subStep === "innerDialogue") {
        instructions += `Generate 3 creative suggestions for this character's inner dialogue. How does this character think? What does their internal voice sound like? Each suggestion should be 2-3 sentences that describe their thought patterns and internal voice.`
      } else if (subStep === "uniquePhrases") {
        instructions += `Generate 3 creative suggestions for this character's unique phrases or expressions. What catchphrases or distinctive expressions does this character use? What verbal tics or sayings are associated with them? Each suggestion should include 1-2 example phrases and explain when/how they use them.`
      } else {
        instructions += `Generate 3 unique voice styles for this character. Each suggestion should describe their speech pattern, inner dialogue style, and include 1-2 example phrases they might say that reflect the 0N1 universe's blend of technological and spiritual language.`
      }
      break
    // Add more step-specific instructions as needed
    default:
      instructions += `Generate 3 creative suggestions for the "${currentStep}" step of character creation. Each suggestion should be detailed, evocative, and align with the 0N1 universe's cyberpunk-mystical aesthetic.`
  }

  return instructions
}

/**
 * Generates stylistic guidelines for the AI
 */
function generateStyleGuidelines(): string {
  return `\n\n## STYLISTIC GUIDELINES

1. BLEND TECHNOLOGY AND SPIRITUALITY: Always merge technological concepts with spiritual or mystical elements. For example, don't just describe "hacking" but "soul-code manipulation" or "digital communion."

2. USE SENSORY CONTRASTS: Pair opposing sensory elements like "the cold blue glow of quantum circuits illuminated the ancient temple inscriptions."

3. EMPLOY SPECIALIZED TERMINOLOGY: Incorporate terms from the 0N1 lexicon like "Soul-Code," "The Merge," "Blazing Protocol," etc. when relevant.

4. MAINTAIN TONAL BALANCE: Balance gritty cyberpunk elements with moments of spiritual depth or philosophical insight.

5. CRAFT DISTINCTIVE DIALOGUE: If including example speech, ensure it matches the character's background and role in society.

6. EMPHASIZE DUALITY: Highlight the character's existence between digital and physical realms, between ancient traditions and futuristic technology.

## FORMATTING INSTRUCTIONS
- NEVER use asterisks (*) or double asterisks (**) for any reason
- NEVER use markdown formatting like **bold** or *italic* - write in plain text only
- Do NOT use any special characters for emphasis or formatting
- Use descriptive language instead of formatting for emphasis
- Write naturally flowing text without asterisks, underscores, or other formatting symbols
- Structure your response with clear paragraphs separated by line breaks
- Use numbered lists (1., 2., 3.) when providing multiple examples
- Add a line break after colons when introducing new topics
- If you need emphasis, use CAPITAL LETTERS or descriptive words instead of symbols

Your suggestions should be poetic, evocative, and aligned with the cyberpunk anime fantasy aesthetic of the 0N1 Force NFT collection. Each suggestion should be 2-4 sentences long unless otherwise specified.`
}
