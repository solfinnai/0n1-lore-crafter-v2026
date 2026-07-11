export interface Faction {
  name: string
  description: string
  alignment: string
  territory?: string
  notableMembers?: string[]
}

export const factions: Faction[] = [
  {
    name: "The Blazing Temple",
    description: "Digital monks who maintain the sacred code that bridges spiritual and digital realms",
    alignment: "Neutral guardians of balance",
    territory: "The Sacred Network Nodes and ancient temple complexes throughout Neo-Tokyo",
    notableMembers: ["Master Cipher", "The Eternal Compiler"],
  },
  {
    name: "Neon Syndicate",
    description: "Corporate conglomerate controlling most of the digital infrastructure",
    alignment: "Antagonistic to individual freedom",
    territory: "The Upper City and major data centers",
    notableMembers: ["Director Vex", "The Board of Algorithms"],
  },
  {
    name: "The Phantom Network",
    description: "Underground collective of hackers and digital nomads",
    alignment: "Chaotic freedom fighters",
    territory: "The Undernet and abandoned server farms",
    notableMembers: ["Ghost Protocol", "Binary Whisper"],
  },
  {
    name: "Code Ronin",
    description: "Masterless digital warriors who sell their skills to the highest bidder",
    alignment: "Neutral mercenaries",
    territory: "Scattered throughout the digital and physical realms",
    notableMembers: ["Slash/Zero", "The Nameless Function"],
  },
  {
    name: "Quantum Ascendancy",
    description: "Spiritual-technological cult seeking to transcend physical form",
    alignment: "Radical transcendentalists",
    territory: "Hidden quantum computing facilities",
    notableMembers: ["The Superposition", "Observer Prime"],
  },
]
