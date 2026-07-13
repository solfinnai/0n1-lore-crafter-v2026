import type { Trait, OpenSeaTrait } from "@/lib/types"
import { SAMPLE_TOKEN_ID, SAMPLE_TOKEN_TRAITS, SAMPLE_TOKEN_IMAGE, isSampleToken } from "@/lib/sample-token"

export const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY
export const CONTRACT_ADDRESS = "0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d"
export const ON1_CONTRACT_ADDRESS = "0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d"

const requestCache = new Map<string, Promise<{ traits: Trait[]; imageUrl: string | null }>>()

export async function fetchNftData(tokenId: string): Promise<{ traits: Trait[]; imageUrl: string | null }> {
  try {
    const normalizedTokenId = tokenId.replace(/^0+/, "")

    // Pinned sample — real OpenSea traits, never mock.
    if (normalizedTokenId === SAMPLE_TOKEN_ID) {
      return { traits: SAMPLE_TOKEN_TRAITS, imageUrl: SAMPLE_TOKEN_IMAGE }
    }

    if (requestCache.has(normalizedTokenId)) {
      return await requestCache.get(normalizedTokenId)!
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(`/api/opensea?tokenId=${normalizedTokenId}`, {
          next: { revalidate: 86400 },
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.nft) {
          const traits = Array.isArray(data.nft.traits)
            ? data.nft.traits.map((trait: OpenSeaTrait) => ({
                trait_type: trait.trait_type,
                value: trait.value,
              }))
            : []

          return {
            traits,
            imageUrl: data.nft.image_url || null,
          }
        }
        throw new Error("Invalid response format from OpenSea API")
      } finally {
        requestCache.delete(normalizedTokenId)
      }
    })()

    requestCache.set(normalizedTokenId, requestPromise)
    return await requestPromise
  } catch (error) {
    console.error("Error fetching NFT data:", error)
    throw error
  }
}

/**
 * Fail-closed trait fetch. Never invents traits.
 * - Sample token: pinned real traits, isApiData=true (verified).
 * - OpenSea success with traits: isApiData=true.
 * - OpenSea failure / empty: empty traits, isApiData=false — caller must block wizard/export.
 */
export async function fetchNftDataWithFallback(tokenId: string): Promise<{
  traits: Trait[]
  imageUrl: string | null
  isApiData: boolean
}> {
  const normalizedTokenId = tokenId.replace(/^0+/, "")

  const tokenIdNumber = Number.parseInt(normalizedTokenId, 10)
  if (isNaN(tokenIdNumber) || tokenIdNumber < 1 || tokenIdNumber > 7777) {
    throw new Error("Please try again and enter a correct 0N1 Force Token ID (1-7777)")
  }

  // Sample is always verified (pinned in-repo).
  if (isSampleToken(normalizedTokenId)) {
    return {
      traits: SAMPLE_TOKEN_TRAITS,
      imageUrl: SAMPLE_TOKEN_IMAGE,
      isApiData: true,
    }
  }

  try {
    const { traits, imageUrl } = await fetchNftData(tokenId)
    if (traits.length > 0) {
      return { traits, imageUrl, isApiData: true }
    }
    return { traits: [], imageUrl: null, isApiData: false }
  } catch (error) {
    console.error(`OpenSea fetch failed for token ${tokenId} (fail closed, no mock traits):`, error)
    return { traits: [], imageUrl: null, isApiData: false }
  }
}

export function getOpenSeaNftLink(tokenId: string): string {
  const normalizedTokenId = tokenId.replace(/^0+/, "")
  return `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/${normalizedTokenId}`
}
