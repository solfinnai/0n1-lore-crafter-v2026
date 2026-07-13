export interface Faction {
  name: string
  description: string
  territory: string
}

/** @deprecated Prefer canonFactions from lib/lore/canon/world.ts */
export const factions: Faction[] = [
  {
    name: "The 0N1 Force",
    description: "Elite protectors of The Enclave under the Council of Masks.",
    territory: "Force holdings across The Enclave; Council of Masks",
  },
  {
    name: "The K4M-1 Houses",
    description: "Seven divine Houses shaped by a thousand-year God War.",
    territory: "House districts and contested chakra points",
  },
  {
    name: "The F4LL3N",
    description: "Chaos-aligned army returned from the Akuma realm to seize the Gen3sis Tree.",
    territory: "Underrealm ingress points; infiltrated Synapse cells",
  },
]
