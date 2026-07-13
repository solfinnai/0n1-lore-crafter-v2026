import meta from "../../lore-data/mechanics/meta.json"
import type { ResolveInput } from "../../lore-schema/src/index"

/**
 * Portable resolve API. Phase 0–1: delegates to the seeded worldbible-2026-02
 * mechanics (crafter classifyTraits ontology). Consumers should pin canonVersion.
 *
 * In the lore-crafter app, prefer importing from `@/lib/lore/canon/match` until
 * codegen parity deletes the hand-maintained tables (see scripts/codegen-crafter.mjs).
 */

export type Trait = { trait_type: string; value: string | number }

export interface CharacterSheet {
  ok: boolean
  canonVersion: string
  collectionId: string
  identity: {
    typeValue: string | null
    bodyValue: string | null
    faceValue: string | null
  }
  /** Opaque classified entries — full typing lives in match.ts */
  classifiedCount: number
  promptBlocks: {
    identity: string
    powers: string
    constraints: string
  }
  gatedOut: Array<{ reason: string; detail?: string }>
}

const CONSTRAINTS = `Do not invent powers outside the resolved kit. Face: Void = bare-faced (never invent a mask). Background colors are resonance, not lineages. Gemstone parentheticals in cosmetics are colors, not bloodlines. World = The Enclave only.`

export function getCanonMeta() {
  return meta
}

export function resolveCharacter(input: {
  canonVersion?: string
  collectionId?: string
  traits: Trait[]
}): CharacterSheet {
  const canonVersion = input.canonVersion || meta.canonVersion
  const collectionId = input.collectionId || "collection.eth"
  const gatedOut: CharacterSheet["gatedOut"] = []

  if (canonVersion !== meta.canonVersion) {
    gatedOut.push({
      reason: "canon_version_mismatch",
      detail: `requested ${canonVersion}, snapshot is ${meta.canonVersion}`,
    })
  }

  if (collectionId !== "collection.eth") {
    gatedOut.push({ reason: "wrong_collection", detail: collectionId })
  }

  const traits = input.traits || []
  const typeValue = traits.find((t) => t.trait_type.toLowerCase() === "type")?.value?.toString() ?? null
  const bodyValue = traits.find((t) => t.trait_type.toLowerCase() === "body")?.value?.toString() ?? null
  const faceValue = traits.find((t) => t.trait_type.toLowerCase() === "face")?.value?.toString() ?? null

  if (!bodyValue) gatedOut.push({ reason: "missing_foundation", detail: "no Body trait" })

  const identityLines = traits.map((t) => `${t.trait_type}: ${t.value}`).join("\n")

  return {
    ok: gatedOut.every((g) => g.reason !== "wrong_collection"),
    canonVersion: meta.canonVersion,
    collectionId,
    identity: { typeValue, bodyValue, faceValue },
    classifiedCount: traits.length,
    promptBlocks: {
      identity: identityLines,
      powers: `Resolve full power kit via classifyTraits/getCharacterPowerKit in mechanics/match.ts for canonVersion=${meta.canonVersion}`,
      constraints: CONSTRAINTS,
    },
    gatedOut,
  }
}

/** Normalize OpenSea-shaped traits then resolve. Alias map expands in Harper v2. */
export function resolveFromOpenSea(traits: Trait[], opts?: { canonVersion?: string }): CharacterSheet {
  const normalized = traits.map((t) => ({
    trait_type: String(t.trait_type).trim(),
    value: typeof t.value === "string" ? t.value.trim() : t.value,
  }))
  return resolveCharacter({ traits: normalized, canonVersion: opts?.canonVersion })
}

export type { ResolveInput }
