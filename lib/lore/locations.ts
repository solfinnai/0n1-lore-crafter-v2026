export interface Location {
  name: string
  description: string
  significance: string
  dangers?: string[]
  opportunities?: string[]
}

export const locations: Location[] = [
  {
    name: "The Blazing Temple",
    description: "Ancient temple complex retrofitted with quantum servers and holographic prayer stations",
    significance: "Spiritual center where the digital and physical realms are closest",
    dangers: ["Digital yokai manifestations", "Reality distortions", "Temple guardians"],
    opportunities: ["Spiritual enlightenment", "Code purification", "Ancient knowledge"],
  },
  {
    name: "Neon District",
    description:
      "Densely populated urban area where holographic advertisements battle for attention above crowded streets",
    significance: "Cultural melting pot where all factions interact",
    dangers: ["Syndicate surveillance", "Identity thieves", "Data predators"],
    opportunities: ["Information trading", "Underground connections", "Technological innovations"],
  },
  {
    name: "The Quantum Fold",
    description: "A hidden dimension accessible only through specific digital-spiritual gateways",
    significance: "Source of many mystical powers and abilities",
    dangers: ["Reality fragmentation", "Consciousness dissolution", "Temporal anomalies"],
    opportunities: ["Power acquisition", "Spiritual evolution", "Timeline manipulation"],
  },
  {
    name: "The Undernet",
    description: "Digital underworld built in abandoned server infrastructure and forgotten code",
    significance: "Haven for digital outcasts and revolutionary ideas",
    dangers: ["Corrupted code entities", "Memory-eating viruses", "Syndicate raids"],
    opportunities: ["Forbidden knowledge", "Identity masking", "Revolutionary alliances"],
  },
  {
    name: "Ancestral Circuits",
    description: "Ancient network pathways where digital ancestors and memories are preserved",
    significance: "Repository of historical knowledge and spiritual guidance",
    dangers: ["Memory traps", "Identity absorption", "Past trauma manifestations"],
    opportunities: ["Ancestral guidance", "Lost techniques", "Identity reinforcement"],
  },
]
