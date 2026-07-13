import { NextRequest, NextResponse } from "next/server"
import { getAddress } from 'ethers'
import { checkOpenSeaRateLimitEnhanced, createRateLimitResponse } from '@/lib/rate-limit'
import { COLLECTIONS, CollectionKey, getAllCollectionKeys } from '@/lib/collection-config'
import { UnifiedCharacter, UnifiedCharacterResponse } from '@/lib/types'
import { getRequestUser } from '@/lib/supabase-server'
import { isDevMode } from '@/lib/auth'
import { isDemoWallet, isSampleModeEnabled, DEMO_TOKEN_IDS } from '@/lib/dev-mode'
import { SAMPLE_TOKEN_ID, SAMPLE_TOKEN_IMAGE } from '@/lib/sample-token'

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY

// Bound the unauthenticated external-fetch amplification: cap the paginated
// OpenSea account walk, and cap how many per-token Frame lookups we fan out.
const MAX_PAGES = 5
const MAX_FRAME_LOOKUPS = 60

// A numeric token id (as returned by OpenSea `identifier`). Guards the value
// before it is interpolated into an outbound OpenSea URL path.
function isNumericTokenId(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value)
}

// Demo/sample mode: build a set of characters without requiring real ownership.
// The pinned sample token uses its committed local image; other demo tokens try
// OpenSea for real images and fall back to placeholders.
async function buildDemoCharacters(tokenIds: string[], label: string): Promise<UnifiedCharacter[]> {
  const forceContract = COLLECTIONS['force' as CollectionKey].contractAddress

  const characters = await Promise.all(tokenIds.map(async (tokenId): Promise<UnifiedCharacter> => {
    let imageUrl: string | null = null
    if (tokenId === SAMPLE_TOKEN_ID) {
      imageUrl = SAMPLE_TOKEN_IMAGE
    } else {
      try {
        const response = await fetch(
          `https://api.opensea.io/api/v2/chain/ethereum/contract/${encodeURIComponent(forceContract)}/nfts/${encodeURIComponent(tokenId)}`,
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
    }

    return {
      tokenId,
      forceImageUrl: imageUrl || `https://placehold.co/300x300/3a1c71/ffffff?text=0N1+%23${tokenId}`,
      frameImageUrl: null,
      hasForce: true,
      hasFrame: false,
      displayName: `0N1 #${tokenId} (${label})`,
    }
  }))

  return characters
}

async function fetchCollectionNfts(address: string, collection: CollectionKey): Promise<any[]> {
  const config = COLLECTIONS[collection]
  // OpenSea's v2 account endpoint filters by collection SLUG. The old
  // asset_contract_address param is v1-only and silently ignored by v2, which
  // made wallets with many non-0N1 NFTs only surface the 0N1s that happened to
  // land in the first page of results. Filter by slug and follow the `next`
  // cursor so large wallets get ALL their 0N1s.
  const nfts: any[] = []
  let next: string | null = null

  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `https://api.opensea.io/v2/chain/ethereum/account/${encodeURIComponent(address)}/nfts` +
      `?collection=${encodeURIComponent(config.openSeaSlug)}&limit=50${next ? `&next=${encodeURIComponent(next)}` : ""}`

    console.log(`Fetching ${config.displayName} NFTs (page ${page + 1})`)

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': OPENSEA_API_KEY || '',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`Failed to fetch ${config.displayName} NFTs: ${response.status}`)
      break
    }

    const data: { nfts?: any[]; next?: string | null } = await response.json()
    nfts.push(...(data.nfts || []))
    next = data.next || null
    if (!next || (data.nfts || []).length === 0) break
  }

  console.log(`Found ${nfts.length} ${config.displayName} NFTs`)
  console.log(`${config.displayName} NFT IDs:`, nfts.map((nft: any) => nft.identifier))

  return nfts
}

// New function to fetch Frame NFT by specific token ID
async function fetchFrameNftByTokenId(tokenId: string): Promise<any | null> {
  // `tokenId` originates from OpenSea's `identifier`, but validate defensively
  // before interpolating it into an outbound URL path.
  if (!isNumericTokenId(tokenId)) {
    console.log(`❌ Skipping Frame lookup for non-numeric token id: ${tokenId}`)
    return null
  }
  const frameContract = COLLECTIONS['frame' as CollectionKey].contractAddress
  const url = `https://api.opensea.io/v2/chain/ethereum/contract/${encodeURIComponent(frameContract)}/nfts/${encodeURIComponent(tokenId)}`
  
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

// Helper function to validate NFT has required properties.
// Only identifier + contract are required - name and image can be missing when
// OpenSea hasn't refreshed metadata, and we fall back to placeholders for those
// rather than hiding an NFT the wallet genuinely owns.
function isValidNft(nft: any): boolean {
  return !!(nft && nft.identifier && nft.contract)
}

function nftImageUrl(nft: any): string {
  return nft.image_url && String(nft.image_url).trim() !== ""
    ? nft.image_url
    : `https://placehold.co/300x300/3a1c71/ffffff?text=0N1+%23${nft.identifier}`
}

// Phase 2: authentication comes from a Supabase session (Bearer JWT), never
// from the old custom JWT stack. The ?address= param is NOT an identity — it
// only names the public on-chain address whose NFT list is being fetched
// (OpenSea account holdings are public data), so it grants nothing sensitive.
export async function GET(req: NextRequest) {
  console.log(`🚀 UNIFIED CHARACTERS API CALLED: ${new Date().toISOString()}`)

  const auth = await getRequestUser(req)
  const isAuthenticated = auth !== null

  const { searchParams } = new URL(req.url)
  const addressParam = searchParams.get('address') || searchParams.get('walletAddress')
  const walletAddress = addressParam ? addressParam.toLowerCase() : null

  if (!walletAddress) {
    return NextResponse.json({
      error: 'Address required',
      message: 'Provide the wallet address to fetch characters for'
    }, { status: 400 })
  }

  // Validate the wallet is a well-formed EOA address BEFORE any external fetch.
  // getAddress() throws on anything that is not a 20-byte hex address, which
  // blocks path/parameter injection into the outbound OpenSea URLs.
  try {
    getAddress(walletAddress)
  } catch {
    return NextResponse.json({
      error: 'Invalid Ethereum address format'
    }, { status: 400 })
  }

  console.log(`Fetching unified characters for address ${walletAddress}`)
  console.log(`🔐 Authentication status: ${isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS'}`)

  // Demo wallet: return demo characters without hitting the ownership APIs.
  // Dev mode surfaces the full demo set; production sample mode surfaces ONLY
  // the pinned sample token.
  if ((isDevMode() || isSampleModeEnabled()) && isDemoWallet(walletAddress)) {
    const tokenIds = isDevMode() ? DEMO_TOKEN_IDS : [SAMPLE_TOKEN_ID]
    const label = isDevMode() ? 'Demo' : 'Sample'
    console.log(`🚧 ${label.toUpperCase()} MODE: Returning ${tokenIds.length} character(s) for demo wallet`)
    const demoCharacters = (await buildDemoCharacters(tokenIds, label)).map(char => ({
      ...char,
      hasSoul: false, // merged client-side from localStorage
      soul: null,
    }))
    return NextResponse.json({ characters: demoCharacters, totalCount: demoCharacters.length })
  }

  // Apply enhanced rate limits for authenticated users
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
    // Bound the per-token Frame fan-out so a whale wallet can't amplify one
    // request into an unbounded number of outbound OpenSea fetches.
    const forceNftsForFrameLookup = validForceNfts.slice(0, MAX_FRAME_LOOKUPS)
    if (validForceNfts.length > MAX_FRAME_LOOKUPS) {
      console.log(`⚠️ Capping Frame lookups at ${MAX_FRAME_LOOKUPS} (wallet has ${validForceNfts.length} Force NFTs)`)
    }
    const frameNftPromises = forceNftsForFrameLookup.map(forceNft =>
      fetchFrameNftByTokenId(forceNft.identifier)
    )
    
    const frameNftResults = await Promise.allSettled(frameNftPromises)
    const validFrameNfts = frameNftResults
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const frameNft = result.value
          const tokenId = forceNftsForFrameLookup[index].identifier
          
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
        forceImageUrl: nftImageUrl(forceNft),
        frameImageUrl: hasActualFrame ? nftImageUrl(frameNft!) : null, // null if no Frame NFT owned
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
          frameImageUrl: nftImageUrl(frameNft),
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
}