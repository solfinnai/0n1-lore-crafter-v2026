#!/usr/bin/env node
/**
 * Codegen: sync 0n1-canon mechanics → lore-crafter lib/lore/canon
 * Keeps embedded resolver (offline constitution) while lore-data is SoT.
 *
 * Usage: node 0n1-canon/scripts/codegen-crafter.mjs
 * After run, crafter tables match the canon package (parity).
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { createHash } from "crypto"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const crafterRoot = join(root, "..")
const src = join(root, "packages/lore-data/mechanics")
const dest = join(crafterRoot, "lib/lore/canon")

const files = [
  "accessories.ts",
  "body-types.ts",
  "face-masks.ts",
  "index.ts",
  "match.ts",
  "meta-traits.ts",
  "selection-rules.ts",
  "types.ts",
  "world.ts",
]

mkdirSync(dest, { recursive: true })
const hashes = {}
for (const f of files) {
  const from = join(src, f)
  const to = join(dest, f)
  if (!existsSync(from)) {
    console.error(`Missing source ${f}`)
    process.exit(1)
  }
  cpSync(from, to)
  const buf = readFileSync(from)
  hashes[f] = createHash("sha256").update(buf).digest("hex")
  console.log(`synced ${f}`)
}

const stamp = {
  canonVersion: JSON.parse(readFileSync(join(src, "meta.json"), "utf8")).canonVersion,
  generatedAt: new Date().toISOString(),
  files: hashes,
}
writeFileSync(join(dest, "GENERATED.json"), JSON.stringify(stamp, null, 2) + "\n")
writeFileSync(join(root, "packages/lore-data/indexes/codegen-parity.json"), JSON.stringify(stamp, null, 2) + "\n")
console.log("codegen complete — embedded crafter canon at parity with lore-data")
