#!/usr/bin/env node
/**
 * pnpm validate — Zod meta + required mechanics files + #922 fixture shape.
 */
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const metaPath = join(root, "packages/lore-data/mechanics/meta.json")
const required = [
  "packages/lore-data/mechanics/meta.json",
  "packages/lore-data/mechanics/match.ts",
  "packages/lore-data/mechanics/body-types.ts",
  "packages/lore-data/mechanics/selection-rules.ts",
  "packages/lore-data/mechanics/world.ts",
  "fixtures/nft-922.json",
  "CANON.md",
]

let failed = false
for (const rel of required) {
  const p = join(root, rel)
  if (!existsSync(p)) {
    console.error(`MISSING: ${rel}`)
    failed = true
  }
}

const meta = JSON.parse(readFileSync(metaPath, "utf8"))
if (meta.canonVersion !== "worldbible-2026-02") {
  console.error(`Expected canonVersion worldbible-2026-02, got ${meta.canonVersion}`)
  failed = true
}
if (!meta.soulsVersion) {
  console.error("meta.soulsVersion required (split from canonVersion)")
  failed = true
}

const fixture = JSON.parse(readFileSync(join(root, "fixtures/nft-922.json"), "utf8"))
if (fixture.tokenId !== "922" || !Array.isArray(fixture.traits) || fixture.traits.length < 10) {
  console.error("fixtures/nft-922.json invalid")
  failed = true
}

if (failed) {
  console.error("validate FAILED")
  process.exit(1)
}
console.log("validate OK — worldbible-2026-02 seed intact")
