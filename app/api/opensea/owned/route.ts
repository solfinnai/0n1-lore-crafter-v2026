import { NextRequest, NextResponse } from "next/server"
import { checkOpenSeaRateLimitEnhanced, createRateLimitResponse } from '@/lib/rate-limit'
import { COLLECTIONS, CollectionKey, getAllCollectionKeys } from '@/lib/collection-config'
import { UnifiedCharacter, UnifiedCharacterResponse } from '@/lib/types'
import { withOptionalAuth, getRequestWalletAddress } from '@/lib/auth-middleware'
import { isDevMode } from '@/lib/auth'
import { isDemoWallet, DEMO_TOKEN_IDS } from '@/lib/dev-mode'

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY

// Demo mode: build a set of characters without requiring real ownership.
// Tries OpenSea for real images (works for any token ID) and falls back to placeholders.
async function buildDemoCharacters(): Promise<UnifiedCharacter[]> {
  const forceContract = COLLECTIONS['force' as CollectionKey].contractAddress

  const characters = await Promise.all(DEMO_TOKEN_IDS.map(async (tokenId): Promise<UnifiedCharacter> => {
    let imageUrl: string | null = null
    try {
      const response = await fetch(
        `https://api.opensea.io/api/v2/chain/ethereum/contract/${forceContract}/nfts/${tokenId}`,
        {
          headers: { 'X-API-KEY': OPENSEA_API_KEY || '', 'Accept': 'application/json' },
          next: { revalidate: 86400 },
        }
      )
      if (response.ok) {
        const data = await response.json()
        imageUrl = data.nft?.image_url || null
      }
    } catch {
      // Offline or API error - placeholder below covers it
    }

    return {
      tokenId,
      forceImageUrl: imageUrl || `https://placehold.co/300x300/3a1c71/ffffff?text=0N1+%23${tokenId}`,
      frameImageUrl: null,
      hasForce: true,
      hasFrame: false,
      displayName: `0N1 #${tokenId} (Demo)`,
    }
  }))

  return characters
}

async function fetchCollectionNfts(address: string, collection: CollectionKey): Promise<any[]> {
  const config = COLLECTIONS[collection]
  // Use contract address instead of collection slug for more reliable results
  const url = `https://api.opensea.io/v2/chain/ethereum/account/${address}/nfts?asset_contract_address=${config.contractAddress}&limit=50`
  
  console.log(`Fetching ${config.displayName} NFTs: ${url}`)
  
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': OPENSEA_API_KEY || '',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    console.log(`Failed to fetch ${config.displayName} NFTs: ${response.status}`)
    return []
  }

  const data = await response.json()
  const nfts = data.nfts || []
  
  console.log(`Found ${nfts.length} ${config.displayName} NFTs`)
  console.log(`${config.displayName} NFT IDs:`, nfts.map((nft: any) => nft.identifier))
  console.log(`${config.displayName} detailed data:`, nfts.map((nft: any) => ({
    identifier: nft.identifier,
    name: nft.name,
    image_url: nft.image_url,
    contract: nft.contract
  })))
  
  return nfts
}

// New function to fetch Frame NFT by specific token ID
async function fetchFrameNftByTokenId(tokenId: string): Promise<any | null> {
  const frameContract = COLLECTIONS['frame' as CollectionKey].contractAddress
  const url = `https://api.opensea.io/v2/chain/ethereum/contract/${frameContract}/nfts/${tokenId}`
  
  console.log(`🎯 Fetching Frame NFT #${tokenId} directly: ${url}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': OPENSEA_API_KEY || '',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`❌ Frame NFT #${tokenId} not found or not owned: ${response.status}`)
      return null
    }

    const data = await response.json()
    const nft = data.nft
    
    if (nft) {
      console.log(`✅ Found Frame NFT #${tokenId}:`, {
        identifier: nft.identifier,
        name: nft.name,
        image_url: nft.image_url,
        contract: nft.contract,
        owners: nft.owners?.map((o: any) => o.address)
      })
      return nft
    }
    
    return null
  } catch (error) {
    console.log(`❌ Error fetching Frame NFT #${tokenId}:`, error)
    return null
  }
}

// Helper function to validate NFT has required properties
function isValidNft(nft: any): boolean {
  return nft && 
         nft.identifier && 
         nft.contract && 
         nft.name && 
         nft.image_url &&
         nft.image_url.trim() !== ''
}

export const GET = withOptionalAuth(async (req: NextRequest, sessionInfo) => {
  console.log(`🚀 UNIFIED CHARACTERS API CALLED: ${new Date().toISOString()}`)

  // Get wallet address from authentication (secure) or legacy parameter (backward compatibility)
  const walletAddress = await getRequestWalletAddress(req, sessionInfo)

  if (!walletAddress) {
    return NextResponse.json({ 
      error: 'Authentication required',
      message: 'Please authenticate with your wallet or provide a valid address parameter',
      authenticationUrl: '/api/auth/challenge'
    }, { status: 401 })
  }

  console.log(`Fetching unified characters for address ${walletAddress}`)
  console.log(`🔐 Authentication status: ${sessionInfo.isAuthenticated ? 'AUTHENTICATED' : 'LEGACY_MODE'}`)

  // Demo wallet: return demo characters without hitting the ownership APIs
  if (isDevMode() && isDemoWallet(walletAddress)) {
    console.log('🚧 DEV MODE: Returning demo characters for demo wallet')
    const demoCharacters = (await buildDemoCharacters()).map(char => ({
      ...char,
      hasSoul: false, // merged client-side from localStorage
      soul: null,
    }))
    return NextResponse.json({ characters: demoCharacters, totalCount: demoCharacters.length })
  }

  // Apply enhanced rate limits for authenticated users
  const isAuthenticated = sessionInfo.isAuthenticated
  const rateLimitResult = checkOpenSeaRateLimitEnhanced(req, isAuthenticated)
  if (!rateLimitResult.allowed) {
    const limit = isAuthenticated ? '100' : '30' // Enhanced limits for authenticated users
    return NextResponse.json(
      createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "OpenSea"),
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit,
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'X-RateLimit-Authenticated': isAuthenticated.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  try {
    // First, fetch Force NFTs (these work reliably)
    const forceNfts = await fetchCollectionNfts(walletAddress, 'force' as CollectionKey)

    // Validate and filter Force NFTs by correct contract addresses
    const validForceNfts = forceNfts.filter(nft => {
      const config = COLLECTIONS['force' as CollectionKey]
      const isValid = isValidNft(nft)
      const hasCorrectContract = nft.contract?.toLowerCase() === config.contractAddress.toLowerCase()
      
      if (!isValid || !hasCorrectContract) {
        console.log(`🚫 REJECTED 0N1 Force NFT #${nft.identifier} - Wrong contract!`)
        console.log(`   Expected: ${config.contractAddress.toLowerCase()}`)
        console.log(`   Got:      ${nft.contract?.toLowerCase()}`)
        console.log(`   This NFT is from a different collection and will be ignored.`)
        return false
      }
      
      console.log(`✅ ACCEPTED 0N1 Force NFT #${nft.identifier} - Correct contract: ${nft.contract}`)
      return true
    })

    console.log(`📋 Contract validation: Kept ${validForceNfts.length}/${forceNfts.length} 0N1 Force NFTs`)

    // Now, for each Force NFT, try to fetch the corresponding Frame NFT
    console.log(`🎯 Checking for Frame NFTs corresponding to Force NFTs...`)
    const frameNftPromises = validForceNfts.map(forceNft => 
      fetchFrameNftByTokenId(forceNft.identifier)
    )
    
    const frameNftResults = await Promise.allSettled(frameNftPromises)
    const validFrameNfts = frameNftResults
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const frameNft = result.value
          const tokenId = validForceNfts[index].identifier
          
          // Verify the user owns this Frame NFT
          const userOwnsFrame = frameNft.owners?.some((owner: any) => 
            owner.address?.toLowerCase() === walletAddress.toLowerCase()
          )
          
          if (userOwnsFrame) {
            console.log(`✅ User owns Frame NFT #${tokenId}`)
            return frameNft
          } else {
            console.log(`❌ User does not own Frame NFT #${tokenId}`)
            return null
          }
        }
        return null
      })
      .filter(Boolean)

    console.log(`📋 Found ${validFrameNfts.length} owned Frame NFTs`)

    console.log(`Filtered to ${validForceNfts.length} valid Force NFTs and ${validFrameNfts.length} valid Frame NFTs`)

    // Create a more detailed log of what we have
    console.log('✅ Valid Force NFTs after all filtering:', validForceNfts.map(nft => ({
      id: nft.identifier,
      name: nft.name,
      contract: nft.contract,
      hasImage: !!nft.image_url
    })))

    console.log('✅ Valid Frame NFTs after all filtering:', validFrameNfts.map(nft => ({
      id: nft.identifier,
      name: nft.name,
      contract: nft.contract,
      hasImage: !!nft.image_url
    })))

    // Create maps for easier lookup
    const forceMap = new Map(validForceNfts.map(nft => [nft.identifier, nft]))
    const frameMap = new Map(validFrameNfts.map(nft => [nft.identifier, nft]))

    // Create unified characters - only include if user actually owns the NFT
    const characterMap = new Map<string, UnifiedCharacter>()

    console.log('✅ Creating unified characters with proper Force/Frame ownership validation')
    console.log(`🔥 Processing Force NFTs: ${Array.from(forceMap.keys()).map(id => ({ id, contract: forceMap.get(id)?.contract }))}`)
    console.log(`🔥 Processing Frame NFTs: ${Array.from(frameMap.keys()).map(id => ({ id, contract: frameMap.get(id)?.contract }))}`)

    // Process Force NFTs
    for (const [tokenId, forceNft] of forceMap) {
      const hasActualFrame = frameMap.has(tokenId)
      const frameNft = frameMap.get(tokenId)

      console.log(`🔥 Creating unified character for #${tokenId} - Force: ✅, Frame: ${hasActualFrame ? '✅' : '❌'} ${hasActualFrame ? '(owned)' : '(not owned)'}`)

      const character: UnifiedCharacter = {
        tokenId,
        forceImageUrl: forceNft.image_url,
        frameImageUrl: hasActualFrame ? frameNft!.image_url : null, // null if no Frame NFT owned
        hasForce: true,
        hasFrame: hasActualFrame, // Only true if user actually owns the Frame NFT
        displayName: forceNft.name || `0N1 #${tokenId}`
      }

      console.log('🎯 Adding character to map:', character)
      characterMap.set(tokenId, character)
    }

    // Process Frame NFTs that don't have corresponding Force NFTs
    for (const [tokenId, frameNft] of frameMap) {
      if (!characterMap.has(tokenId)) {
        console.log(`🔥 Creating Frame-only character for #${tokenId} - Force: ❌, Frame: ✅`)
        
        const character: UnifiedCharacter = {
          tokenId,
          forceImageUrl: null, // null if no Force NFT owned
          frameImageUrl: frameNft.image_url,
          hasForce: false,
          hasFrame: true,
          displayName: frameNft.name || `0N1 #${tokenId}`
        }

        characterMap.set(tokenId, character)
      }
    }

    // Include souls data
    console.log('📦 Note: Soul data must be merged client-side (localStorage not available on server)')

    // Log character map contents for debugging
    console.log('📋 Character Map Contents:', Array.from(characterMap.values()).map(char => ({
      id: char.tokenId,
      hasForce: char.hasForce,
      hasFrame: char.hasFrame,
      forceImage: !!char.forceImageUrl,
      frameImage: !!char.frameImageUrl
    })))

    // Convert to array - soul data will be merged on client side
    console.log('🔍 CRITICAL DEBUG: Character map before conversion:')
    console.log(`🔍 Character map size: ${characterMap.size}`)
    console.log(`🔍 Character map keys: ${JSON.stringify(Array.from(characterMap.keys()))}`)
    console.log(`🔍 Character map values (raw): ${JSON.stringify(Array.from(characterMap.values()))}`)

    const characters = Array.from(characterMap.values()).map(char => {
      // Don't check for souls here - client will handle this
      return {
        ...char,
        hasSoul: false, // Will be updated client-side
        soul: null // Will be updated client-side
      }
    })

    console.log(`🔍 Characters array length after conversion: ${characters.length}`)
    console.log(`🔍 Characters array content: ${JSON.stringify(characters)}`)

    console.log(`Created ${characters.length} unified characters`)

    // Final logging
    const validForceCount = characters.filter(c => c.hasForce).length
    const validFrameCount = characters.filter(c => c.hasFrame).length
    console.log(`Valid Force NFTs: ${validForceCount}, Valid Frame NFTs: ${validFrameCount}`)
    console.log(`Safe Force NFTs: ${validForceNfts.length}, Safe Frame NFTs: ${validFrameNfts.length}`)
    console.log(`Raw Force NFTs: ${forceNfts.length}, Raw Frame NFTs: ${validFrameNfts.length}`)

    const response: UnifiedCharacterResponse = {
      characters,
      totalCount: characters.length
    }

    console.log(`🚀 Final response characters count: ${response.characters.length}`)
    console.log(`📊 Character map size: ${characterMap.size}`)
    console.log(`📊 Character map keys: ${JSON.stringify(Array.from(characterMap.keys()))}`)

    if (response.characters.length > 0) {
      console.log(`📊 First character sample: ${JSON.stringify(response.characters[0])}`)
      console.log(`📊 All characters: ${JSON.stringify(response.characters)}`)
    }

    console.log(`📊 Response summary: ${JSON.stringify({ 
      charactersLength: response.characters.length, 
      totalCount: response.totalCount, 
      characterMapSize: characterMap.size 
    })}`)

    console.log(`🔍 Pre-serialization response object: ${JSON.stringify(response)}`)

    // Verify we can serialize the response
    try {
      const serialized = JSON.stringify(response)
      console.log(`🔍 JSON.stringify test successful, length: ${serialized.length}`)
    } catch (serializationError) {
      console.error('❌ JSON serialization failed:', serializationError)
      throw new Error(`Response serialization failed: ${serializationError}`)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ API Error:', error)
    
    // Fallback: return empty characters array on error
    return NextResponse.json({ 
      error: 'Failed to fetch NFTs', 
      details: error instanceof Error ? error.message : 'Unknown error',
      characters: [],
      totalCount: 0
    }, { status: 500 })
  }
})