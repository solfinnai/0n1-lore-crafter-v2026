import type { Trait } from "@/lib/types"
import type { CanonTraitPower } from "./types"
import { getCharacterPowerKit } from "./match"

// Canonical development-path selection rules.
// From the master sheet:
// - Citrine: Yokai specialize in ONE elemental combo; Bakemono in TWO combos
//   made of four distinct elements (fixed pairs - combos cannot share an element).
// - Azurite: Yokai use and specialize in TWO emotions; Bakemono in FOUR.
//   No Azurite can tap into all six.
// - Every other body type: choose ONE development path.
// The sheet defines counts for Y0K-A1 and B4K3M0-N0; for the rarer 0N1 and
// K4M-1 tiers we grant the Bakemono allowance (canon rule still to be written).

export interface PathSelectionRules {
  /** How many development paths the character may choose */
  count: number
  /** Human-readable statement of the canon rule */
  rule: string
  /** Citrine Bakemono+: chosen combos may not share an element */
  disjointElements: boolean
  /** True when the count for this tier is an extrapolation, not written canon */
  extrapolated: boolean
}

const CITRINE_ELEMENTS = ["Earth", "Fire", "Water", "Air", "Space"]

/** Extracts the element pair from a Citrine combo path name like "Earth + Fire: Magma Surge" */
export function getComboElements(pathName: string): string[] {
  const head = pathName.split(":")[0]
  return CITRINE_ELEMENTS.filter((el) => new RegExp(`\\b${el}\\b`, "i").test(head))
}

function tierKey(typeTier: string | null | undefined): "yokai" | "bakemono" | "oni" | "kami" {
  const t = (typeTier || "").toLowerCase()
  if (t.includes("b4k3m0")) return "bakemono"
  if (t.includes("k4m-1") || t.includes("k4m1")) return "kami"
  if (t === "0n1" || t.includes("demon")) return "oni"
  return "yokai"
}

export function getPathSelectionRules(bodyTypeTrait: string | null, typeTier: string | null | undefined): PathSelectionRules {
  const body = (bodyTypeTrait || "").toLowerCase()
  const tier = tierKey(typeTier)

  if (body === "citrine") {
    if (tier === "yokai") {
      return {
        count: 1,
        rule: "Canon: a Y0K-A1 Citrine specializes in ONE elemental convergence combo (each element can still be used individually).",
        disjointElements: false,
        extrapolated: false,
      }
    }
    return {
      count: 2,
      rule:
        tier === "bakemono"
          ? "Canon: a B4K3M0-N0 Citrine specializes in TWO convergence combos built from four distinct elements - the two combos cannot share an element, and the pairs are fixed once chosen."
          : "Higher-tier Citrine: two convergence combos from four distinct elements (Bakemono allowance - the canon rule for this tier is still being written).",
      disjointElements: true,
      extrapolated: tier !== "bakemono",
    }
  }

  if (body === "azurite") {
    if (tier === "yokai") {
      return {
        count: 2,
        rule: "Canon: a Y0K-A1 Azurite uses and specializes in TWO of the six emotions. No Azurite can tap into all six.",
        disjointElements: false,
        extrapolated: false,
      }
    }
    return {
      count: 4,
      rule:
        tier === "bakemono"
          ? "Canon: a B4K3M0-N0 Azurite uses and specializes in FOUR of the six emotions. No Azurite can tap into all six."
          : "Higher-tier Azurite: four of the six emotions (Bakemono allowance - the canon rule for this tier is still being written). No Azurite can tap into all six.",
      disjointElements: false,
      extrapolated: tier !== "bakemono",
    }
  }

  return {
    count: 1,
    rule: "Choose ONE development path - your character's powers grow along it.",
    disjointElements: false,
    extrapolated: false,
  }
}

/** Validates a set of chosen development paths against canon rules. Returns an error message or null. */
export function validateChosenPaths(
  bodyType: CanonTraitPower,
  typeTier: string | null | undefined,
  chosen: string[],
): string | null {
  const rules = getPathSelectionRules(bodyType.trait, typeTier)
  if (chosen.length > rules.count) {
    return `You can only choose ${rules.count} path${rules.count === 1 ? "" : "s"} - ${rules.rule}`
  }
  if (rules.disjointElements && chosen.length === 2) {
    const [a, b] = chosen.map(getComboElements)
    const overlap = a.filter((el) => b.includes(el))
    if (overlap.length > 0) {
      return `Your two convergence combos cannot share an element (both use ${overlap.join(", ")}). Pick combos covering four distinct elements.`
    }
  }
  return null
}

/** Convenience: rules for a full trait set */
export function getPathRulesForTraits(traits: Trait[]): { rules: PathSelectionRules; bodyType: CanonTraitPower | null; typeTier: string | null } {
  const kit = getCharacterPowerKit(traits)
  const typeTier = kit.typeTier?.trait ?? null
  return {
    rules: getPathSelectionRules(kit.bodyType?.trait ?? null, typeTier),
    bodyType: kit.bodyType,
    typeTier,
  }
}
