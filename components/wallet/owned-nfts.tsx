"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertTriangle, ExternalLink, Sparkles, Play, Edit } from "lucide-react"
import { useWallet } from "@/components/wallet/wallet-provider"
import type { UnifiedCharacter } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { UnifiedCharacterCard } from "@/components/unified-character-card"
import { getStoredSouls } from "@/lib/storage-wrapper"

interface OwnedNftsProps {
  onSelectNft: (tokenId: string) => void
  onShowTraits: (tokenId: string, imageUrl: string | null, collection: string) => void
  selectedNftId?: string | null
  isLoading?: boolean
}

export function OwnedNfts({ onSelectNft, onShowTraits, selectedNftId, isLoading: externalLoading }: OwnedNftsProps) {
  const { address, isConnected } = useWallet()
  const [characters, setCharacters] = useState<UnifiedCharacter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function loadOwnedNfts() {
      if (!address || !isConnected) return

      setIsLoading(true)
      setError("")

      try {
        console.log("Fetching NFTs for address:", address)
        // Call our API route directly with the connected address
        const response = await fetch(`/api/opensea/owned?address=${address}`)

        if (!response.ok) {
          const errorData = await response.json()
          // Check if it's a fallback response with characters
          if (errorData.fallback && errorData.characters) {
            console.log("Using fallback characters:", errorData.characters)
            setCharacters(errorData.characters)
          } else {
            throw new Error(errorData.error || "Failed to fetch owned NFTs")
          }
        } else {
          const data = await response.json()
          console.log("API response:", data)
          
          // Merge souls data from localStorage with the NFT data
          const storedSouls = getStoredSouls()
          console.log("🔵 MERGING SOULS WITH NFTS - Debug Info:")
          console.log("- Total stored souls:", storedSouls.length)
          console.log("- Stored soul IDs:", storedSouls.map(s => ({ pfpId: s.data.pfpId, name: s.data.soulName })))
          console.log("- NFT character IDs:", (data.characters || []).map((c: any) => c.tokenId))
          
          const charactersWithSouls = (data.characters || []).map((char: UnifiedCharacter) => {
            const existingSoul = storedSouls.find(soul => soul.data.pfpId === char.tokenId)
            if (existingSoul) {
              console.log(`✅ Found soul for NFT #${char.tokenId}: ${existingSoul.data.soulName}`)
            }
            return {
              ...char,
              hasSoul: !!existingSoul,
              soul: existingSoul ? existingSoul.data : null
            }
          })
          
          console.log("- Characters with souls:", charactersWithSouls.filter((c: UnifiedCharacter) => c.hasSoul).length)
          setCharacters(charactersWithSouls)
        }
      } catch (err) {
        console.error("Error fetching owned NFTs:", err)
        setError(`Failed to load your 0N1 Force NFTs: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadOwnedNfts()
    
    // Listen for storage changes to update souls
    const handleStorageChange = () => {
      loadOwnedNfts()
    }
    
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [address, isConnected])

  const handleEditProfile = (tokenId: string) => {
    router.push(`/agent/${tokenId}`)
  }

  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-purple-300">Loading your 0N1 Force NFTs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-950/30 border border-red-500/50 text-red-200 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            <p className="text-sm mt-1">Check the browser console for more details.</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm">Please try refreshing the page.</p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => window.open("https://opensea.io/collection/0n1-force", "_blank")}
          >
            View on OpenSea <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  if (characters.length === 0) {
    return (
      <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-center text-purple-300 mb-4">No 0N1 Force NFTs found in your wallet.</p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://opensea.io/collection/0n1-force", "_blank")}
            >
              View 0N1 Force Collection <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-purple-300">Your 0N1 Force NFTs</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {characters.map((character) => (
          <UnifiedCharacterCard
            key={character.tokenId}
            character={character}
            onSelectNft={onSelectNft}
            onShowTraits={onShowTraits}
            onEditProfile={handleEditProfile}
            selectedNftId={selectedNftId}
            isLoading={externalLoading}
          />
        ))}
      </div>
    </div>
  )
}
