import { NextRequest, NextResponse } from "next/server"
import { getAddress } from 'ethers'
import { checkOwnershipRateLimit, createRateLimitResponse } from '@/lib/rate-limit'
import { COLLECTIONS, CollectionKey } from '@/lib/collection-config'
import { getRequestUser } from '@/lib/supabase-server'
import { isDevMode } from '@/lib/auth'
import { isDemoWallet, isSampleModeEnabled } from '@/lib/dev-mode'
import { isSampleToken } from '@/lib/sample-token'

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY

// Phase 2: authentication comes from a Supabase session (Bearer JWT), never
// from the old custom JWT stack. The ?address= param is NOT an identity — it
// is just the public on-chain address whose ownership is being looked up
// (current-owner data is public on OpenSea), so it grants nothing sensitive.
export async function GET(request: NextRequest) {
  const auth = await getRequestUser(request)
  const isAuthenticated = auth !== null

  const { searchParams } = new URL(request.url)
  const addressParam = searchParams.get("address") || searchParams.get("walletAddress")
  const walletAddress = addressParam ? addressParam.toLowerCase() : null
  const tokenId = searchParams.get("tokenId")

  // Input validation
  if (!walletAddress || !tokenId) {
    return NextResponse.json(
      {
        error: !walletAddress ? "Address parameter is required" : "TokenId parameter is required",
        message: !walletAddress ? "Provide the wallet address to check ownership for" : "TokenId is required for ownership verification"
      },
      { status: 400 }
    )
  }

  // Validate the wallet is a well-formed EOA address and the token id is a
  // plain numeric string BEFORE any external fetch (and before the demo/rate
  // -limit branches). getAddress() throws on non-EOA input, blocking
  // path/parameter injection into the outbound OpenSea URLs.
  try {
    getAddress(walletAddress)
  } catch {
    return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
  }
  if (!/^\d+$/.test(tokenId)) {
    return NextResponse.json({ error: "Invalid token ID format" }, { status: 400 })
  }

  console.log(`🔐 Ownership verification - Authentication status: ${isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS'}`)
  console.log(`🔍 Verifying ownership for wallet: ${walletAddress}, tokenId: ${tokenId}`)

  // Demo wallet: in dev mode it owns everything (full local testing); in
  // production sample mode it owns ONLY the pinned sample token. Never falls
  // through to a real OpenSea lookup - the demo address owns nothing on-chain.
  if (isDemoWallet(walletAddress)) {
    const owns = isDevMode() || (isSampleModeEnabled() && isSampleToken(tokenId))
    if (owns) {
      console.log(`🚧 ${isDevMode() ? 'DEV' : 'SAMPLE'} MODE: Granting ownership of #${tokenId} to demo wallet`)
    }
    return NextResponse.json({
      owns,
      ownedCollections: owns ? ['force'] : [],
      ownsForce: owns,
      ownsFrame: false,
      method: isDevMode() ? 'dev-mode' : 'sample-mode',
      authenticated: isAuthenticated
    })
  }

  // Check rate limit after authentication
  const rateLimitResult = checkOwnershipRateLimit(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "ownership verification"),
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  if (!OPENSEA_API_KEY) {
    return NextResponse.json(
      { error: "OpenSea API key is not configured" }, 
      { status: 500 }
    )
  }

  try {
    // Check ownership across both Force and Frame collections
    const [ownsForce, ownsFrame] = await Promise.all([
      checkOwnershipViaOpenSea(walletAddress, tokenId, 'force'),
      checkOwnershipViaOpenSea(walletAddress, tokenId, 'frame')
    ])
    
    const owns = ownsForce || ownsFrame
    const ownedCollections = []
    if (ownsForce) ownedCollections.push('force')
    if (ownsFrame) ownedCollections.push('frame')
    
    return NextResponse.json({ 
      owns,
      ownedCollections,
      ownsForce,
      ownsFrame,
      method: "opensea",
      authenticated: isAuthenticated
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
        'X-Authenticated': isAuthenticated.toString()
      },
    })
  } catch (error) {
    console.error("Ownership verification failed:", error)
    return NextResponse.json(
      { error: "Failed to verify ownership" }, 
      { status: 500 }
    )
  }
}

async function checkOwnershipViaOpenSea(address: string, tokenId: string, collection: CollectionKey): Promise<boolean> {
  const normalizedTokenId = tokenId.replace(/^0+/, "")
  const contractAddress = COLLECTIONS[collection].contractAddress
  
  // Check if this specific NFT is owned by the address
  const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${encodeURIComponent(contractAddress)}/nfts/${encodeURIComponent(normalizedTokenId)}`
  
  console.log(`Verifying ${COLLECTIONS[collection].displayName} ownership: ${address} owns NFT #${normalizedTokenId}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": OPENSEA_API_KEY!,
        "Accept": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error(`OpenSea ${collection} ownership API error: ${response.status}`)
      return false // Return false instead of throwing to allow other collection checks
    }

    const data = await response.json()
    
    // Check if the current owner matches the provided address
    const currentOwner = data.nft?.owners?.[0]?.address || data.nft?.owner
    const owns = currentOwner?.toLowerCase() === address.toLowerCase()
    
    console.log(`${COLLECTIONS[collection].displayName} ownership result: ${address} ${owns ? 'OWNS' : 'DOES NOT OWN'} NFT #${normalizedTokenId}`)
    
    return owns
  } catch (error) {
    console.error(`Error checking ${collection} ownership:`, error)
    return false // Return false on error to allow other collection checks
  }
} 