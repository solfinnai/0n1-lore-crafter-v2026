// Main lore export file that combines all lore modules
import { worldSetting } from "./world-setting"
import { factions } from "./factions"
import { terminology } from "./terminology"
import { themes } from "./themes"
import { storytellingStyle } from "./storytelling-style"
import { locations } from "./locations"
import { powerSystems } from "./power-systems"
import { history } from "./history"

// Export the complete lore object
export const lore = {
  worldSetting,
  factions,
  terminology,
  themes,
  storytellingStyle,
  locations,
  powerSystems,
  history,
}

// Helper function to generate lore context for prompts
export function generateLoreContext(focus: string[] = []): string {
  let context = ""

  // If specific focus areas are provided, only include those
  // Otherwise include a standard set of lore elements
  const areasToInclude =
    focus.length > 0 ? focus : ["worldSetting", "factions", "terminology", "themes", "storytellingStyle"]

  if (areasToInclude.includes("worldSetting")) {
    context += `
The 0N1 Force universe is set in ${worldSetting.era}, primarily in ${worldSetting.location}.
This world features ${worldSetting.technology} and a society that is ${worldSetting.society}.
${worldSetting.spirituality}
`
  }

  if (areasToInclude.includes("factions")) {
    context += `
Key factions include:
${factions
  .slice(0, 3)
  .map((f) => `- ${f.name}: ${f.description}`)
  .join("\n")}
`
  }

  if (areasToInclude.includes("terminology")) {
    context += `
Important terminology:
${Object.entries(terminology)
  .slice(0, 5)
  .map(([term, def]) => `- ${term}: ${def}`)
  .join("\n")}
`
  }

  if (areasToInclude.includes("themes")) {
    context += `
Core themes to explore:
${themes
  .slice(0, 4)
  .map((theme) => `- ${theme}`)
  .join("\n")}
`
  }

  if (areasToInclude.includes("storytellingStyle")) {
    context += `
Your suggestions should follow this storytelling style:
- Tone: ${storytellingStyle.tone}
- Imagery: ${storytellingStyle.imagery}
- Dialogue: ${storytellingStyle.dialogue}
`
  }

  if (areasToInclude.includes("locations")) {
    context += `
Notable locations:
${locations
  .slice(0, 3)
  .map((loc) => `- ${loc.name}: ${loc.description}`)
  .join("\n")}
`
  }

  if (areasToInclude.includes("powerSystems")) {
    context += `
Power systems:
${powerSystems
  .slice(0, 2)
  .map((power) => `- ${power.name}: ${power.description}`)
  .join("\n")}
`
  }

  if (areasToInclude.includes("history")) {
    context += `
Key historical events:
${history
  .slice(0, 2)
  .map((event) => `- ${event.name}: ${event.description}`)
  .join("\n")}
`
  }

  return context
}
