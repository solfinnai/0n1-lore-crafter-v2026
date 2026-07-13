import { describe, it, expect } from "vitest"
import { stableStringify, validateForCanon, CANON_DATA_VERSION } from "@/lib/canon-submission"
import { SAMPLE_TOKEN_TRAITS } from "@/lib/sample-token"
import { classifyTraits, getCharacterPowerKit } from "@/lib/lore/canon/match"
import { getPathSelectionRules } from "@/lib/lore/canon/selection-rules"
import { parseBackup, BACKUP_SCHEMA } from "@/lib/backup"
import { checkAndRecordDailyUsage, getDailyUsage } from "@/lib/rate-limit"
import type { CharacterData } from "@/lib/types"

describe("stableStringify", () => {
  it("sorts object keys deterministically", () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}')
  })

  it("drops undefined object values and nulls array holes", () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}')
    expect(stableStringify([1, undefined, 3])).toBe("[1,null,3]")
  })

  it("resists __proto__ forge via string concat (not Object.assign)", () => {
    const forged = JSON.parse('{"__proto__":{"polluted":true},"a":1}')
    const s = stableStringify(forged)
    expect(s).toContain('"__proto__"')
    expect(s).toContain('"a":1')
  })

  it("throws on non-finite numbers", () => {
    expect(() => stableStringify(Number.NaN)).toThrow()
    expect(() => stableStringify(Number.POSITIVE_INFINITY)).toThrow()
  })
})

describe("classifyTraits #922 golden", () => {
  it("classifies sample #922 without inventing a Void mask", () => {
    const classified = classifyTraits(SAMPLE_TOKEN_TRAITS)
    const face = classified.find((c) => c.trait.trait_type === "Face")
    expect(face).toBeDefined()
    // PR Mask is a power, not bare-faced
    expect(face?.category).toBe("power")

    const voidExtra = classified.find((c) => c.trait.trait_type === "Extra" && String(c.trait.value).toLowerCase() === "void")
    // Extra Void is cosmetic / appearance — not a face mask
    expect(voidExtra?.category).toBe("cosmetic")

    const kit = getCharacterPowerKit(SAMPLE_TOKEN_TRAITS)
    expect(kit.bodyType?.trait).toBe("Citrine")
    expect(kit.typeTier?.trait).toMatch(/Y0K-A1/i)
  })

  it("marks Face: Void as bare-faced", () => {
    const classified = classifyTraits([
      { trait_type: "Body", value: "Citrine" },
      { trait_type: "Face", value: "Void" },
      { trait_type: "Type", value: "Y0K-A1" },
    ])
    const face = classified.find((c) => c.trait.trait_type === "Face")
    expect(face).toEqual(expect.objectContaining({ category: "cosmetic", kind: "bare-faced" }))
  })
})

describe("tierKey / path rules", () => {
  it("trims trailing whitespace on Type and still matches Y0K-A1", () => {
    const rules = getPathSelectionRules("Citrine", "Y0K-A1 ")
    expect(rules.count).toBe(1)
    expect(rules.extrapolated).toBe(false)
  })

  it("marks garbage tier as extrapolated unknown", () => {
    const rules = getPathSelectionRules("Citrine", "???")
    expect(rules.extrapolated).toBe(true)
  })
})

describe("validateForCanon", () => {
  it("hard-blocks unverified traits", async () => {
    const soul = {
      pfpId: "1",
      traits: SAMPLE_TOKEN_TRAITS,
      traitsVerified: false,
      traitsSource: "unverified",
      soulName: "Test",
      archetype: "Ronin",
      background: "Raised in The Vents",
      hopesFears: { hopes: "x", fears: "y" },
      personalityProfile: { description: "z" },
      motivations: { drives: "", goals: "", values: "" },
      relationships: { friends: "", rivals: "", family: "" },
      worldPosition: { societalRole: "", classStatus: "", perception: "" },
      voice: { speechStyle: "", innerDialogue: "", uniquePhrases: "" },
      symbolism: { colors: "", items: "", motifs: "" },
      powersAbilities: { powers: [], description: "" },
    } as unknown as CharacterData

    const report = await validateForCanon(soul)
    expect(report.canonDataVersion).toBe(CANON_DATA_VERSION)
    expect(report.checks.some((c) => c.id === "traits.verified" && c.level === "error")).toBe(true)
  })
})

describe("backup parse", () => {
  it("rejects unknown schemas and strips unknown keys", () => {
    expect(() => parseBackup("{}")).toThrow()
    const { backup } = parseBackup(
      JSON.stringify({
        schema: BACKUP_SCHEMA,
        schemaVersion: "1.0.0",
        exportedAt: new Date().toISOString(),
        app: { name: "x", version: "1" },
        entries: {
          "oni-souls": "[]",
          "evil-key": "nope",
        },
      }),
    )
    expect(backup.entries["oni-souls"]).toBe("[]")
    expect(backup.entries["evil-key"]).toBeUndefined()
  })
})

describe("daily usage metering", () => {
  it("getDailyUsage does not increment; checkAndRecord does once", () => {
    const wallet = `test-wallet-${Date.now()}`
    const before = getDailyUsage(wallet)
    const mid = getDailyUsage(wallet)
    expect(mid.remaining.aiMessages).toBe(before.remaining.aiMessages)

    const charged = checkAndRecordDailyUsage(wallet, "ai_messages", 10)
    expect(charged.allowed).toBe(true)
    const after = getDailyUsage(wallet)
    expect(after.remaining.aiMessages).toBe(before.remaining.aiMessages - 1)

    // Second pure read must not burn another message
    const after2 = getDailyUsage(wallet)
    expect(after2.remaining.aiMessages).toBe(after.remaining.aiMessages)
  })
})
