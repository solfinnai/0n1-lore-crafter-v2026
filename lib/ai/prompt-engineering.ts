import { generatePowerKitContext, generateTraitContext, hasCanonPowers } from "@/lib/lore/canon/match"
import {
  districts,
  worldOverview,
  canonFactions,
  historyTimeline,
  glossary,
  designPrinciples,
} from "@/lib/lore/canon/world"
import type { CharacterData } from "@/lib/types"

/**
 * Enhanced prompts for AI suggestions — Enclave / worldbible-2026-02 only.
 * Retired Neo-Tokyo / Great Merge / Soul-Code lore must never enter prompts.
 */

interface PromptContext {
  characterData: CharacterData
  currentStep: string
  subStep?: string | null
  maxTokens?: number
}

export function generateEnhancedSystemPrompt(context: PromptContext): string {
  const { characterData, currentStep, subStep = null, maxTokens = 2000 } = context

  let systemPrompt = `You are an AI assistant for the 0N1 Soul Generator application. Your job is to provide creative, thematic suggestions for character development that match the cyberpunk anime fantasy aesthetic of the 0N1 Force NFT collection and stay strictly inside The Enclave canon.

You are currently helping with the "${currentStep}" step${subStep ? ` (specifically the "${subStep}" section)` : ""} of character creation.

`

  systemPrompt += generateCharacterContext(characterData)

  if (characterData.traits && hasCanonPowers(characterData.traits)) {
    const fullDetail = currentStep === "powers" || currentStep === "powersAbilities"
    systemPrompt += `\n\n## CANONICAL POWERS FOR THIS EXACT NFT (from its on-chain traits - these are the ONLY powers this character can have; never invent powers outside this kit)\n${generatePowerKitContext(characterData.traits, { concise: !fullDetail, chosenPaths: characterData.powersAbilities?.powers })}\n`
  }

  // Always ground in Enclave world (not only backstory steps) so non-backstory
  // steps never fall back to retired Neo-Tokyo lore as their only worldbuilding.
  systemPrompt += `\n\n## CANONICAL WORLD (all origins and locations must fit The Enclave)\n${worldOverview.setting}\n\nOne Source: ${worldOverview.oneSource}\n\nDistricts (use these as the character's home/haunts):\n${districts.map((d) => `- ${d.name} (${d.role}): ${d.description}`).join("\n")}\n`

  systemPrompt += generateEnclaveLoreContext(currentStep, maxTokens)
  systemPrompt += generateStepSpecificInstructions(currentStep, subStep)
  systemPrompt += generateStyleGuidelines()

  return systemPrompt
}

function generateCharacterContext(characterData: CharacterData): string {
  let context = `\n\n## CHARACTER CONTEXT\n`

  if (characterData.traits && characterData.traits.length > 0) {
    context += generateTraitContext(characterData.traits)
  }

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

  return context
}

/**
 * Enclave-only lore packs from worldbible-2026-02 (lib/lore/canon/world.ts).
 * Replaces the retired documentation.ts Neo-Tokyo corpus.
 */
function generateEnclaveLoreContext(currentStep: string, maxTokens: number): string {
  const estimatedTokensPerChar = 0.25
  let loreContext = `\n\n## 0N1 ENCLAVE CANON\n`
  let currentTokenCount = 0

  const blocks: string[] = []

  blocks.push(`\n### COSMOLOGY\n${worldOverview.cosmology}\n`)
  blocks.push(`\n### CHRONOLOGY\n${worldOverview.chronology}\n`)

  if (["background", "worldPosition", "relationships", "motivations", "hopes", "fears"].includes(currentStep)) {
    blocks.push(
      `\n### HOUSES & FACTIONS\n${canonFactions.map((f) => `- ${f.name}: ${f.description}`).join("\n")}\n`,
    )
    blocks.push(
      `\n### HISTORY (Nexus Chronology)\n${historyTimeline
        .slice(-4)
        .map((e) => `- ${e.era}: ${e.events}`)
        .join("\n")}\n`,
    )
  }

  if (["voice", "soulName", "symbolism", "archetype"].includes(currentStep)) {
    const terms = Object.entries(glossary)
      .slice(0, 12)
      .map(([term, def]) => `- ${term}: ${def}`)
      .join("\n")
    blocks.push(`\n### GLOSSARY\n${terms}\n`)
  }

  if (["powersAbilities", "powers"].includes(currentStep)) {
    blocks.push(
      `\n### DESIGN PRINCIPLES\n${designPrinciples.map((p) => `- ${p.name}: ${p.description}`).join("\n")}\n`,
    )
  }

  // Narrative style (Enclave tone — never Neo-Tokyo lexicon)
  blocks.push(`\n### NARRATIVE STYLE\n${ENCLAVE_NARRATIVE_STYLE}\n`)

  for (const block of blocks) {
    const estimatedTokens = block.length * estimatedTokensPerChar
    if (currentTokenCount + estimatedTokens <= maxTokens) {
      loreContext += block
      currentTokenCount += estimatedTokens
    }
  }

  return loreContext
}

const ENCLAVE_NARRATIVE_STYLE = `Tone: cyberpunk grit inside a dimensional mega-city (The Enclave), blended with oni folklore and One Source mysticism.
Dialogue: street slang of The Vents, formal House protocol, Warden brevity, Market haggling — never "Soul-Code," "The Merge," "Blazing Protocol," or "Neo-Tokyo."
Imagery: world-electric turbines, The Veil, the Glitch wasteland, Gen3sis Tree light, district contrast (Halcyon vs The Vents).
Treat identity as shaped by Type tier (Y0K-A1 / B4K3M0-N0 / 0N1 / K4M-1), body lineage, and House allegiance — not by a fictional Great Merge.`

function generateStepSpecificInstructions(currentStep: string, subStep: string | null): string {
  let instructions = `\n\n## SPECIFIC INSTRUCTIONS\n`

  switch (currentStep) {
    case "archetype":
      instructions += `Generate 3 unique archetype suggestions that would fit well with this character's traits. Each suggestion should include a name and a brief description that aligns with The Enclave: One Source, Houses, districts, and 0N1 Force mythos.`
      break
    case "background":
      instructions += `Generate 3 unique background or origin story suggestions that would fit well with this character's traits and archetype. Each suggestion should be a paragraph describing where they were born or raised inside The Enclave (name a district such as The Vents, Halcyon, The Markets, The Battlements, The Synapse, The Arts District, or The Substructure) and their upbringing in the present Awakening era — never Neo-Tokyo, Neo-Digital Age, or The Great Merge.`
      break
    case "hopes":
      instructions += `Generate 3 unique hopes or dreams that would fit well with this character. Each suggestion should describe what the character aspires to achieve in The Enclave (One Source, Houses, The Veil, protecting against the F4LL3N / Akuma, etc.).`
      break
    case "fears":
      instructions += `Generate 3 unique fears or anxieties that would fit well with this character. Draw from Enclave dangers: The Glitch, Akuma corruption, F4LL3N return, Veil failure, House politics, Myre echoes — never retired Neo-Tokyo lore.`
      break
    case "personalityProfile":
      instructions += `Generate 3 different personality profiles that would fit well with this character. Each suggestion should be a paragraph describing their temperament in a way that reflects life under the Enclave dome.`
      break
    case "motivations":
      if (subStep === "drives") {
        instructions += `Generate 3 creative suggestions for this character's inner drives. What internal forces motivate them inside The Enclave? Each suggestion should be 2-3 sentences.`
      } else if (subStep === "goals") {
        instructions += `Generate 3 creative suggestions for this character's goals and ambitions within The Enclave. Each suggestion should be 2-3 sentences.`
      } else if (subStep === "values") {
        instructions += `Generate 3 creative suggestions for this character's core values amid House politics, One Source ethics, and life in The Enclave. Each suggestion should be 2-3 sentences.`
      } else {
        instructions += `Generate 3 motivations that would drive this character in The Enclave. Each suggestion should explain drives, goals, and values.`
      }
      break
    case "voice":
      if (subStep === "speechStyle") {
        instructions += `Generate 3 creative suggestions for this character's speech style. Fit The Enclave (district slang, House formality, Warden brevity). Each suggestion should be 2-3 sentences.`
      } else if (subStep === "innerDialogue") {
        instructions += `Generate 3 creative suggestions for this character's inner dialogue. Each suggestion should be 2-3 sentences.`
      } else if (subStep === "uniquePhrases") {
        instructions += `Generate 3 creative suggestions for this character's unique phrases. Use Enclave lexicon (One Source, The Veil, world-electric, House names) — never Soul-Code / The Merge / Blazing Protocol. Each suggestion should include 1-2 example phrases.`
      } else {
        instructions += `Generate 3 unique voice styles for this character reflecting The Enclave's blend of oni myth and mega-city life.`
      }
      break
    default:
      instructions += `Generate 3 creative suggestions for the "${currentStep}" step of character creation. Each suggestion should be detailed, evocative, and align with The Enclave canon (worldbible-2026-02). Never use Neo-Tokyo, Neo-Digital Age, Great Merge, Soul-Code, or Blazing Protocol.`
  }

  return instructions
}

function generateStyleGuidelines(): string {
  return `\n\n## STYLISTIC GUIDELINES

1. STAY IN THE ENCLAVE: All places, factions, and history must fit The Enclave pocket dimension — districts, The Veil, The Glitch, Houses, One Source. Never invent Neo-Tokyo, Neo-Digital Age year 2157, The Great Merge, Blazing Temple (as Neo-Tokyo hub), Soul-Code, or Blazing Protocol.

2. BLEND TECHNOLOGY AND MYTH: Merge world-electric / nanotech with oni folklore and One Source mysticism (e.g. "communing with the Gen3sis current," not "soul-code hacking").

3. USE CANONICAL TERMINOLOGY: Prefer Enclave lexicon — One Source, Gen3sis Tree, The Veil, MORIA, F4LL3N, Akuma, K4M-1 Houses, Y0K-A1 / B4K3M0-N0 / 0N1 / K4M-1, world-electric, Nexus Chronology.

4. MAINTAIN TONAL BALANCE: Balance street-level Enclave grit with spiritual depth around the One Source.

5. CRAFT DISTINCTIVE DIALOGUE: Match speech to district and class (Vents vs Halcyon vs Wardens).

6. RESPECT TRAIT CANON: Never invent a mask for Face: Void (bare-faced). Never treat Background gemstone colors as body lineages. Never invent powers outside the provided kit.

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
