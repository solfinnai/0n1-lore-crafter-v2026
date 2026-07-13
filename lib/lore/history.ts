export interface HistoricalEvent {
  name: string
  description: string
}

/** @deprecated Prefer historyTimeline from lib/lore/canon/world.ts */
export const history: HistoricalEvent[] = [
  {
    name: "The Shift",
    description:
      "Akuma and Myre attack that cost The Enclave its Emperor, sealed the city, and created The Glitch.",
  },
  {
    name: "The K4M-1 God War",
    description: "Thousand-year rivalry among seven divine Houses that reshaped districts overnight.",
  },
  {
    name: "The Awakening",
    description:
      "Present era: The Nameless awaken, F4LL3N return, and the 7,777 golden warriors are reborn in citizens.",
  },
]
