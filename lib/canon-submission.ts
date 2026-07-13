// Soul Canon Submission: versioned, signed, self-verifying export format.
//
// The JSON file this module produces is the durable contract between the Lore
// Crafter and any future canon engine: the engine verifies authorship from the
// file alone (content hash + EIP-191 signature), without trusting this app or
// its storage. The embedded validation report is ADVISORY - an ingesting
// engine must re-run validateForCanon itself.

import type { CharacterData, Trait } from "@/lib/types"
import { classifyTraits, getCharacterPowerKit } from "@/lib/lore/canon/match"
import { validateChosenPaths, getPathSelectionRules } from "@/lib/lore/canon/selection-rules"
import { bodyTypePowers } from "@/lib/lore/canon/body-types"
import { getPowerByBodyType } from "@/lib/powers"
import { isSampleToken } from "@/lib/sample-token"

export const SUBMISSION_SCHEMA = "0n1.soul-canon-submission"
export const SUBMISSION_SCHEMA_VERSION = "1.0.0"
export const CANON_DATA_VERSION = "worldbible-2026-02"
const APP_NAME = "0n1-lore-crafter"
const APP_VERSION = "0.1.0"
const FORCE_CONTRACT = "0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d"
const EXPORTS_KEY = "oni-canon-exports" // nftId -> last submissionId, for supersedes

// ---------------------------------------------------------------------------
// Canonical JSON + hashing
// ---------------------------------------------------------------------------

/**
 * Deterministic serialization - the single definition of "the bytes that get
 * hashed". Export and verification MUST both use this exact function.
 * Rules (format contract, v1):
 * - Objects: keys sorted by UTF-16 code units; keys with `undefined` values
 *   dropped; emitted by string concatenation (never by rebuilding an object,
 *   which a `__proto__` key would silently corrupt).
 * - Arrays: order and length preserved; `undefined`/holes emit `null`
 *   (matching JSON.stringify), so in-memory and re-parsed values hash alike.
 * - Strings/numbers: native JSON.stringify (well-formed escaping incl. lone
 *   surrogates). No unicode normalization anywhere in this path.
 * - Throws on non-finite numbers, BigInt, functions, symbols, and non-plain
 *   objects: signing silently-corrupted data is worse than failing.
 */
export function stableStringify(value: unknown): string {
  if (value === null) return "null"
  const t = typeof value
  if (t === "string" || t === "boolean") return JSON.stringify(value)
  if (t === "number") {
    if (!Number.isFinite(value as number)) {
      throw new Error("Cannot canonicalize non-finite number")
    }
    return JSON.stringify(value)
  }
  if (t === "bigint" || t === "function" || t === "symbol" || t === "undefined") {
    throw new Error(`Cannot canonicalize value of type ${t}`)
  }
  if (Array.isArray(value)) {
    const parts: string[] = []
    for (let i = 0; i < value.length; i++) {
      const v = value[i]
      parts.push(v === undefined ? "null" : stableStringify(v))
    }
    return `[${parts.join(",")}]`
  }
  const proto = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) {
    throw new Error("Cannot canonicalize non-plain object")
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  const parts: string[] = []
  for (const key of keys) {
    const v = obj[key]
    if (v === undefined) continue
    parts.push(`${JSON.stringify(key)}:${stableStringify(v)}`)
  }
  return `{${parts.join(",")}}`
}

export async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error("SHA-256 unavailable: requires a secure context (HTTPS or localhost)")
  }
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

const hashTag = (hex: string) => `sha256:${hex.toLowerCase()}`
const sameHash = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CheckLevel = "pass" | "warn" | "error" | "skip"

export interface CanonCheck {
  id: string
  level: CheckLevel
  detail?: string
}

export interface CanonValidationReport {
  reportVersion: "1.0.0"
  canonDataVersion: string
  validatedAt: string
  status: "pass" | "warnings" | "errors"
  errors: number
  warnings: number
  checks: CanonCheck[]
}

export interface SubmissionSignature {
  type: "eip191-personal-sign"
  contentHash: string
  message: string
  signature: string
  signedAt: string
}

export interface CanonSubmission {
  schema: typeof SUBMISSION_SCHEMA
  schemaVersion: typeof SUBMISSION_SCHEMA_VERSION
  submissionId: string
  createdAt: string
  app: { name: string; version: string }
  subject: {
    chain: "ethereum"
    collection: "force"
    contract: string
    tokenId: string
    traitsHash: string
  }
  soul: CharacterData
  canonValidation: CanonValidationReport
  provenance: {
    level: "signed" | "unsigned"
    wallet: string | null
    signature: SubmissionSignature | null
  }
  supersedes: string | null
}

// ---------------------------------------------------------------------------
// Canon validation
// ---------------------------------------------------------------------------

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ")
const str = (v: unknown) => (typeof v === "string" ? v : "")
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function quoteAround(text: string, re: RegExp): string {
  const m = re.exec(text)
  if (!m) return ""
  const start = Math.max(0, m.index - 30)
  const end = Math.min(text.length, m.index + m[0].length + 30)
  return `"...${text.slice(start, end).replace(/\s+/g, " ")}..."`
}

/** Traits sanitized so no canon function can throw on malformed storage. */
function sanitizeTraits(soul: CharacterData): Trait[] {
  const raw = Array.isArray(soul?.traits) ? soul.traits : []
  return raw
    .filter((t: any) => t && typeof t.trait_type === "string" && t.value != null)
    .map((t: any) => ({ trait_type: t.trait_type, value: String(t.value) }))
}

function sameTraitSet(a: Trait[], b: Trait[]): boolean {
  const key = (t: Trait) => `${norm(t.trait_type)}=${norm(String(t.value))}`
  const setA = a.map(key).sort().join("|")
  const setB = b.map(key).sort().join("|")
  return setA === setB
}

/**
 * Checks a soul against collection canon. Never throws on malformed souls -
 * legacy localStorage data predates every schema this app has had.
 * Policy: errors block export; warnings need explicit acknowledgment; legacy
 * power names that don't match today's canon kit are warnings, never errors.
 */
export async function validateForCanon(soul: CharacterData): Promise<CanonValidationReport> {
  const checks: CanonCheck[] = []
  const check = (id: string, level: CheckLevel, detail?: string) => {
    checks.push(detail ? { id, level, detail } : { id, level })
  }

  // Structure
  for (const [field, value] of [
    ["soulName", soul?.soulName],
    ["archetype", soul?.archetype],
    ["background", soul?.background],
  ] as const) {
    check(
      `structure.required.${field}`,
      str(value).trim() ? "pass" : "error",
      str(value).trim() ? undefined : `${field} is empty`,
    )
  }

  // Traits well-formedness
  const traits = sanitizeTraits(soul)
  const rawCount = Array.isArray(soul?.traits) ? soul.traits.length : 0
  check(
    "traits.self-consistent",
    rawCount === 0 ? "error" : traits.length < rawCount ? "error" : "pass",
    `${traits.length}/${rawCount} well-formed traits`,
  )

  const classified = classifyTraits(traits)
  const kit = getCharacterPowerKit(traits)
  const hasBodyTrait = traits.some((t) => norm(t.trait_type) === "body")
  const bareFaced = classified.some((e) => e.category === "cosmetic" && e.kind === "bare-faced")
  // Raw on-chain tier value (e.g. "Y0K-A1"); selection-rules matches substrings.
  const rawTier = traits.find((t) => norm(t.trait_type) === "type")?.value ?? null

  const powers: string[] = (Array.isArray(soul?.powersAbilities?.powers)
    ? soul.powersAbilities!.powers
    : []
  ).filter((p): p is string => typeof p === "string")

  // Development-path selection rules
  if (kit.bodyType) {
    const pathNames = new Set((kit.bodyType.developmentPaths ?? []).map((p) => norm(p.name)))
    // Filter TO the kit's path names - legacy souls carry old-era power
    // strings that must not corrupt the count.
    const chosen = powers.filter((p) => pathNames.has(norm(p)))
    const rules = getPathSelectionRules(kit.bodyType.trait, rawTier)
    const ruleError = validateChosenPaths(kit.bodyType, rawTier, chosen)
    if (ruleError) {
      // Without a Type trait the tier was guessed - can't call it an error.
      check("paths.count", rawTier ? "error" : "warn", ruleError)
    } else if (chosen.length < rules.count) {
      check("paths.count", "warn", `${chosen.length}/${rules.count} development paths chosen (incomplete, not invalid)`)
    } else {
      check("paths.count", "pass", rules.rule)
    }
    if (rules.extrapolated) {
      check("tier.extrapolated", "warn", "This tier's exact allowance is extrapolated, not written canon")
    }
  } else {
    check("paths.count", "skip", hasBodyTrait ? "body type unknown to canon" : "no Body trait on soul")
  }

  // Powers-in-kit (warn only: legacy eras used different power names, and the
  // v1.1 app force-defaulted unknown bodies to a Citrine kit)
  const accepted = new Set<string>()
  if (kit.bodyType) {
    const core = getPowerByBodyType(kit.bodyType.trait)?.corePower.name
    if (core) accepted.add(norm(core))
    for (const p of kit.bodyType.developmentPaths ?? []) accepted.add(norm(p.name))
    for (const p of kit.bodyType.advancedPowers ?? []) accepted.add(norm(p.name))
  }
  for (const group of [kit.facePowers, kit.extraPowers, kit.eyePowers, kit.headPowers]) {
    for (const pw of group) {
      for (const p of pw.developmentPaths ?? []) accepted.add(norm(p.name))
      for (const p of pw.advancedPowers ?? []) accepted.add(norm(p.name))
    }
  }
  const strays = powers.filter((p) => !accepted.has(norm(p)))
  if (strays.length > 0) {
    check(
      "paths.in-kit",
      "warn",
      (kit.bodyType
        ? "not in this NFT's canon kit (likely names from an earlier app version): "
        : "powers recorded but body type grants no canon kit: ") + strays.join(", "),
    )
  } else {
    check("paths.in-kit", powers.length > 0 ? "pass" : "skip", powers.length > 0 ? undefined : "no powers recorded")
  }

  // Text heuristics (warn only - prose is creative writing, not schema)
  const prose = [str(soul?.background), str(soul?.powersAbilities?.description), str(soul?.personalityProfile?.description)].join("\n")
  if (bareFaced && /\bmask(s|ed)?\b/i.test(prose)) {
    check("text.mask-when-bare-faced", "warn", `character is bare-faced (Face: Void) but prose mentions a mask ${quoteAround(prose, /\bmask(s|ed)?\b/i)}`)
  }
  const ownBody = kit.bodyType ? norm(kit.bodyType.trait) : null
  // Gem-color parentheticals in the soul's OWN traits (e.g. "Fedora
  // (Obsidian)") are colors, not lineages - never flag those words.
  const ownTraitColors = new Set(
    traits.flatMap((t) => Array.from(String(t.value).matchAll(/\(([^)]+)\)/g)).map((m) => norm(m[1]))),
  )
  const lineageHits = bodyTypePowers
    .map((b) => b.trait)
    .filter((n) => !["water", "ash"].includes(norm(n))) // common nouns: guaranteed false positives
    .filter((n) => norm(n) !== ownBody)
    .filter((n) => !ownTraitColors.has(norm(n)))
    .filter((n) => new RegExp(`\\b${escapeRe(n)}\\b`, "i").test(prose))
  if (lineageHits.length > 0) {
    check("text.foreign-lineage", "warn", `prose mentions other lineage name(s): ${lineageHits.join(", ")} - fine if referring to other characters or places`)
  }

  // Live on-chain trait comparison (best effort; never blocks)
  const tokenId = str(soul?.pfpId).replace(/^0+/, "")
  if (isSampleToken(tokenId)) {
    check("traits.match-chain", "skip", "sample token: traits pinned in-app")
  } else if (!tokenId) {
    check("traits.match-chain", "skip", "no token id on soul")
  } else {
    try {
      const res = await fetch(`/api/opensea?tokenId=${encodeURIComponent(tokenId)}`)
      if (!res.ok) {
        check("traits.match-chain", "skip", `live lookup unavailable (HTTP ${res.status})`)
      } else {
        const live: Trait[] = (((await res.json())?.nft?.traits ?? []) as any[])
          .filter((t) => t && t.trait_type != null && t.value != null)
          .map((t) => ({ trait_type: String(t.trait_type), value: String(t.value) }))
        check(
          "traits.match-chain",
          live.length > 0 && sameTraitSet(traits, live) ? "pass" : "warn",
          live.length > 0 ? "stored traits compared against live OpenSea metadata" : "OpenSea returned no traits",
        )
      }
    } catch {
      check("traits.match-chain", "skip", "network error during live lookup")
    }
  }

  const errors = checks.filter((c) => c.level === "error").length
  const warnings = checks.filter((c) => c.level === "warn").length
  return {
    reportVersion: "1.0.0",
    canonDataVersion: CANON_DATA_VERSION,
    validatedAt: new Date().toISOString(),
    status: errors > 0 ? "errors" : warnings > 0 ? "warnings" : "pass",
    errors,
    warnings,
    checks,
  }
}

// ---------------------------------------------------------------------------
// Envelope build / sign / verify
// ---------------------------------------------------------------------------

/**
 * The exact text the wallet signs. Reconstructed field-by-field during
 * verification and compared for EXACT equality - never parsed with regexes,
 * and deliberately free of user-controlled text (a soulName containing a
 * newline could otherwise forge extra message lines).
 */
export function buildSignedMessage(args: {
  subject: CanonSubmission["subject"]
  contentHash: string
  wallet: string
  signedAt: string
  supersedes: string | null
  validationStatus: CanonValidationReport["status"]
}): string {
  return [
    `${SUBMISSION_SCHEMA} v${SUBMISSION_SCHEMA_VERSION}`,
    `Token: ${args.subject.chain}/${args.subject.contract}/${args.subject.tokenId}`,
    `Content-Hash: ${args.contentHash}`,
    `Wallet: ${args.wallet}`,
    `Signed-At: ${args.signedAt}`,
    `Supersedes: ${args.supersedes ?? "none"}`,
    `Validation: ${args.validationStatus}`,
  ].join("\n")
}

function readExportLog(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(window.localStorage.getItem(EXPORTS_KEY) || "{}")
  } catch {
    return {}
  }
}

export function recordExport(tokenId: string, submissionId: string): void {
  if (typeof window === "undefined") return
  const log = readExportLog()
  log[tokenId] = submissionId
  window.localStorage.setItem(EXPORTS_KEY, JSON.stringify(log))
}

/** Builds the unsigned envelope. Sign afterwards with signSubmission. */
export async function buildSubmission(
  soul: CharacterData,
  report: CanonValidationReport,
): Promise<CanonSubmission> {
  const tokenId = str(soul?.pfpId).replace(/^0+/, "")
  const subjectBase = {
    chain: "ethereum" as const,
    collection: "force" as const,
    contract: FORCE_CONTRACT,
    tokenId,
  }
  const traitsHash = hashTag(await sha256Hex(stableStringify(sanitizeTraits(soul))))
  const subject = { ...subjectBase, traitsHash }
  const contentHash = hashTag(await sha256Hex(stableStringify({ subject, soul })))
  const supersedes = readExportLog()[tokenId] ?? null

  return {
    schema: SUBMISSION_SCHEMA,
    schemaVersion: SUBMISSION_SCHEMA_VERSION,
    submissionId: contentHash,
    createdAt: new Date().toISOString(),
    app: { name: APP_NAME, version: APP_VERSION },
    subject,
    soul,
    canonValidation: report,
    provenance: { level: "unsigned", wallet: null, signature: null },
    supersedes: supersedes === contentHash ? null : supersedes,
  }
}

/**
 * Signs the envelope with the connected browser wallet (EIP-191
 * personal_sign). Throws descriptive errors; the caller maps user-rejection
 * (code 4001 / ACTION_REJECTED) to a gentle toast.
 */
export async function signSubmission(
  submission: CanonSubmission,
  expectedAddress: string,
): Promise<CanonSubmission> {
  const eth = (window as any).ethereum
  if (!eth) throw new Error("No wallet available in this browser")

  const { BrowserProvider, getAddress } = await import("ethers")
  const provider = new BrowserProvider(eth)
  const signer = await provider.getSigner()
  const signerAddress = getAddress(await signer.getAddress())
  if (signerAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error(`Wallet is on a different account (${signerAddress.slice(0, 8)}...) - switch to your connected account and retry`)
  }

  // Smart-contract wallets (Safe etc.) sign via EIP-1271, which cannot be
  // verified offline by ecrecover - refuse rather than emit a file that
  // falsely claims to be self-verifiable. EIP-7702 delegated EOAs (code
  // prefix 0xef0100) still sign normally and are allowed.
  const code = await provider.getCode(signerAddress)
  if (code !== "0x" && !code.toLowerCase().startsWith("0xef0100")) {
    throw new Error("Smart-contract wallets can't produce an offline-verifiable signature - please use a regular (EOA) wallet")
  }

  const signedAt = new Date().toISOString()
  const message = buildSignedMessage({
    subject: submission.subject,
    contentHash: submission.submissionId,
    wallet: signerAddress,
    signedAt,
    supersedes: submission.supersedes,
    validationStatus: submission.canonValidation.status,
  })
  const signature = await signer.signMessage(message)

  return {
    ...submission,
    provenance: {
      level: "signed",
      wallet: signerAddress,
      signature: {
        type: "eip191-personal-sign",
        contentHash: submission.submissionId,
        message,
        signature,
        signedAt,
      },
    },
  }
}

export interface VerifyResult {
  hashValid: boolean
  signatureValid: boolean | null // null = unsigned file
  signer: string | null
  errors: string[]
}

/**
 * Full verification a canon engine can trust. Recomputes everything from the
 * parsed envelope; never parses fields out of the signed message text.
 * Deliberately does NOT establish token ownership or re-run canon validation
 * - ingesting engines must do both themselves.
 */
export async function verifySubmission(input: unknown): Promise<VerifyResult> {
  const errors: string[] = []
  const sub = input as CanonSubmission
  if (!sub || sub.schema !== SUBMISSION_SCHEMA || typeof sub.schemaVersion !== "string") {
    return { hashValid: false, signatureValid: null, signer: null, errors: ["unrecognized schema"] }
  }

  const contentHash = hashTag(await sha256Hex(stableStringify({ subject: sub.subject, soul: sub.soul })))
  if (!sameHash(sub.submissionId, contentHash)) errors.push("submissionId does not match recomputed content hash")

  const traitsHash = hashTag(await sha256Hex(stableStringify(sanitizeTraits(sub.soul))))
  if (!sameHash(sub.subject?.traitsHash ?? "", traitsHash)) errors.push("traitsHash does not match soul.traits")

  const hashValid = errors.length === 0

  if (sub.provenance?.level !== "signed") {
    return { hashValid, signatureValid: null, signer: null, errors }
  }

  const sig = sub.provenance.signature
  const wallet = sub.provenance.wallet
  if (!sig || !wallet) {
    errors.push("provenance.level is signed but signature/wallet missing")
    return { hashValid, signatureValid: false, signer: null, errors }
  }

  let signer: string | null = null
  try {
    const { verifyMessage, getAddress } = await import("ethers")
    const normalizedWallet = getAddress(wallet)
    if (!sameHash(sig.contentHash, contentHash)) errors.push("signature.contentHash does not match content")
    const expectedMessage = buildSignedMessage({
      subject: sub.subject,
      contentHash,
      wallet: normalizedWallet,
      signedAt: sig.signedAt,
      supersedes: sub.supersedes ?? null,
      validationStatus: sub.canonValidation?.status,
    })
    if (sig.message !== expectedMessage) errors.push("signature.message does not match envelope fields")
    if (Number.isNaN(Date.parse(sig.signedAt))) errors.push("signedAt is not a valid timestamp")
    signer = getAddress(verifyMessage(expectedMessage, sig.signature))
    if (signer.toLowerCase() !== normalizedWallet.toLowerCase()) {
      errors.push(`signature recovered ${signer}, not the declared wallet`)
    }
  } catch (e) {
    errors.push(`signature verification failed: ${e instanceof Error ? e.message : "unknown error"}`)
  }

  return { hashValid, signatureValid: errors.length === 0 && hashValid, signer, errors }
}

// ---------------------------------------------------------------------------
// Markdown character sheet
// ---------------------------------------------------------------------------

const mdEscape = (s: string) => s.replace(/\|/g, "\\|")

function section(title: string, body: string | undefined | null): string {
  const text = str(body).trim()
  return text ? `## ${title}\n\n${text}\n` : ""
}

export function renderSubmissionMarkdown(sub: CanonSubmission): string {
  const soul = sub.soul
  const name = str(soul?.soulName).trim() || `0N1 #${sub.subject.tokenId}`
  const traits = sanitizeTraits(soul)
  const powers = (Array.isArray(soul?.powersAbilities?.powers) ? soul.powersAbilities!.powers : []).filter(
    (p): p is string => typeof p === "string",
  )

  const lines: string[] = []
  lines.push(`# ${name}`)
  lines.push("")
  lines.push(`**0N1 Force #${sub.subject.tokenId}**${str(soul?.archetype).trim() ? ` · ${soul.archetype}` : ""}`)
  lines.push("")
  lines.push(`[View on OpenSea](https://opensea.io/assets/ethereum/${sub.subject.contract}/${sub.subject.tokenId})`)
  lines.push("")
  lines.push(section("Background", soul?.background))
  lines.push(section("Personality", soul?.personalityProfile?.description))
  if (str(soul?.hopesFears?.hopes).trim() || str(soul?.hopesFears?.fears).trim()) {
    lines.push(`## Hopes & Fears\n`)
    if (str(soul?.hopesFears?.hopes).trim()) lines.push(`**Hopes:** ${soul.hopesFears!.hopes}\n`)
    if (str(soul?.hopesFears?.fears).trim()) lines.push(`**Fears:** ${soul.hopesFears!.fears}\n`)
  }
  if (soul?.motivations && (str(soul.motivations.drives).trim() || str(soul.motivations.goals).trim() || str(soul.motivations.values).trim())) {
    lines.push(`## Motivations\n`)
    if (str(soul.motivations.drives).trim()) lines.push(`**Drives:** ${soul.motivations.drives}\n`)
    if (str(soul.motivations.goals).trim()) lines.push(`**Goals:** ${soul.motivations.goals}\n`)
    if (str(soul.motivations.values).trim()) lines.push(`**Values:** ${soul.motivations.values}\n`)
  }
  if (soul?.relationships && (str(soul.relationships.friends).trim() || str(soul.relationships.rivals).trim() || str(soul.relationships.family).trim())) {
    lines.push(`## Relationships\n`)
    if (str(soul.relationships.friends).trim()) lines.push(`**Allies:** ${soul.relationships.friends}\n`)
    if (str(soul.relationships.rivals).trim()) lines.push(`**Rivals:** ${soul.relationships.rivals}\n`)
    if (str(soul.relationships.family).trim()) lines.push(`**Family & Mentors:** ${soul.relationships.family}\n`)
  }
  if (soul?.worldPosition && (str(soul.worldPosition.societalRole).trim() || str(soul.worldPosition.classStatus).trim() || str(soul.worldPosition.perception).trim())) {
    lines.push(`## Place in the World\n`)
    if (str(soul.worldPosition.societalRole).trim()) lines.push(`**Role:** ${soul.worldPosition.societalRole}\n`)
    if (str(soul.worldPosition.classStatus).trim()) lines.push(`**Standing:** ${soul.worldPosition.classStatus}\n`)
    if (str(soul.worldPosition.perception).trim()) lines.push(`**As others see them:** ${soul.worldPosition.perception}\n`)
  }
  if (soul?.voice && (str(soul.voice.speechStyle).trim() || str(soul.voice.uniquePhrases).trim())) {
    lines.push(`## Voice\n`)
    if (str(soul.voice.speechStyle).trim()) lines.push(`**Speech:** ${soul.voice.speechStyle}\n`)
    if (str(soul.voice.uniquePhrases).trim()) lines.push(`**Phrases:** ${soul.voice.uniquePhrases}\n`)
  }
  if (powers.length > 0 || str(soul?.powersAbilities?.description).trim()) {
    lines.push(`## Powers\n`)
    if (powers.length > 0) lines.push(powers.map((p) => `- ${p}`).join("\n") + "\n")
    if (str(soul?.powersAbilities?.description).trim()) lines.push(`${soul.powersAbilities!.description}\n`)
  }
  if (traits.length > 0) {
    lines.push(`## On-Chain Traits\n`)
    lines.push(`| Trait | Value |`)
    lines.push(`|---|---|`)
    for (const t of traits) lines.push(`| ${mdEscape(t.trait_type)} | ${mdEscape(String(t.value))} |`)
    lines.push("")
  }

  const v = sub.canonValidation
  lines.push(`## Canon Validation\n`)
  lines.push(`Status: **${v.status}** (${v.errors} errors, ${v.warnings} warnings) · checked against ${v.canonDataVersion}\n`)

  lines.push(`---\n`)
  lines.push(`*Submission ID: \`${sub.submissionId}\`*  `)
  lines.push(
    sub.provenance.level === "signed"
      ? `*Signed by \`${sub.provenance.wallet}\` at ${sub.provenance.signature?.signedAt}. Verify against the companion JSON file - this Markdown is presentation only.*`
      : `*Provenance: unsigned. The companion JSON file is the official record.*`,
  )
  lines.push("")
  return lines.filter((l) => l !== null).join("\n").replace(/\n{3,}/g, "\n\n")
}

// ---------------------------------------------------------------------------
// Download helpers
// ---------------------------------------------------------------------------

export function slugify(name: string): string {
  return (
    str(name)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .toLowerCase() || "soul"
  )
}

export function downloadFile(text: string, filename: string, mime: string): void {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
