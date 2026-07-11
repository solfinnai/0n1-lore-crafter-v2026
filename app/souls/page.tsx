"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getStoredSouls, deleteSoul, type StoredSoul, initializeHybridStorage, setCurrentWalletAddress } from "@/lib/storage-wrapper"
import { Download, Trash2, Bot, ArrowLeft, Edit, Search, MessageCircle, User } from "lucide-react"
import { SafeNftImage } from "@/components/safe-nft-image"
import { useRouter } from "next/navigation"
import { SoulEditor } from "@/components/soul-editor"
import { Input } from "@/components/ui/input"
import { getCharacterMemories } from "@/lib/memory"
import { generatePreviewText, getPreviewTextColor } from "@/lib/preview-text-generator"
import { useWallet } from "@/components/wallet/wallet-provider"

export default function SoulsPage() {
  const router = useRouter()
  const { address, isConnected } = useWallet()
  const [souls, setSouls] = useState<StoredSoul[]>([])
  const [ownedNfts, setOwnedNfts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSoul, setEditingSoul] = useState<StoredSoul | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deployedSouls, setDeployedSouls] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadSoulsAndNfts = async () => {
      // Redirect if wallet not connected
      if (!isConnected || !address) {
        router.push("/?connect=true")
        return
      }

      // Initialize hybrid storage with wallet address
      setCurrentWalletAddress(address)
      initializeHybridStorage(address).catch(console.error)

      try {
        // First, fetch owned NFTs from OpenSea
        const response = await fetch(`/api/opensea/owned?address=${address}`)
        if (!response.ok) {
          throw new Error('Failed to fetch owned NFTs')
        }
        
        const ownedNftData = await response.json()
        const characters = ownedNftData.characters || []
        setOwnedNfts(characters)

        // Get all stored souls
        const allStoredSouls = getStoredSouls()
        console.log("All stored souls:", allStoredSouls)
        console.log("Owned NFTs characters:", characters)
        
        // Filter souls to only show ones for NFTs the user actually owns
        const ownedTokenIds = new Set(characters.map((char: any) => char.tokenId))
        console.log("Owned token IDs:", Array.from(ownedTokenIds))
        
        const filteredSouls = allStoredSouls.filter(soul => {
          const hasNft = ownedTokenIds.has(soul.data.pfpId)
          console.log(`Soul ${soul.data.pfpId} - Owner has NFT: ${hasNft}`)
          return hasNft
        })
        
        console.log("Filtered souls:", filteredSouls)
        setSouls(filteredSouls)

        // Check which souls have been deployed (have existing conversations)
        const deployed = new Set<string>()
        filteredSouls.forEach((soul) => {
          const memories = getCharacterMemories(soul.data.pfpId)
          if (memories && memories.messages.length > 0) {
            deployed.add(soul.data.pfpId)
          }
        })
        setDeployedSouls(deployed)

      } catch (error) {
        console.error('Error loading souls and NFTs:', error)
        // On error, still try to load souls but with empty owned NFTs
        setSouls([])
        setOwnedNfts([])
      }

      setIsLoading(false)
    }

    loadSoulsAndNfts()
    // Add event listener for storage changes
    window.addEventListener("storage", loadSoulsAndNfts)
    return () => window.removeEventListener("storage", loadSoulsAndNfts)
  }, [isConnected, address, router])

  const handleDelete = (id: string) => {
    deleteSoul(id)
    setSouls((prev) => prev.filter((soul) => soul.id !== id))
  }

  const handleExport = (soul: StoredSoul) => {
    const dataStr = JSON.stringify(soul.data, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `${soul.data.soulName || "soul"}_${soul.data.pfpId}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleDeployAgent = (soul: StoredSoul) => {
    router.push(`/agent/${soul.data.pfpId}`)
  }

  const handleEditSoul = (soul: StoredSoul) => {
    setEditingSoul(soul)
  }

  const handleSaveSoul = (updatedSoul: StoredSoul) => {
    // Update the soul in the list
    setSouls((prev) => prev.map((soul) => (soul.id === updatedSoul.id ? updatedSoul : soul)))
    setEditingSoul(null)
  }

  const filteredSouls = souls.filter((soul) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      soul.data.soulName?.toLowerCase().includes(searchLower) ||
      soul.data.pfpId?.toLowerCase().includes(searchLower) ||
      soul.data.archetype?.toLowerCase().includes(searchLower) ||
      (soul.data.powersAbilities?.powers || []).some((power) => power.toLowerCase().includes(searchLower))
    )
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-purple-300 mb-2">Loading Your Soul Collection</p>
            <p className="text-muted-foreground text-sm">Verifying wallet and fetching your 0N1 Force NFTs...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If we're editing a soul, show the editor
  if (editingSoul) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <SoulEditor soul={editingSoul} onSave={handleSaveSoul} onCancel={() => setEditingSoul(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="border-purple-500/30 hover:bg-purple-900/20"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Soul Collection
              </h1>
            </div>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Create New Soul
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {souls.length === 0 ? (
          <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-purple-900/20 border border-purple-500/30 flex items-center justify-center">
                <User className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-xl text-purple-300 mb-4">No souls created yet</p>
              <p className="text-muted-foreground mb-6 max-w-md">
                {ownedNfts.length > 0 
                  ? `You own ${ownedNfts.length} 0N1 Force NFT${ownedNfts.length > 1 ? 's' : ''}. Create a soul for any of them to get started.`
                  : "You don't own any 0N1 Force NFTs yet. You need to own an NFT to create souls."
                }
              </p>
              {ownedNfts.length > 0 ? (
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Create Your First Soul
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open("https://opensea.io/collection/0n1-force", "_blank")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Get 0N1 Force NFT
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/?connect=true")}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  >
                    Connect Different Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search souls by name, ID, archetype, or powers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSouls.map((soul) => {
                const isDeployed = deployedSouls.has(soul.data.pfpId)

                return (
                  <Card
                    key={soul.id}
                    className="border border-purple-500/30 bg-black/60 backdrop-blur-sm hover:border-purple-500/50 transition-all overflow-hidden flex flex-col h-full min-h-[520px]"
                  >
                    <CardHeader className="pb-2 space-y-1">
                      <CardTitle 
                        className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 cursor-pointer hover:from-purple-300 hover:to-pink-400 transition-all"
                        onClick={() => router.push(`/agent/${soul.data.pfpId}/profile`)}
                      >
                        {soul.data.soulName || `0N1 Force #${soul.data.pfpId}`}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>0N1 Force #{soul.data.pfpId}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(soul.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-4 flex-grow">
                      <div className="flex gap-4">
                        <div 
                          className="relative w-24 h-24 rounded-md overflow-hidden border border-purple-500/30 flex-shrink-0 cursor-pointer hover:border-purple-400 transition-colors"
                          onClick={() => router.push(`/agent/${soul.data.pfpId}/profile`)}
                        >
                          <SafeNftImage
                            src={soul.data.imageUrl || null}
                            alt={`0N1 Force #${soul.data.pfpId}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-black/40 text-purple-300 hover:bg-black/60">
                              {soul.data.archetype}
                            </Badge>
                            {soul.data.powersAbilities?.powers?.slice(0, 2).map((power, index) => (
                              <Badge key={index} variant="outline" className="border-purple-500/30 text-purple-200">
                                {power}
                              </Badge>
                            ))}
                          </div>
                          {soul.data.worldPosition?.societalRole && (
                            <div className="text-sm font-medium text-purple-300">{soul.data.worldPosition.societalRole}</div>
                          )}
                          {(() => {
                            const preview = generatePreviewText(soul.data)
                            return (
                              <p className={`text-sm line-clamp-3 ${getPreviewTextColor(preview.style)}`}>
                                {preview.text}
                              </p>
                            )
                          })()}
                        </div>
                      </div>
                      <Separator className="bg-purple-500/20" />
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Personality:</p>
                          <p className="line-clamp-2 text-purple-200 leading-relaxed">
                            {soul.data.personalityProfile?.description
                              ? soul.data.personalityProfile.description.length > 80
                                ? `${soul.data.personalityProfile.description.substring(0, 80)}...`
                                : soul.data.personalityProfile.description
                              : "A stoic exterior hiding a storm of emotions..."}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Voice:</p>
                          <p className="line-clamp-2 text-purple-200 leading-relaxed">
                            {soul.data.voice?.speechStyle
                              ? soul.data.voice.speechStyle.length > 80
                                ? `${soul.data.voice.speechStyle.substring(0, 80)}...`
                                : soul.data.voice.speechStyle
                              : "Speaks in short, cryptic phrases that bl..."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-3 border-t border-purple-500/20 bg-black/40 mt-auto">
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-500/30 hover:bg-purple-900/20 text-purple-200"
                          onClick={() => router.push(`/agent/${soul.data.pfpId}/profile`)}
                        >
                          <User className="h-3 w-3 mr-1" />
                          Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-500/30 hover:bg-purple-900/20 text-purple-200"
                          onClick={() => handleEditSoul(soul)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-500/30 hover:bg-purple-900/20 text-purple-200"
                          onClick={() => handleExport(soul)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 hover:bg-red-900/20 text-red-200"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this soul. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(soul.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <Button
                        onClick={() => handleDeployAgent(soul)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {isDeployed ? (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Soul Chat
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 mr-2" />
                            Deploy Soul
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
