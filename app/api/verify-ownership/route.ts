import { NextRequest, NextResponse } from "next/server"
import { checkOwnershipRateLimit, createRateLimitResponse } from '@/lib/rate-limit'
import { COLLECTIONS, CollectionKey } from '@/lib/collection-config'
import { withOptionalAuth, getRequestWalletAddress } from '@/lib/auth-middleware'
import { isDevMode } from '@/lib/auth'
import { isDemoWallet } from '@/lib/dev-mode'

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY

export const GET = withOptionalAuth(async (request: NextRequest, sessionInfo) => {
  // Get wallet address from authentication (secure) or legacy parameter (backward compatibility)
  const walletAddress = await getRequestWalletAddress(request, sessionInfo)
  const { searchParams } = new URL(request.url)
  const tokenId = searchParams.get("tokenId")

  // Input validation
  if (!walletAddress || !tokenId) {
    return NextResponse.json(
      { 
        error: !walletAddress ? "Authentication required or address parameter missing" : "TokenId parameter is required",
        message: !walletAddress ? "Please authenticate with your wallet or provide a valid address parameter" : "TokenId is required for ownership verification",
        authenticationUrl: !walletAddress ? '/api/auth/challenge' : undefined
      }, 
      { status: 400 }
    )
  }

  console.log(`🔐 Ownership verification - Authentication status: ${sessionInfo.isAuthenticated ? 'AUTHENTICATED' : 'LEGACY_MODE'}`)
  console.log(`🔍 Verifying ownership for wallet: ${walletAddress}, tokenId: ${tokenId}`)

  // Demo wallet in dev mode owns everything - lets the app be tested without an NFT
  if (isDevMode() && isDemoWallet(walletAddress)) {
    console.log(`🚧 DEV MODE: Granting ownership of #${tokenId} to demo wallet`)
    return NextResponse.json({
      owns: true,
      ownedCollections: ['force'],
      ownsForce: true,
      ownsFrame: false,
      method: 'dev-mode',
      authenticated: sessionInfo.isAuthenticated
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

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address format" }, 
      { status: 400 }
    )
  }

  // Validate token ID format
  if (!/^\d+$/.test(tokenId)) {
    return NextResponse.json(
      { error: "Invalid token ID format" }, 
      { status: 400 }
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
      authenticated: sessionInfo.isAuthenticated
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
        'X-Authenticated': sessionInfo.isAuthenticated.toString()
      },
    })
  } catch (error) {
    console.error("Ownership verification failed:", error)
    return NextResponse.json(
      { error: "Failed to verify ownership" }, 
      { status: 500 }
    )
  }
})

async function checkOwnershipViaOpenSea(address: string, tokenId: string, collection: CollectionKey): Promise<boolean> {
  const normalizedTokenId = tokenId.replace(/^0+/, "")
  const contractAddress = COLLECTIONS[collection].contractAddress
  
  // Check if this specific NFT is owned by the address
  const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddress}/nfts/${normalizedTokenId}`
  
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