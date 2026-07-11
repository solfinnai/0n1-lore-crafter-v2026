import type { Trait, OpenSeaTrait } from "@/lib/types"

export const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY
export const CONTRACT_ADDRESS = "0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d" // 0N1 Force contract address
export const ON1_CONTRACT_ADDRESS = "0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d" // Adding the missing export

// Simple in-memory cache to prevent duplicate requests
const requestCache = new Map<string, Promise<{ traits: Trait[]; imageUrl: string | null }>>()

export async function fetchNftData(tokenId: string): Promise<{ traits: Trait[]; imageUrl: string | null }> {
  try {
    // Normalize token ID by removing leading zeros
    const normalizedTokenId = tokenId.replace(/^0+/, "")

    // Check if we already have a pending request for this token
    if (requestCache.has(normalizedTokenId)) {
      console.log(`Using cached request for token ${normalizedTokenId}...`)
      return await requestCache.get(normalizedTokenId)!
    }

    console.log(`Fetching NFT data for token ${normalizedTokenId}...`)

    // Create the request promise
    const requestPromise = (async () => {
      try {
        // Use our own API route to avoid exposing the API key in client-side code
        const response = await fetch(`/api/opensea?tokenId=${normalizedTokenId}`, {
          next: { revalidate: 86400 }, // Cache for 24 hours - NFT metadata rarely changes
        })

        if (!response.ok) {
          console.error(`API error: ${response.status} for token ${normalizedTokenId}`)

          // Try to get more error details
          try {
            const errorData = await response.json()
            console.error("Error details:", errorData)
          } catch (e) {
            console.error("Could not parse error response:", e)
          }

          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log(`Received data for token ${normalizedTokenId}:`, data)

        // Extract traits and image URL from the response
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
        } else {
          console.error("No NFT data in response:", data)
          throw new Error("Invalid response format from OpenSea API")
        }
      } finally {
        // Remove from cache when request completes
        requestCache.delete(normalizedTokenId)
      }
    })()

    // Store the promise in cache
    requestCache.set(normalizedTokenId, requestPromise)
    
    return await requestPromise
  } catch (error) {
    console.error("Error fetching NFT data:", error)
    throw error
  }
}

// Update the fetchNftDataWithFallback function to validate the token ID range
export async function fetchNftDataWithFallback(tokenId: string): Promise<{
  traits: Trait[]
  imageUrl: string | null
  isApiData: boolean
}> {
  // Normalize token ID by removing leading zeros
  const normalizedTokenId = tokenId.replace(/^0+/, "")

  // Check if the token ID is within the valid range (1-7777)
  const tokenIdNumber = Number.parseInt(normalizedTokenId, 10)
  if (isNaN(tokenIdNumber) || tokenIdNumber < 1 || tokenIdNumber > 7777) {
    throw new Error("Please try again and enter a correct 0N1 Force Token ID (1-7777)")
  }

  try {
    const { traits, imageUrl } = await fetchNftData(tokenId)
    if (traits.length > 0) {
      console.log(`Successfully fetched ${traits.length} traits for token ${tokenId}`)
      return { traits, imageUrl, isApiData: true }
    }

    // If no traits found, try mock data
    console.log(`No traits found for token ${tokenId}, using mock data`)
    const mockData = getMockData(tokenId)
    return {
      traits: mockData.traits,
      imageUrl: mockData.imageUrl,
      isApiData: false,
    }
  } catch (error) {
    console.error(`Falling back to mock data for token ${tokenId}:`, error)
    const mockData = getMockData(tokenId)
    return {
      traits: mockData.traits,
      imageUrl: mockData.imageUrl,
      isApiData: false,
    }
  }
}

// Update the getMockData function to include image URLs
function getMockData(tokenId: string): { traits: Trait[]; imageUrl: string | null } {
  // Normalize token ID by removing leading zeros for mock data lookup
  const normalizedTokenId = tokenId.replace(/^0+/, "")

  // Check if we have predefined mock data for this token ID
  if (mockData[normalizedTokenId]) {
    return mockData[normalizedTokenId]
  }

  // If no predefined mock data, generate generic mock data based on the token ID
  // This ensures any token ID will work even if the API fails
  return {
    traits: [
      {
        trait_type: "Background",
        value: ["Blazing Temple", "Neon City", "Digital Void", "Cyber District", "Ancient Shrine"][
          Number.parseInt(normalizedTokenId) % 5
        ],
      },
      {
        trait_type: "Body",
        value: [
          "Citrine",
          "Jasper",
          "Azurite",
          "Type-01",
          "Obsidian",
          "Ash",
          "Water",
          "Pearlescent",
          "Kabuki",
          "Tiger Skin",
        ][Number.parseInt(normalizedTokenId) % 10],
      },
      {
        trait_type: "Headphones",
        value: ["Black", "White", "Blue", "Red", "Purple"][Number.parseInt(normalizedTokenId) % 5],
      },
      {
        trait_type: "Clothing",
        value: ["Battle Armor", "Cyber Jacket", "Neon Suit", "Tech Robes", "Street Gear"][
          Number.parseInt(normalizedTokenId) % 5
        ],
      },
      {
        trait_type: "Accessory",
        value: ["Digital Amulet", "Tech Visor", "Energy Blade", "Spirit Charm", "None"][
          Number.parseInt(normalizedTokenId) % 5
        ],
      },
    ],
    // Use a placeholder image for generated data
    imageUrl: `https://placehold.co/300x300/3a1c71/ffffff?text=0N1+%23${normalizedTokenId}`,
  }
}

// Keep the existing mockData object for specific token IDs, now with image URLs
const mockData: Record<string, { traits: Trait[]; imageUrl: string | null }> = {
  "1631": {
    traits: [
      { trait_type: "Background", value: "Teal" },
      { trait_type: "Body", value: "Citrine" },
      { trait_type: "Headphones", value: "Blue" },
      { trait_type: "Clothing", value: "Yellow Jacket" },
      { trait_type: "Hair", value: "Pink Ponytail" },
    ],
    imageUrl:
      "https://i.seadn.io/gae/Nnp8Pdo6EidK7eBduGnAn_JBvFsYGhNGMJ_fHJ_mzGMN_2Khu5snL5zmiUMcSsIqtANh68xJuXaQnELzTTT-JvXWdMq-yRH8aFEwYxc?w=500&auto=format",
  },
  "6603": {
    traits: [
      { trait_type: "Background", value: "Red" },
      { trait_type: "Body", value: "Dark" },
      { trait_type: "Headphones", value: "Black" },
      { trait_type: "Clothing", value: "Dark Outfit" },
      { trait_type: "Accessory", value: "Bubble Gum" },
    ],
    imageUrl:
      "https://i.seadn.io/gae/5jf4BoVq9eCJQQQzJbKUhc-ppRLYA8X8wt7GBnH4rBdGHl1L9eBuqd8BZWwKILg0XvYZmEQQqBjD9zQlnPwTBQF2yEMBGcpH-KLV?w=500&auto=format",
  },
  "7627": {
    traits: [
      { trait_type: "Background", value: "Red" },
      { trait_type: "Body", value: "Pale" },
      { trait_type: "Headphones", value: "White" },
      { trait_type: "Clothing", value: "Work Jacket" },
      { trait_type: "Headwear", value: "Hard Hat" },
    ],
    imageUrl:
      "https://i.seadn.io/gae/Ju9s13UUL-BjnWdqALbtk8UOqJQGt8RPKfc0X0Vr32bQRnAQzCrFoUAWzwpq-WvGTuYL5eUv_XJzQyWmqnV9nBVqbPLHQy_BYTc-?w=500&auto=format",
  },
  "922": {
    traits: [
      { trait_type: "Background", value: "Blazing Temple" },
      { trait_type: "Body", value: "Tiger Skin" },
      { trait_type: "Eyes", value: "Ethereal Blue" },
      { trait_type: "Weapon", value: "Spirit Katana" },
      { trait_type: "Clothing", value: "Battle Armor" },
    ],
    imageUrl:
      "https://i.seadn.io/gae/lW22aEwUE0IqGaYm6BN7KX1bTWaGmOBKqmwiiL9g7-SbLdxTjvQgTT4C4Vl1CKqhPfwrNzEJQgjJXXcml5Bx4S_nwSR6Q8O-TIH9?w=500&auto=format",
  },
}

// Get OpenSea link for a specific NFT
export function getOpenSeaNftLink(tokenId: string): string {
  // Normalize token ID by removing leading zeros
  const normalizedTokenId = tokenId.replace(/^0+/, "")
  return `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/${normalizedTokenId}`
}
