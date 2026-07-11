// Canonical 0N1 Force lore: trait-power data, world bible, and NFT matcher.
export * from "./types"
export * from "./body-types"
export * from "./face-masks"
export * from "./accessories"
export * from "./meta-traits"
export * from "./world"
export * from "./match"

import type { CanonTraitPower } from "./types"
import { bodyTypePowers } from "./body-types"
import { faceMaskPowers } from "./face-masks"
import { extraPowers, eyePowers, headPowers } from "./accessories"

/** Every powered trait in the collection, across all categories */
export const allPoweredTraits: CanonTraitPower[] = [
  ...bodyTypePowers,
  ...faceMaskPowers,
  ...extraPowers,
  ...eyePowers,
  ...headPowers,
]
