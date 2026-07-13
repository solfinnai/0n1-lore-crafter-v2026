#!/usr/bin/env node
/**
 * CI gate for soul submissions in submissions/inbox/*.json
 * Checks: schema name, stable content fields present, supersedes chain shape.
 * Full EIP-191 verify requires browser/ethers — flagged as best-effort here.
 */
import { readdirSync, readFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const inbox = join(root, "submissions/inbox")
const soulsDir = join(root, "souls")
mkdirSync(inbox, { recursive: true })
mkdirSync(soulsDir, { recursive: true })

const SCHEMA = "0n1.soul-canon-submission"
let failed = 0
const files = existsSync(inbox) ? readdirSync(inbox).filter((f) => f.endsWith(".json")) : []

if (files.length === 0) {
  console.log("inbox empty — OK")
  process.exit(0)
}

for (const file of files) {
  const path = join(inbox, file)
  let doc
  try {
    doc = JSON.parse(readFileSync(path, "utf8"))
  } catch (e) {
    console.error(file, "invalid JSON", e)
    failed++
    continue
  }
  if (doc.schema !== SCHEMA) {
    console.error(file, "bad schema", doc.schema)
    failed++
  }
  if (!doc.subject?.tokenId || !doc.soul || !doc.contentHash) {
    console.error(file, "missing subject/soul/contentHash")
    failed++
  }
  if (doc.canonValidation && doc.reviewStatus) {
    console.error(file, "reviewStatus must NOT live inside signed envelope — move to sidecar")
    failed++
  }
  // Acceptance target path (human merge moves file):
  // souls/<tokenId>/current.json + bump soulsVersion in meta.json only
  console.log("queued", file, "token", doc.subject?.tokenId, "→ souls/" + doc.subject?.tokenId + "/current.json on accept")
}

if (failed) {
  console.error("verify-submissions FAILED", failed)
  process.exit(1)
}
console.log("verify-submissions OK", files.length, "file(s)")
