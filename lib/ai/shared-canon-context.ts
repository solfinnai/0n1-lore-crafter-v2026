import { generatePowerKitContext, generateTraitContext, hasCanonPowers } from "@/lib/lore/canon/match"
import { districts, worldOverview } from "@/lib/lore/canon/world"
import type { CharacterData } from "@/lib/types"
import type { Trait } from "@/lib/types"

/**
 * Shared canon guardrails for every AI surface (assistant, chat, creation-chat, summary).
 * Ensures Void≠mask, background≠lineage, and Enclave-only world grounding.
 */

const TRAIT_CONSTRAINTS = `## HARD CANON CONSTRAINTS (never violate)
- Face: Void means bare-faced — NEVER invent or mention a mask for that character.
- Background gemstone/color words are backdrop resonance only — NEVER treat them as body lineages.
- Gemstone words in cosmetic traits (e.g. "Fedora (Obsidian)") are colors, NOT power lineages.
- NEVER invent powers outside the character's canonical power kit.
- World is The Enclave (pocket dimension under The Veil). NEVER use Neo-Tokyo, Neo-Digital Age, Great Merge, Soul-Code, or Blazing Protocol.`

export function buildTraitGuardrailSection(traits: Trait[] | undefined | null): string {
  if (!Array.isArray(traits) || traits.length === 0) {
    return `\n${TRAIT_CONSTRAINTS}\n\n## TRAITS\nNo traits available — do not invent NFT traits or powers.\n`
  }
  return `\n${TRAIT_CONSTRAINTS}\n\n${generateTraitContext(traits)}\n`
}

export function buildPowerKitGuardrailSection(
  characterData: Pick<CharacterData, "traits" | "powersAbilities"> | { traits?: Trait[]; powersAbilities?: { powers?: string[] } },
  opts: { concise?: boolean } = { concise: true },
): string {
  const traits = characterData?.traits
  if (!Array.isArray(traits) || traits.length === 0 || !hasCanonPowers(traits)) return ""
  return `
## YOUR CANONICAL POWERS (matched from your NFT's traits - these are the ONLY powers you have; respect their drawbacks and limits)
${generatePowerKitContext(traits, { concise: opts.concise !== false, chosenPaths: characterData?.powersAbilities?.powers })}
`
}

export function buildEnclaveWorldSection(opts: { includeDistricts?: boolean } = { includeDistricts: true }): string {
  let s = `\n## CANONICAL WORLD (The Enclave)\n${worldOverview.setting}\n`
  if (opts.includeDistricts !== false) {
    s += `\nDistricts:\n${districts.map((d) => `- ${d.name} (${d.role}): ${d.description}`).join("\n")}\n`
  }
  return s
}

/** Full shared pack for character chat / summaries. */
export function buildSharedCanonContext(
  characterData: Partial<CharacterData> & { traits?: Trait[] },
  opts: { concisePowers?: boolean; includeWorld?: boolean } = {},
): string {
  const { concisePowers = true, includeWorld = true } = opts
  let out = buildTraitGuardrailSection(characterData.traits)
  out += buildPowerKitGuardrailSection(characterData as CharacterData, { concise: concisePowers })
  if (includeWorld) {
    out += buildEnclaveWorldSection({ includeDistricts: true })
  }
  return out
}
