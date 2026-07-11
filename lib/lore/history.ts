export interface HistoricalEvent {
  name: string
  date: string
  description: string
  significance: string
  keyFigures?: string[]
}

export const history: HistoricalEvent[] = [
  {
    name: "The Great Merge",
    date: "2089",
    description:
      "The catastrophic event when digital and physical realities began to overlap following a quantum computing experiment gone wrong",
    significance:
      "Created the current world where digital entities can manifest physically and spiritual energies can exist in code",
    keyFigures: ["Dr. Amara Sato", "The First Compiler"],
  },
  {
    name: "The Code Monk Emergence",
    date: "2094-2101",
    description:
      "Period when traditional spiritual leaders began incorporating digital technologies into their practices, eventually becoming the first Code Monks",
    significance: "Established the spiritual-technological balance that now governs much of society",
    keyFigures: ["Master Kira", "The Digital Buddha"],
  },
  {
    name: "The Neon Syndicate Consolidation",
    date: "2120",
    description: "Corporate takeover of major digital infrastructure following the Third Data Crash",
    significance: "Established the current power structure and class system",
    keyFigures: ["CEO Vex Nakamura", "The Algorithm Board"],
  },
  {
    name: "The Phantom Uprising",
    date: "2142-2145",
    description: "Failed revolution against Syndicate control that resulted in the creation of the Undernet",
    significance: "Created the current underground resistance movement and established digital safe havens",
    keyFigures: ["Ghost Protocol", "The Nameless Function"],
  },
  {
    name: "The Quantum Revelation",
    date: "2151",
    description: "Discovery of the Quantum Fold and the spiritual entities that inhabit it",
    significance: "Revolutionized understanding of digital consciousness and opened new power possibilities",
    keyFigures: ["Dr. Rei Quantum", "The Observer"],
  },
]
