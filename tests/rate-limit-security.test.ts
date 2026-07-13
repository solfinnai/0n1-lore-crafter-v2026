/**
 * Security regression tests for lib/rate-limit.ts, locking in the audit fixes:
 * - getClientIP must NOT trust the client-controlled leftmost X-Forwarded-For
 *   (was: rotating XFF minted a fresh bucket per request, defeating every limit)
 * - resolveUsageKey must always return a bucket (anonymous callers stay metered)
 *   and must prefer the authenticated user id over a client-asserted wallet
 * - estimateTokensFromText must charge from real assembled text length
 */
import { describe, it, expect } from "vitest"
import {
  getClientIP,
  resolveUsageKey,
  estimateTokensFromText,
} from "@/lib/rate-limit"

// Minimal NextRequest stand-in: getClientIP/resolveUsageKey only read headers.
function req(headers: Record<string, string>) {
  const h = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return { headers: { get: (k: string) => h.get(k.toLowerCase()) ?? null } } as any
}

describe("getClientIP — X-Forwarded-For spoof resistance (audit finding)", () => {
  it("ignores a client-rotated leftmost X-Forwarded-For when a trusted Vercel header is present", () => {
    // Simulated Vercel: the edge sets x-vercel-forwarded-for to the true IP and
    // the attacker can only prepend to x-forwarded-for. The bucket must be stable.
    const a = getClientIP(req({
      "x-vercel-forwarded-for": "203.0.113.7",
      "x-forwarded-for": "1.1.1.1, 203.0.113.7",
    }))
    const b = getClientIP(req({
      "x-vercel-forwarded-for": "203.0.113.7",
      "x-forwarded-for": "2.2.2.2, 203.0.113.7", // attacker rotated the leftmost
    }))
    expect(a).toBe("203.0.113.7")
    expect(b).toBe("203.0.113.7")
    expect(a).toBe(b) // same real client -> same bucket, spoof ignored
  })

  it("prefers x-real-ip over x-forwarded-for", () => {
    expect(getClientIP(req({
      "x-real-ip": "198.51.100.9",
      "x-forwarded-for": "6.6.6.6",
    }))).toBe("198.51.100.9")
  })

  it("falls back to the RIGHTMOST (nearest-trusted-hop) XFF entry, never the leftmost", () => {
    // No Vercel/real-ip header (e.g. a self-hosted proxy appends the real IP last).
    expect(getClientIP(req({
      "x-forwarded-for": "9.9.9.9, 10.0.0.5", // 9.9.9.9 is attacker-supplied
    }))).toBe("10.0.0.5")
  })

  it("returns 'unknown' when no IP header is present (no crash)", () => {
    expect(getClientIP(req({}))).toBe("unknown")
  })
})

describe("resolveUsageKey — anonymous callers stay metered (audit finding)", () => {
  it("never returns null: an anonymous caller (no user, no wallet) gets an IP bucket", () => {
    const key = resolveUsageKey(req({ "x-real-ip": "203.0.113.7" }), null, null)
    expect(key).toBe("ip:203.0.113.7")
  })

  it("prefers the authenticated user id over a client-asserted wallet (anti-spoof)", () => {
    const key = resolveUsageKey(
      req({ "x-real-ip": "203.0.113.7" }),
      "auth-user-123",
      "0xVICTIMwallet0000000000000000000000000001",
    )
    expect(key).toBe("auth-user-123")
  })

  it("uses the wallet bucket (lowercased) for a logged-out NFT owner", () => {
    const key = resolveUsageKey(req({}), null, "0xAbCdEf0000000000000000000000000000000001")
    expect(key).toBe("0xabcdef0000000000000000000000000000000001")
  })

  it("an anonymous caller cannot mint a fresh bucket by rotating leftmost XFF", () => {
    const k1 = resolveUsageKey(req({ "x-vercel-forwarded-for": "203.0.113.7", "x-forwarded-for": "1.1.1.1, 203.0.113.7" }), null, null)
    const k2 = resolveUsageKey(req({ "x-vercel-forwarded-for": "203.0.113.7", "x-forwarded-for": "2.2.2.2, 203.0.113.7" }), null, null)
    expect(k1).toBe(k2) // same daily bucket -> the cap actually applies
  })
})

describe("estimateTokensFromText — real input accounting (audit finding)", () => {
  it("charges from actual assembled text length (~4 chars/token), not a fixed constant", () => {
    expect(estimateTokensFromText("a".repeat(400))).toBe(100)
    expect(estimateTokensFromText("a".repeat(4000), "b".repeat(4000))).toBe(2000)
  })

  it("ignores null/undefined parts without crashing", () => {
    expect(estimateTokensFromText(null, undefined, "abcd")).toBe(1)
  })
})
