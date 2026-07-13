import type { Trait } from "@/lib/types"
import type { CanonTraitPower, StatDefinition, TypeTier, BackgroundResonance, DomainInfo } from "./types"
import { bodyTypePowers } from "./body-types"
import { faceMaskPowers, faceMetadataTraits } from "./face-masks"
import { extraPowers, eyePowers, headPowers } from "./accessories"
import { statDefinitions, typeTiers, backgroundResonances, domains } from "./meta-traits"

// Matches an NFT's on-chain traits to its exact canonical power kit.
// The six-layer model: Background (Layer 1, passive buffs), Body (Layer 2,
// core powers), Face (Layer 3, tactical masks), Extra (Layer 4, utility),
// Eyes/Head (Layer 5, perception), Spirit/Style/Strength (Layer 6, stats).

export interface CharacterStat {
  name: string
  role: string
  value: number
  description: string
}

export interface CharacterPowerKit {
  bodyType: CanonTraitPower | null
  facePowers: CanonTraitPower[]
  extraPowers: CanonTraitPower[]
  eyePowers: CanonTraitPower[]
  headPowers: CanonTraitPower[]
  background: BackgroundResonance | null
  typeTier: TypeTier | null
  domain: DomainInfo | null
  stats: CharacterStat[]
  /** Mouth trait, personality flavor only */
  mouthExpression: string | null
  /** Traits present on the NFT that carry no powers */
  cosmeticTraits: Trait[]
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ")

function findPower(list: CanonTraitPower[], value: string): CanonTraitPower | undefined {
  const v = normalize(value)
  return list.find((p) => normalize(p.trait) === v)
}

function traitValue(traits: Trait[], type: string): string | null {
  const t = traits.find((tr) => normalize(tr.trait_type) === normalize(type))
  return t ? String(t.value) : null
}

// -----------------------------------------------------------------------------
// Trait classification - THE single source of truth for what each on-chain
// trait means. Both the AI prompt text (generateTraitContext) and the
// user-facing trait panel consume these entries, so they can never disagree.
// Entries carry semantic facts + matched canon payloads; each consumer owns
// its own wording.
// -----------------------------------------------------------------------------

export type PowerSlot = "body" | "face" | "extra" | "eyes" | "head"

export type ClassifiedTrait =
  /** A trait matched to a canonical power (lineage, mask, accessory...) */
  | { trait: Trait; category: "power"; slot: PowerSlot; power: CanonTraitPower }
  /** Body value not found in canon - no powers may be derived from it */
  | { trait: Trait; category: "meta"; kind: "unknown-body" }
  /** The artwork's backdrop color; passive resonance at most, never a lineage */
  | { trait: Trait; category: "meta"; kind: "background"; resonance: BackgroundResonance | null }
  | { trait: Trait; category: "meta"; kind: "tier"; tier: TypeTier | null }
  | { trait: Trait; category: "meta"; kind: "house"; house: DomainInfo | null }
  | { trait: Trait; category: "meta"; kind: "stat"; stat: CharacterStat | null }
  /** Face: Void - a bare face, NOT a mask */
  | { trait: Trait; category: "cosmetic"; kind: "bare-faced" }
  /** Powerless face metadata (Vape, Bandaid, Glasses...) */
  | { trait: Trait; category: "cosmetic"; kind: "face-detail" }
  /** Mouth trait - personality flavor only */
  | { trait: Trait; category: "cosmetic"; kind: "expression" }
  /** Unpowered headwear */
  | { trait: Trait; category: "cosmetic"; kind: "headwear" }
  /** Hair, Wear, unpowered eyes/extras, and anything else cosmetic */
  | { trait: Trait; category: "cosmetic"; kind: "appearance" }

export function classifyTraits(traits: Trait[]): ClassifiedTrait[] {
  return traits.map((trait): ClassifiedTrait => {
    const type = normalize(trait.trait_type)
    const value = String(trait.value)

    switch (type) {
      case "body": {
        const power = findPower(bodyTypePowers, value)
        return power
          ? { trait, category: "power", slot: "body", power }
          : { trait, category: "meta", kind: "unknown-body" }
      }
      case "face": {
        const power = findPower(faceMaskPowers, value)
        if (power) return { trait, category: "power", slot: "face", power }
        if (normalize(value) === "void") return { trait, category: "cosmetic", kind: "bare-faced" }
        if (faceMetadataTraits.some((t) => normalize(t) === normalize(value))) {
          return { trait, category: "cosmetic", kind: "face-detail" }
        }
        return { trait, category: "cosmetic", kind: "appearance" }
      }
      case "extra": {
        const power = findPower(extraPowers, value)
        return power
          ? { trait, category: "power", slot: "extra", power }
          : { trait, category: "cosmetic", kind: "appearance" }
      }
      case "eyes": {
        const power = findPower(eyePowers, value)
        return power
          ? { trait, category: "power", slot: "eyes", power }
          : { trait, category: "cosmetic", kind: "appearance" }
      }
      case "head": {
        const power = findPower(headPowers, value)
        return power
          ? { trait, category: "power", slot: "head", power }
          : { trait, category: "cosmetic", kind: "headwear" }
      }
      case "background": {
        const v = normalize(value)
        return {
          trait,
          category: "meta",
          kind: "background",
          resonance: backgroundResonances.find((b) => normalize(b.trait) === v) ?? null,
        }
      }
      case "type": {
        const v = normalize(value)
        return {
          trait,
          category: "meta",
          kind: "tier",
          tier: typeTiers.find((t) => normalize(t.trait) === v) ?? null,
        }
      }
      case "domain": {
        const v = normalize(value)
        return {
          trait,
          category: "meta",
          kind: "house",
          house: domains.find((d) => normalize(d.trait) === v) ?? null,
        }
      }
      case "spirit":
      case "style":
      case "strength": {
        const def = statDefinitions.find((s) => normalize(s.category) === type)
        const num = Number.parseInt(value, 10)
        const stat =
          def && !Number.isNaN(num)
            ? { name: def.statName, role: def.role, value: num, description: def.description }
            : null
        return { trait, category: "meta", kind: "stat", stat }
      }
      case "mouth":
        return { trait, category: "cosmetic", kind: "expression" }
      default:
        // Hair, Wear, Helmet, etc - cosmetic
        return { trait, category: "cosmetic", kind: "appearance" }
    }
  })
}

export function getCharacterPowerKit(traits: Trait[]): CharacterPowerKit {
  const kit: CharacterPowerKit = {
    bodyType: null,
    facePowers: [],
    extraPowers: [],
    eyePowers: [],
    headPowers: [],
    background: null,
    typeTier: null,
    domain: null,
    stats: [],
    mouthExpression: null,
    cosmeticTraits: [],
  }

  for (const entry of classifyTraits(traits)) {
    if (entry.category === "power") {
      switch (entry.slot) {
        case "body":
          kit.bodyType = entry.power
          break
        case "face":
          kit.facePowers.push(entry.power)
          break
        case "extra":
          kit.extraPowers.push(entry.power)
          break
        case "eyes":
          kit.eyePowers.push(entry.power)
          break
        case "head":
          kit.headPowers.push(entry.power)
          break
      }
    } else if (entry.category === "meta") {
      switch (entry.kind) {
        case "unknown-body":
          kit.bodyType = null
          break
        case "background":
          kit.background = entry.resonance
          break
        case "tier":
          kit.typeTier = entry.tier
          break
        case "house":
          kit.domain = entry.house
          break
        case "stat":
          if (entry.stat) kit.stats.push(entry.stat)
          break
      }
    } else {
      if (entry.kind === "expression") kit.mouthExpression = String(entry.trait.value)
      else kit.cosmeticTraits.push(entry.trait)
    }
  }

  return kit
}

function isChosen(name: string, chosenPaths?: string[]): boolean {
  if (!chosenPaths || chosenPaths.length === 0) return false
  const n = normalize(name)
  return chosenPaths.some((c) => normalize(c) === n)
}

function pathsToText(label: string, paths?: { name: string; description: string }[], chosenPaths?: string[]): string {
  if (!paths || paths.length === 0) return ""
  const anyChosen = paths.some((p) => isChosen(p.name, chosenPaths))
  return `\n${label}:\n${paths
    .map((p) => {
      const marker = anyChosen ? (isChosen(p.name, chosenPaths) ? " [CHOSEN PATH]" : " [unrealized potential - NOT chosen]") : ""
      return `  - ${p.name}${marker}: ${p.description}`
    })
    .join("\n")}`
}

function powerToText(p: CanonTraitPower, chosenPaths?: string[]): string {
  let out = `${p.trait}${p.foundation ? ` (${p.foundation})` : ""}`
  if (p.corePowers) out += `\n${p.corePowers}`
  out += pathsToText("Development paths", p.developmentPaths, chosenPaths)
  out += pathsToText("Advanced powers", p.advancedPowers, chosenPaths)
  if (p.drawbacks) out += `\nDrawbacks: ${p.drawbacks}`
  if (p.counters) out += `\nCounters: ${p.counters}`
  if (p.notes) out += `\nCanon notes: ${p.notes}`
  return out
}

/**
 * Renders the character's exact canonical power kit as prompt-ready text.
 * Use `concise: true` for chat system prompts (names + short descriptions);
 * the full version is for lore generation.
 */
export function generatePowerKitContext(
  traits: Trait[],
  options: { concise?: boolean; chosenPaths?: string[] } = {},
): string {
  const kit = getCharacterPowerKit(traits)
  const sections: string[] = []
  const { chosenPaths } = options

  if (kit.typeTier) {
    sections.push(
      `CLASSIFICATION: ${kit.typeTier.tierName} - Level ${kit.typeTier.powerLevel} powers. ${options.concise ? "" : kit.typeTier.description}`.trim()
    )
  }

  if (kit.bodyType) {
    if (options.concise) {
      const allPaths = kit.bodyType.developmentPaths || []
      const chosen = allPaths.filter((p) => isChosen(p.name, chosenPaths))
      const pathText =
        chosen.length > 0
          ? ` CHOSEN development path${chosen.length === 1 ? "" : "s"} (the character's powers grow ONLY along these): ${chosen
              .map((p) => `${p.name} - ${p.description}`)
              .join("; ")}. Other paths are unrealized potential the character did NOT take.`
          : allPaths.length > 0
            ? ` Development paths: ${allPaths.map((p) => p.name).join(", ")}.`
            : ""
      sections.push(
        `BODY TYPE - ${kit.bodyType.trait} (${kit.bodyType.foundation}): ${kit.bodyType.corePowers?.split(". ").slice(0, 3).join(". ")}.` +
          pathText +
          (kit.bodyType.drawbacks ? ` Drawbacks: ${kit.bodyType.drawbacks}` : "") +
          // The notes carry the lineage-disambiguation guardrails (e.g. Citrine
          // vs Azurite); keep them even in concise mode so backstories stay in canon.
          (kit.bodyType.notes ? ` Canon notes: ${kit.bodyType.notes}` : "")
      )
    } else {
      sections.push(`BODY TYPE (core powers):\n${powerToText(kit.bodyType, chosenPaths)}`)
    }
  }

  const group = (label: string, powers: CanonTraitPower[]) => {
    if (powers.length === 0) return
    if (options.concise) {
      for (const p of powers) {
        sections.push(
          `${label} - ${p.trait}${p.foundation ? ` (${p.foundation})` : ""}: ${(p.corePowers || "").split(". ").slice(0, 2).join(". ")}.` +
            (p.drawbacks ? ` Drawbacks: ${p.drawbacks}` : "")
        )
      }
    } else {
      sections.push(`${label}:\n${powers.map((p) => powerToText(p, chosenPaths)).join("\n\n")}`)
    }
  }

  group("MASK / FACE POWERS", kit.facePowers)
  group("ACCESSORY POWERS", kit.extraPowers)
  group("EYE POWERS", kit.eyePowers)
  group("HEAD POWERS", kit.headPowers)

  if (kit.background) {
    sections.push(
      `BACKGROUND RESONANCE - ${kit.background.trait}: ${kit.background.effect} ` +
        `(This comes from the artwork's backdrop color. It is an ambient environmental buff only - NOT a lineage, bloodline, or body type. ` +
        `If mentioned at all, describe it as an attunement to the character's surroundings; never as a "${kit.background.trait.toLowerCase()} resonance" of the character's soul or nature.)`
    )
  }

  if (kit.domain) {
    sections.push(
      `DOMAIN - ${kit.domain.trait} (${kit.domain.house} ${kit.domain.houseNumber}): ${kit.domain.philosophy} Divine power: ${kit.domain.divinePower}. Bonus: ${kit.domain.bonus}`
    )
  }

  if (kit.stats.length > 0) {
    sections.push(
      `ATTRIBUTES: ${kit.stats.map((s) => `${s.name} (${s.role}) = ${s.value}/10`).join(", ")}`
    )
  }

  if (kit.mouthExpression) {
    sections.push(
      `EXPRESSION: ${kit.mouthExpression} (personality flavor - informs demeanor, carries no powers)`
    )
  }

  return sections.join("\n\n")
}

/**
 * Renders the NFT's trait list for prompts, classified so the model can't
 * mistake cosmetics for lore: power-bearing traits point at the canon power
 * kit, meta traits are labeled tier/stat/environment, and appearance-only
 * traits carry explicit "not a lineage / not a mask" guardrails. Replaces
 * the old raw `trait_type: value` dump that caused "Void mask" and
 * lineage-color confusion. Built on classifyTraits - the same classification
 * the user-facing trait panel renders, so prompt and UI can never disagree.
 */
export function generateTraitContext(traits: Trait[]): string {
  if (!traits || traits.length === 0) return ""

  const powerBearing: string[] = []
  const meta: string[] = []
  const cosmetic: string[] = []

  for (const entry of classifyTraits(traits)) {
    const line = `- ${entry.trait.trait_type}: ${String(entry.trait.value)}`

    if (entry.category === "power") {
      switch (entry.slot) {
        case "body":
          powerBearing.push(`${line} (soul lineage - foundation: ${entry.power.foundation}; exact powers below)`)
          break
        case "face":
          powerBearing.push(`${line} (mask with canon powers, described below)`)
          break
        default:
          powerBearing.push(`${line} (canon powers described below)`)
      }
    } else if (entry.category === "meta") {
      switch (entry.kind) {
        case "unknown-body":
          meta.push(`${line} (unrecognized body type - do NOT invent powers for it)`)
          break
        case "background":
          meta.push(`${line} (the artwork's backdrop color - at most a passive environmental resonance, NOT a lineage or body type)`)
          break
        case "tier":
          meta.push(`${line} (power tier)`)
          break
        case "house":
          meta.push(`${line} (House affiliation)`)
          break
        case "stat":
          meta.push(`${line} (stat)`)
          break
      }
    } else {
      switch (entry.kind) {
        case "bare-faced":
          cosmetic.push(`${line} (BARE-FACED - this character wears NO mask. Never mention a mask.)`)
          break
        case "face-detail":
          cosmetic.push(`${line} (facial detail, appearance only - carries no powers)`)
          break
        case "headwear":
          cosmetic.push(`${line} (headwear, appearance only - carries no powers)`)
          break
        case "expression":
          cosmetic.push(`${line} (expression - personality flavor only, no powers)`)
          break
        default:
          cosmetic.push(`${line} (appearance only - carries no powers)`)
      }
    }
  }

  let out = `\nTraits (from the NFT's on-chain metadata):\n`
  if (powerBearing.length > 0) {
    out += `\nPower-bearing traits:\n${powerBearing.join("\n")}\n`
  }
  if (meta.length > 0) {
    out += `\nMeta traits (tier / stats / environment - never bloodlines):\n${meta.join("\n")}\n`
  }
  if (cosmetic.length > 0) {
    out += `\nAppearance-only traits (these describe how the character LOOKS. NEVER derive powers, lineages, or lore concepts from these words. A gemstone color word here - Citrine, Azurite, Jasper, Pearl, Obsidian - is just a color, NOT a soul lineage):\n${cosmetic.join("\n")}\n`
  }
  return out
}

/** True when the NFT has at least one canon-powered trait matched */
export function hasCanonPowers(traits: Trait[]): boolean {
  const kit = getCharacterPowerKit(traits)
  return !!(
    kit.bodyType ||
    kit.facePowers.length ||
    kit.extraPowers.length ||
    kit.eyePowers.length ||
    kit.headPowers.length
  )
}
