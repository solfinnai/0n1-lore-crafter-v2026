"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ExternalLink, AlertTriangle } from "lucide-react"
import { SafeNftImage } from "@/components/safe-nft-image"
import { fetchNftDataWithFallback, getOpenSeaNftLink } from "@/lib/api"
import type { Trait } from "@/lib/types"
import Link from "next/link"

interface NftTraitsSidebarProps {
  isOpen: boolean
  onClose: () => void
  tokenId: string | null
  imageUrl?: string | null
}

export function NftTraitsSidebar({ isOpen, onClose, tokenId, imageUrl }: NftTraitsSidebarProps) {
  const [traits, setTraits] = useState<Trait[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isApiData, setIsApiData] = useState(false)
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchTraits = async () => {
      if (!tokenId) return

      setIsLoading(true)
      setError("")
      setTraits([])
      setIsApiData(false)
      setFetchedImageUrl(null)

      try {
        const normalizedTokenId = tokenId.replace(/^0+/, "")
        
        const {
          traits: fetchedTraits,
          imageUrl: fetchedImage,
          isApiData: isFromApi,
        } = await fetchNftDataWithFallback(normalizedTokenId)

        setTraits(fetchedTraits)
        setFetchedImageUrl(fetchedImage)
        setIsApiData(isFromApi)
        
        if (fetchedTraits.length === 0) {
          setError("Could not fetch traits data. Please try again later.")
        }
      } catch (err) {
        console.error("Error fetching traits:", err)
        setError("Failed to load traits data")
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && tokenId) {
      fetchTraits()
    }
  }, [isOpen, tokenId])

  const normalizedId = tokenId?.replace(/^0+/, "") || ""
  const openSeaLink = normalizedId ? getOpenSeaNftLink(normalizedId) : ""
  const displayImageUrl = fetchedImageUrl || imageUrl

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-black/90 backdrop-blur-md border-l border-purple-500/30 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
            <h2 className="text-lg font-semibold text-purple-300">NFT Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-400 hover:text-purple-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {tokenId && (
              <div className="space-y-4">
                {/* NFT Image */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-purple-500/30">
                    {displayImageUrl ? (
                      <SafeNftImage
                        src={displayImageUrl}
                        alt={`0N1 Force #${normalizedId}`}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-900/20 text-purple-300">
                        No image available
                      </div>
                    )}
                  </div>
                </div>

                {/* NFT Title */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">0N1 Force #{normalizedId}</h3>
                  <Link
                    href={openSeaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors mt-2"
                  >
                    View on OpenSea
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
                    </div>
                    <span className="ml-2 text-purple-300">Loading traits...</span>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div className="p-3 rounded-md bg-red-950/30 border border-red-500/50 text-red-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs bg-red-950/50 hover:bg-red-900/50 border-red-500/30"
                        onClick={() => tokenId && setIsLoading(true)}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

                {/* Traits Display */}
                {traits.length > 0 && !isLoading && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-300">Traits</h4>
                    <div className="space-y-2">
                      {traits.map((trait, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-purple-950/30 border border-purple-500/20"
                        >
                          <span className="font-medium text-purple-200">{trait.trait_type}:</span>
                          <span className="text-white">{trait.value}</span>
                        </div>
                      ))}
                    </div>
                    {!isApiData && (
                      <div className="mt-3 text-xs text-amber-400 flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span>
                          Using generated data as fallback. OpenSea API may be temporarily unavailable.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 