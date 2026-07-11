"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchNftDataWithFallback, getOpenSeaNftLink } from "@/lib/api"
import type { CharacterData, Trait } from "@/lib/types"
import { ExternalLink, AlertTriangle, User } from "lucide-react"
import Link from "next/link"
import { SafeNftImage } from "@/components/safe-nft-image"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { OwnedNfts } from "@/components/wallet/owned-nfts"
import { useWallet } from "@/components/wallet/wallet-provider"
import { soulExistsForNft } from "@/lib/storage-wrapper"
import { useRouter } from "next/navigation"
import { NftTraitsSidebar } from "@/components/nft-traits-sidebar"

interface PfpInputProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
}

export function PfpInput({ characterData, updateCharacterData, nextStep }: PfpInputProps) {
  const [pfpId, setPfpId] = useState(characterData.pfpId || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [traits, setTraits] = useState<Trait[]>(characterData.traits || [])
  const [imageUrl, setImageUrl] = useState<string | null>(characterData.imageUrl || null)
  const [traitsLoaded, setTraitsLoaded] = useState(characterData.traits.length > 0)
  const [isApiData, setIsApiData] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { isConnected } = useWallet()
  const [selectedNftId, setSelectedNftId] = useState<string | null>(characterData.pfpId || null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarTokenId, setSidebarTokenId] = useState<string | null>(null)
  const [sidebarImageUrl, setSidebarImageUrl] = useState<string | null>(null)
  const router = useRouter()
  
  // Check if the current NFT has a soul attached
  const hasSoul = selectedNftId ? soulExistsForNft(selectedNftId) : false

  // Fetch token data function
  const fetchTokenData = async (tokenId: string) => {
    if (!tokenId.trim()) return

    setIsLoading(true)
    setError("")
    setIsApiData(false)
    setTraitsLoaded(false) // Reset traits loaded state

    try {
      // Normalize the token ID (remove leading zeros)
      const normalizedTokenId = tokenId.replace(/^0+/, "")

      // Check if the token ID is within the valid range (1-7777)
      const tokenIdNumber = Number.parseInt(normalizedTokenId, 10)
      if (isNaN(tokenIdNumber) || tokenIdNumber < 1 || tokenIdNumber > 7777) {
        setError("Please try again and select a valid 0N1 Force NFT")
        setIsLoading(false)
        return
      }

      console.log(`Fetching data for token ID: ${normalizedTokenId}`)

      const {
        traits: fetchedTraits,
        imageUrl: fetchedImageUrl,
        isApiData: isFromApi,
      } = await fetchNftDataWithFallback(normalizedTokenId)

      if (fetchedTraits.length === 0) {
        setError("Could not fetch data from OpenSea API. Using generated traits instead.")
      } else {
        setTraits(fetchedTraits)
        setImageUrl(fetchedImageUrl)
        updateCharacterData({
          pfpId: normalizedTokenId, // Store normalized ID
          traits: fetchedTraits,
          imageUrl: fetchedImageUrl || undefined,
        })
        setTraitsLoaded(true)
        setIsApiData(isFromApi)
        setError("") // Clear any previous errors
      }
    } catch (err) {
      console.error("Error in PfpInput component:", err)
      setError(`Error fetching NFT data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false) // Always set loading to false when done
    }
  }

  // Handle NFT selection from owned NFTs - immediately fetch traits and proceed
  const handleSelectNft = (tokenId: string) => {
    setPfpId(tokenId)
    setSelectedNftId(tokenId)

    // Immediately fetch the NFT data and proceed to next step
    fetchTokenDataAndProceed(tokenId)
  }

  // Fetch data and automatically proceed to next step
  const fetchTokenDataAndProceed = async (tokenId: string) => {
    setIsLoading(true)
    setError("")

    try {
      const normalizedTokenId = tokenId.replace(/^0+/, "")
      
      const {
        traits: fetchedTraits,
        imageUrl: fetchedImageUrl,
        isApiData: isFromApi,
      } = await fetchNftDataWithFallback(normalizedTokenId)

      updateCharacterData({
        pfpId: normalizedTokenId,
        traits: fetchedTraits,
        imageUrl: fetchedImageUrl || undefined,
      })

      // Automatically proceed to next step
      nextStep()
    } catch (err) {
      console.error("Error fetching NFT data:", err)
      setError(`Error fetching NFT data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle showing traits in sidebar
  const handleShowTraits = (tokenId: string, imageUrl: string | null) => {
    setSidebarTokenId(tokenId)
    setSidebarImageUrl(imageUrl)
    setSidebarOpen(true)
  }

  // Retry fetching if we have a token ID but no traits
  useEffect(() => {
    if (characterData.pfpId && !characterData.traits.length && retryCount < 2) {
      console.log(`Retrying fetch for token ${characterData.pfpId}, attempt ${retryCount + 1}`)
      setPfpId(characterData.pfpId)
      fetchTokenData(characterData.pfpId)
      setRetryCount((prev) => prev + 1)
    }
  }, [characterData.pfpId, characterData.traits.length, retryCount])

  const handleViewProfile = () => {
    if (selectedNftId && hasSoul) {
      router.push(`/agent/${selectedNftId}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Start with Your 0N1</h2>
        <p className="text-muted-foreground">
          Connect your wallet to select your 0N1 Force NFT and begin crafting your character's lore
        </p>
      </div>

      {/* Wallet Connection Section */}
      <div className="flex justify-center mb-4">
        <WalletConnectButton />
      </div>

      {!isConnected && (
        <div className="text-center p-6 border border-purple-500/30 rounded-lg bg-black/60 backdrop-blur-sm">
          <p className="text-purple-300 mb-4">Connect your wallet to see your 0N1 Force NFTs</p>
          <p className="text-sm text-purple-200/70">You need to connect your wallet to continue</p>
        </div>
      )}

      {/* Owned NFTs Section - Only show when wallet is connected */}
      {isConnected && (
        <OwnedNfts 
          onSelectNft={handleSelectNft} 
          onShowTraits={handleShowTraits}
          selectedNftId={selectedNftId} 
          isLoading={isLoading} 
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-6 border border-purple-500/30 rounded-lg bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-2 border-pink-500 animate-spin-slow"></div>
            </div>
            <p className="text-purple-300 mt-2">Setting up your character for 0N1 #{selectedNftId}...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-md bg-red-950/30 border border-red-500/50 text-red-200 flex items-start gap-2 animate-fadeIn">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            <p className="text-sm mt-1">
              Try selecting a different NFT or check if the ID exists in the{" "}
              <a
                href="https://opensea.io/collection/0n1-force"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-100"
              >
                0N1 Force collection
              </a>
              .
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs bg-red-950/50 hover:bg-red-900/50 border-red-500/30"
              onClick={() => selectedNftId && fetchTokenData(selectedNftId)}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Traits Sidebar */}
      <NftTraitsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tokenId={sidebarTokenId}
        imageUrl={sidebarImageUrl}
      />
    </div>
  )
}
