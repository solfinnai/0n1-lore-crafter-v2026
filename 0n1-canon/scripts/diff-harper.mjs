#!/usr/bin/env node
/**
 * Scaffold: diff Harper catalog JSON against worldbible-2026-02 body/face trait names.
 * Place harper-traits.json in draft/harper/ when ready.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const harperPath = join(root, "packages/lore-data/draft/harper/harper-traits.json")
const outDir = join(root, "packages/lore-data/draft/harper")
mkdirSync(outDir, { recursive: true })

if (!existsSync(harperPath)) {
  const stub = {
    note: "Replace with Harper import rows: [{ layer, name, foundation?, powers? }]",
    rows: [],
  }
  writeFileSync(harperPath, JSON.stringify(stub, null, 2) + "\n")
  console.log("Created stub", harperPath)
  console.log("Fill Harper rows, then re-run to produce DIFF.json")
  process.exit(0)
}

const harper = JSON.parse(readFileSync(harperPath, "utf8"))
const bodyTypes = readFileSync(join(root, "packages/lore-data/mechanics/body-types.ts"), "utf8")
const bodyNames = [...bodyTypes.matchAll(/trait:\s*"([^"]+)"/g)].map((m) => m[1])

const harperBodies = (harper.rows || [])
  .filter((r) => String(r.layer || "").toLowerCase() === "body")
  .map((r) => r.name)

const onlyHarper = harperBodies.filter((n) => !bodyNames.includes(n))
const onlyCrafter = bodyNames.filter((n) => !harperBodies.includes(n))
const both = bodyNames.filter((n) => harperBodies.includes(n))

const diff = {
  generatedAt: new Date().toISOString(),
  baseCanonVersion: "worldbible-2026-02",
  target: "harper-v2",
  body: { both, onlyHarper, onlyCrafter },
  adjudicationRequired: onlyHarper.length + onlyCrafter.length,
  incompleteFlagsRecommended: true,
}

writeFileSync(join(outDir, "DIFF.json"), JSON.stringify(diff, null, 2) + "\n")
console.log("Wrote DIFF.json — adjudicationRequired:", diff.adjudicationRequired)
