import type { Trait } from "@/lib/types"
import type { CanonTraitPower, StatDefinition, TypeTier, BackgroundResonance, DomainInfo } from "./types"
import { bodyTypePowers } from "./body-types"
import { faceMaskPowers } from "./face-masks"
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

  for (const trait of traits) {
    const type = normalize(trait.trait_type)
    const value = String(trait.value)

    switch (type) {
      case "body": {
        kit.bodyType = findPower(bodyTypePowers, value) ?? null
        break
      }
      case "face": {
        const p = findPower(faceMaskPowers, value)
        if (p) kit.facePowers.push(p)
        else kit.cosmeticTraits.push(trait)
        break
      }
      case "extra": {
        const p = findPower(extraPowers, value)
        if (p) kit.extraPowers.push(p)
        else kit.cosmeticTraits.push(trait)
        break
      }
      case "eyes": {
        const p = findPower(eyePowers, value)
        if (p) kit.eyePowers.push(p)
        else kit.cosmeticTraits.push(trait)
        break
      }
      case "head": {
        const p = findPower(headPowers, value)
        if (p) kit.headPowers.push(p)
        else kit.cosmeticTraits.push(trait)
        break
      }
      case "background": {
        const v = normalize(value)
        kit.background =
          backgroundResonances.find((b) => normalize(b.trait) === v) ?? null
        break
      }
      case "type": {
        const v = normalize(value)
        kit.typeTier = typeTiers.find((t) => normalize(t.trait) === v) ?? null
        break
      }
      case "domain": {
        const v = normalize(value)
        kit.domain = domains.find((d) => normalize(d.trait) === v) ?? null
        break
      }
      case "spirit":
      case "style":
      case "strength": {
        const def = statDefinitions.find((s) => normalize(s.category) === type)
        const num = Number.parseInt(value, 10)
        if (def && !Number.isNaN(num)) {
          kit.stats.push({
            name: def.statName,
            role: def.role,
            value: num,
            description: def.description,
          })
        }
        break
      }
      case "mouth": {
        kit.mouthExpression = value
        break
      }
      default: {
        // Hair, Wear, Helmet, etc - cosmetic
        kit.cosmeticTraits.push(trait)
      }
    }
  }

  return kit
}

function pathsToText(label: string, paths?: { name: string; description: string }[]): string {
  if (!paths || paths.length === 0) return ""
  return `\n${label}:\n${paths.map((p) => `  - ${p.name}: ${p.description}`).join("\n")}`
}

function powerToText(p: CanonTraitPower): string {
  let out = `${p.trait}${p.foundation ? ` (${p.foundation})` : ""}`
  if (p.corePowers) out += `\n${p.corePowers}`
  out += pathsToText("Development paths", p.developmentPaths)
  out += pathsToText("Advanced powers", p.advancedPowers)
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
export function generatePowerKitContext(traits: Trait[], options: { concise?: boolean } = {}): string {
  const kit = getCharacterPowerKit(traits)
  const sections: string[] = []

  if (kit.typeTier) {
    sections.push(
      `CLASSIFICATION: ${kit.typeTier.tierName} - Level ${kit.typeTier.powerLevel} powers. ${options.concise ? "" : kit.typeTier.description}`.trim()
    )
  }

  if (kit.bodyType) {
    if (options.concise) {
      const paths = kit.bodyType.developmentPaths?.map((p) => p.name).join(", ")
      sections.push(
        `BODY TYPE - ${kit.bodyType.trait} (${kit.bodyType.foundation}): ${kit.bodyType.corePowers?.split(". ").slice(0, 3).join(". ")}.` +
          (paths ? ` Development paths: ${paths}.` : "") +
          (kit.bodyType.drawbacks ? ` Drawbacks: ${kit.bodyType.drawbacks}` : "")
      )
    } else {
      sections.push(`BODY TYPE (core powers):\n${powerToText(kit.bodyType)}`)
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
      sections.push(`${label}:\n${powers.map(powerToText).join("\n\n")}`)
    }
  }

  group("MASK / FACE POWERS", kit.facePowers)
  group("ACCESSORY POWERS", kit.extraPowers)
  group("EYE POWERS", kit.eyePowers)
  group("HEAD POWERS", kit.headPowers)

  if (kit.background) {
    sections.push(`BACKGROUND RESONANCE - ${kit.background.trait}: ${kit.background.effect}`)
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
