// Body-type power model consumed by the character creation flow.
// The data is derived from the canonical trait list (lib/lore/canon) so the
// creation flow, wiki, and AI prompts all share one source of truth.
import { bodyTypePowers } from "@/lib/lore/canon/body-types"
import type { CanonTraitPower } from "@/lib/lore/canon/types"

export interface PowerEvolution {
  name: string
  description: string
}

export interface PowerType {
  bodyType: string
  foundation: string
  corePower: {
    name: string
    description: string
  }
  evolutionOptions: PowerEvolution[]
  additionalPower?: {
    name: string
    description: string
    keyAspects: string[]
  }
  drawbacks?: string
  canonNotes?: string
}

// Canon core powers open with "Name - description..."; split them apart for display.
function splitCorePower(corePowers: string | undefined): { name: string; description: string } {
  if (!corePowers) return { name: "Core Power", description: "" }
  const sep = corePowers.indexOf(" - ")
  if (sep > 0 && sep < 60) {
    return { name: corePowers.slice(0, sep).trim(), description: corePowers.slice(sep + 3).trim() }
  }
  return { name: "Core Power", description: corePowers }
}

function toPowerType(canon: CanonTraitPower): PowerType {
  const core = splitCorePower(canon.corePowers)
  return {
    bodyType: canon.trait,
    foundation: canon.foundation || "",
    corePower: core,
    evolutionOptions: (canon.developmentPaths || []).map((p) => ({
      name: p.name,
      description: p.description,
    })),
    drawbacks: canon.drawbacks,
    canonNotes: canon.notes,
  }
}

export const powerTypes: PowerType[] = bodyTypePowers.map(toPowerType)

// Helper function to get power type by body type
export function getPowerByBodyType(bodyType: string): PowerType | undefined {
  const normalizedBodyType = bodyType.toLowerCase().trim()
  return powerTypes.find((power) => power.bodyType.toLowerCase().trim() === normalizedBodyType)
}

// Helper function to get all body types
export function getAllBodyTypes(): string[] {
  return powerTypes.map((power) => power.bodyType)
}
