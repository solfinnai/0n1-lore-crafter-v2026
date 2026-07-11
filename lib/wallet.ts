import { ON1_CONTRACT_ADDRESS } from "./api"
import type { OwnedNft } from "./types"

/**
 * Fetches 0N1 Force NFTs owned by the given address
 */
export async function fetchOwnedNfts(address: string): Promise<OwnedNft[]> {
  try {
    // Call our API route to fetch owned NFTs
    const response = await fetch(`/api/opensea/owned?address=${address}&contract=${ON1_CONTRACT_ADDRESS}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch owned NFTs")
    }

    const data = await response.json()

    // Map the API response to our OwnedNft type
    return (data.nfts || []).map((nft: any) => ({
      tokenId: nft.identifier,
      name: nft.name || `0N1 Force #${nft.identifier}`,
      imageUrl: nft.image_url || null,
    }))
  } catch (error) {
    console.error("Error in fetchOwnedNfts:", error)
    throw error
  }
}

/**
 * Shortens an Ethereum address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ""
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`
}
