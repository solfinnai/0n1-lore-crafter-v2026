// Canonical trait-power data model for the 0N1 Force collection.
// Source of truth: "0N1_Force_Worldbuilding_Master - Full ETH Trait List" spreadsheet
// and the "0N1 Force Universe" world bible (v1.0, Feb 2026).

export type TraitCategory =
  | "Background"
  | "Body"
  | "Domain"
  | "Extra"
  | "Eyes"
  | "Face"
  | "Hair"
  | "Head"
  | "Helmet"
  | "Mouth"
  | "Spirit"
  | "Strength"
  | "Style"
  | "Type"
  | "Wear"

export interface PowerPath {
  name: string
  description: string
}

export interface CanonTraitPower {
  /** OpenSea trait category this entry matches (trait_type) */
  category: TraitCategory
  /** Exact trait value as it appears on-chain / OpenSea */
  trait: string
  /** How many NFTs in the collection carry this trait (from the master sheet) */
  quantity?: number
  /** Power family name, e.g. "Hydrokinetic Control", "Death's Embrace" */
  foundation?: string
  /** Core power description (body types) or base powers (masks/extras/eyes) */
  corePowers?: string
  /** Development / evolution paths (body types: paths 1-3; masks: advanced powers) */
  developmentPaths?: PowerPath[]
  /** Advanced powers for aura/mask/eye/horn/companion traits */
  advancedPowers?: PowerPath[]
  /** Canonical drawbacks and costs */
  drawbacks?: string
  /** Canonical counters */
  counters?: string
  /** Extra canon notes / rules */
  notes?: string
  /** True when the trait carries no powers (metadata / cosmetic / personality only) */
  metadataOnly?: boolean
}

export interface StatDefinition {
  category: "Spirit" | "Style" | "Strength"
  statName: string
  role: string
  description: string
}

export interface TypeTier {
  trait: string
  tierName: string
  powerLevel: number
  share: string
  description: string
}

export interface BackgroundResonance {
  trait: string
  effect: string
}

export interface DomainInfo {
  trait: string
  house: string
  houseNumber: string
  philosophy: string
  bodyTypeAffinity: string
  divinePower: string
  secret: string
  bonus: string
}
