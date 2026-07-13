/**
 * Shared verification helpers for soul-canon-submission envelopes.
 * Ported from lore-crafter lib/canon-submission.ts (stableStringify contract).
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
  if (!subtle) throw new Error("SHA-256 unavailable")
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export const SUBMISSION_SCHEMA = "0n1.soul-canon-submission"
