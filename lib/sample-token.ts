import type { Trait } from "@/lib/types"

// The permanent sample NFT: 0N1 Force #922. Traits are pinned verbatim from
// OpenSea (fetched 2026-07-11) and the image is committed to /public, so the
// sample experience never depends on the OpenSea API being up or the key
// being valid - and can never degrade to the fake mock traits in lib/api.ts.
export const SAMPLE_TOKEN_ID = "922"

export const SAMPLE_TOKEN_NAME = "0N1 #0922"

// Served from /public - always available, same origin.
export const SAMPLE_TOKEN_IMAGE = "/sample/0n1-922.png"

export const SAMPLE_TOKEN_TRAITS: Trait[] = [
  { trait_type: "Body", value: "Citrine" },
  { trait_type: "Eyes", value: "Angry (Jasper)" },
  { trait_type: "Face", value: "PR Mask (Citrine)" },
  { trait_type: "Hair", value: "Dreads (Obsidian)" },
  { trait_type: "Head", value: "Fedora (Obsidian)" },
  { trait_type: "Type", value: "Y0K-A1" },
  { trait_type: "Wear", value: "Track Jacket (Citrine)" },
  { trait_type: "Extra", value: "Void" },
  { trait_type: "Mouth", value: "Frown" },
  { trait_type: "Style", value: "3" },
  { trait_type: "Spirit", value: "1" },
  { trait_type: "Strength", value: "2" },
  { trait_type: "Background", value: "Citrine" },
]

export function isSampleToken(tokenId: string | null | undefined): boolean {
  return !!tokenId && tokenId.replace(/^0+/, "") === SAMPLE_TOKEN_ID
}
