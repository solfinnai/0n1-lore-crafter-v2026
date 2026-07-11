export interface Archetype {
  name: string
  category: string
  description: string
  example: string
}

export const archetypes: Archetype[] = [
  // Core Protagonist Archetypes
  {
    name: "The Hero",
    category: "Core Protagonist",
    description: "A character who faces challenges and grows throughout the story, embodying virtuous qualities.",
    example: "A village warrior who rises to defend their homeland from an invading army.",
  },
  {
    name: "The Anti-Hero",
    category: "Core Protagonist",
    description: "A protagonist with flawed morals who achieves good ends through questionable means.",
    example: "A cynical bounty hunter who fights corruption while pursuing personal gain.",
  },
  {
    name: "The Chosen One",
    category: "Core Protagonist",
    description: "A character marked by destiny or prophecy for a greater purpose.",
    example: "The seventh son of a seventh son, destined to break an ancient curse.",
  },
  {
    name: "The Everyman",
    category: "Core Protagonist",
    description: "An ordinary person who rises to face extraordinary circumstances.",
    example: "A baker who becomes involved in political intrigue after overhearing a conspiracy.",
  },

  // Support Archetypes
  {
    name: "The Mentor",
    category: "Support",
    description: "A wise guide who shares knowledge and experience with others.",
    example: "An elderly alchemist teaching the secrets of forbidden magic.",
  },
  {
    name: "The Ally",
    category: "Support",
    description: "A loyal companion who provides direct support and friendship.",
    example: "A skilled ranger who uses their tracking abilities to aid the main quest.",
  },
  {
    name: "The Guardian",
    category: "Support",
    description: "A protector bound by duty to defend something or someone important.",
    example: "An immortal sentinel watching over an ancient sealed evil.",
  },
  {
    name: "The Herald",
    category: "Support",
    description: "A messenger or harbinger who brings news of change or adventure.",
    example: "A mysterious traveler warning villages of an approaching plague.",
  },

  // Antagonist Archetypes
  {
    name: "The Nemesis",
    category: "Antagonist",
    description: "The primary opposing force to the protagonist, often their dark reflection.",
    example: "A former friend turned rival seeking the same powerful artifact.",
  },
  {
    name: "The Mastermind",
    category: "Antagonist",
    description: "A manipulative orchestrator who works from the shadows.",
    example: "A court advisor secretly controlling multiple kingdoms through blackmail.",
  },
  {
    name: "The Force of Nature",
    category: "Antagonist",
    description: "An unstoppable power that creates conflict through its very existence.",
    example: "An ancient dragon whose awakening threatens to destroy the realm.",
  },

  // Neutral Archetypes
  {
    name: "The Trickster",
    category: "Neutral",
    description: "A chaos-bringing character who challenges established orders and assumptions.",
    example: "A mischievous spirit who teaches lessons through pranks and riddles.",
  },
  {
    name: "The Merchant",
    category: "Neutral",
    description: "A trader in goods, services, or information who follows opportunity.",
    example: "A traveling merchant with a network of spies and rare artifacts.",
  },
  {
    name: "The Shapeshifter",
    category: "Neutral",
    description: "A character whose loyalty and identity remain fluid and uncertain.",
    example: "A diplomat working for multiple factions with unclear true allegiance.",
  },
  {
    name: "The Threshold Guardian",
    category: "Neutral",
    description: "A challenger who tests others' worth and readiness.",
    example: "A mystical being who poses trials before allowing passage to sacred grounds.",
  },

  // Social Archetypes
  {
    name: "The Leader",
    category: "Social",
    description: "One who guides groups and bears the burden of command.",
    example: "A rebel commander balancing military necessity with moral principles.",
  },
  {
    name: "The Outcast",
    category: "Social",
    description: "A character who exists outside normal society's boundaries.",
    example: "A shunned prophet whose dire warnings prove true.",
  },
  {
    name: "The Sage",
    category: "Social",
    description: "A keeper and sharer of knowledge and wisdom.",
    example: "A reclusive scholar who holds the key to understanding ancient prophecies.",
  },

  // Circumstantial Archetypes
  {
    name: "The Innocent",
    category: "Circumstantial",
    description: "A pure-hearted character whose nature affects those around them.",
    example: "A child whose untainted view of the world changes hardened hearts.",
  },
  {
    name: "The Catalyst",
    category: "Circumstantial",
    description: "One whose actions or presence trigger significant changes.",
    example: "A wandering bard whose songs inspire revolution in every town they visit.",
  },
]

// Helper function to get archetype by name
export function getArchetypeByName(name: string): Archetype | undefined {
  return archetypes.find((a) => a.name === name)
}

// Helper function to get all archetype names
export function getArchetypeNames(): string[] {
  return archetypes.map((a) => a.name)
}

// Helper function to get archetypes grouped by category
export function getArchetypesByCategory(): Record<string, Archetype[]> {
  return archetypes.reduce(
    (acc, archetype) => {
      if (!acc[archetype.category]) {
        acc[archetype.category] = []
      }
      acc[archetype.category].push(archetype)
      return acc
    },
    {} as Record<string, Archetype[]>,
  )
}
