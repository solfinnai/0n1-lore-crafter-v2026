export interface Location {
  name: string
  description: string
  significance: string
}

/** @deprecated Prefer districts from lib/lore/canon/world.ts */
export const locations: Location[] = [
  {
    name: "The Vents",
    description: "Gritty heart of the city above ancient turbines; tribal and unregulated.",
    significance: "Most populated district; Akuma activity highest",
  },
  {
    name: "The Synapse",
    description: "Nerve center of knowledge, supercomputers, and the One Source chamber.",
    significance: "Repository of world knowledge; Core Chamber of the One Source",
  },
  {
    name: "The Battlements",
    description: "Gigantic perimeter wall defended by Boundary Wardens.",
    significance: "Last line against The Glitch and a Second Shift",
  },
  {
    name: "The Markets",
    description: "Commercial labyrinth where anything that has existed can be found.",
    significance: "Trade hub and black market for ancient tech",
  },
]
