/**
 * Lore document hub for AI prompts.
 *
 * RETIRED: Pre-2026 Neo-Tokyo / Neo-Digital Age / Great Merge / Soul-Code corpus
 * (lastUpdated 2023-11-15) has been removed. Prompt assembly must use
 * lib/lore/canon/world.ts (worldbible-2026-02 / The Enclave) instead.
 *
 * These helpers remain for any legacy imports; they return Enclave-aligned
 * documents only. Prefer importing from @/lib/lore/canon/world directly.
 */

import {
  worldOverview,
  districts,
  canonFactions,
  historyTimeline,
  glossary,
  designPrinciples,
} from "./canon/world"

export type LoreCategory =
  | "world-building"
  | "character-archetypes"
  | "history"
  | "technology"
  | "spirituality"
  | "factions"
  | "locations"
  | "powers"
  | "terminology"
  | "narrative-style"
  | "psychology"
  | "quantum-consciousness"
  | "digital-ecology"
  | "socio-economics"
  | "meta-narrative"
  | "cultural-dynamics"
  | "temporal-mechanics"
  | "corruption-systems"
  | "evolution-patterns"

export interface LoreDocument {
  id: string
  title: string
  category: LoreCategory
  content: string
  tags: string[]
  relatedDocuments?: string[]
  lastUpdated: string
}

const CANON_UPDATED = "2026-02-01"

/** Enclave-only documents (worldbible-2026-02). */
export const loreDocuments: LoreDocument[] = [
  {
    id: "world-overview",
    title: "0N1 Universe: The Enclave",
    category: "world-building",
    content: `${worldOverview.setting}

One Source: ${worldOverview.oneSource}

Cosmology: ${worldOverview.cosmology}

Chronology: ${worldOverview.chronology}`,
    tags: ["setting", "overview", "enclave"],
    lastUpdated: CANON_UPDATED,
  },
  {
    id: "narrative-voice",
    title: "0N1 Narrative Style Guide",
    category: "narrative-style",
    content: `Tone: cyberpunk grit inside The Enclave, blended with oni folklore and One Source mysticism.

FORBIDDEN retired lexicon (never use): Neo-Tokyo, Neo-Digital Age, year 2157, The Great Merge, Soul-Code, Blazing Protocol, Blazing Temple as a Neo-Tokyo hub, Neon Syndicate.

PREFERRED lexicon: One Source, Gen3sis Tree, The Veil, The Glitch, MORIA, F4LL3N, Akuma, K4M-1 Houses, world-electric, Nexus Chronology, Y0K-A1 / B4K3M0-N0 / 0N1 / K4M-1.

Imagery: district contrast (Halcyon vs The Vents), Veil shimmer, Glitch horizons, Gen3sis light, turbine world-electric.`,
    tags: ["style", "voice", "tone"],
    lastUpdated: CANON_UPDATED,
  },
  {
    id: "locations-guide",
    title: "Districts of The Enclave",
    category: "locations",
    content: districts.map((d) => `${d.name} (${d.role}): ${d.description}`).join("\n\n"),
    tags: ["places", "districts"],
    lastUpdated: CANON_UPDATED,
  },
  {
    id: "factions-guide",
    title: "Houses & Factions",
    category: "factions",
    content: canonFactions.map((f) => `${f.name}: ${f.description}`).join("\n\n"),
    tags: ["factions", "houses"],
    lastUpdated: CANON_UPDATED,
  },
  {
    id: "history-guide",
    title: "Nexus Chronology",
    category: "history",
    content: historyTimeline.map((e) => `${e.era}: ${e.events}`).join("\n\n"),
    tags: ["history", "timeline"],
    lastUpdated: CANON_UPDATED,
  },
  {
    id: "terminology-lexicon",
    title: "Enclave Glossary",
    category: "terminology",
    content: Object.entries(glossary)
      .map(([term, def]) => `${term}: ${def}`)
      .join("\n"),
    tags: ["terminology", "glossary"],
    lastUpdated: CANON_UPDATED,
  },
  {
    id: "powers-design",
    title: "Power Design Principles",
    category: "powers",
    content: designPrinciples.map((p) => `${p.name}: ${p.description}`).join("\n\n"),
    tags: ["powers", "design"],
    lastUpdated: CANON_UPDATED,
  },
  {
    id: "character-archetypes",
    title: "Enclave Archetype Notes",
    category: "character-archetypes",
    content: `Archetypes should fit life under the dome: Force operatives, House students and Ronin, Boundary Wardens, Market operators, Synapse scholars, Vents survivors, Halcyon elites, and those touched by Akuma or F4LL3N corruption. Ground roles in Type tier and body lineage powers — never invent off-kit abilities.`,
    tags: ["character-voice", "examples", "archetypes"],
    lastUpdated: CANON_UPDATED,
  },
]

export function getDocumentsByCategory(category: LoreCategory): LoreDocument[] {
  return loreDocuments.filter((doc) => doc.category === category)
}

export function getDocumentById(id: string): LoreDocument | undefined {
  return loreDocuments.find((doc) => doc.id === id)
}

export function searchDocumentsByTags(tags: string[]): LoreDocument[] {
  return loreDocuments.filter((doc) => tags.some((tag) => doc.tags.includes(tag)))
}
