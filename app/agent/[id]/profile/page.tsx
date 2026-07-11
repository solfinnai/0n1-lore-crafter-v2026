"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSoulByNftId, type StoredSoul } from "@/lib/storage-wrapper"
import { ArrowLeft, MessageCircle, Edit, Download, Trash2, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CharacterDossier } from "@/components/character-dossier"
import { getOpenSeaNftLink } from "@/lib/api"
import { UnifiedSoulHeader } from "@/components/unified-soul-header"
import { deleteSoul } from "@/lib/storage-wrapper"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [soul, setSoul] = useState<StoredSoul | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const nftId = params.id as string
    if (nftId) {
      const foundSoul = getSoulByNftId(nftId)
      setSoul(foundSoul)
    }
    setIsLoading(false)
  }, [params.id])

  const handleDelete = () => {
    if (!soul) return
    if (confirm(`Are you sure you want to delete ${soul.data.soulName}? This action cannot be undone.`)) {
      deleteSoul(soul.id)
      router.push("/souls")
    }
  }

  const handleExport = () => {
    if (!soul) return
    
    const dataStr = JSON.stringify(soul.data, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `${soul.data.soulName || "soul"}_${soul.data.pfpId}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleSoulChat = () => {
    router.push(`/agent/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!soul) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <p className="text-xl text-purple-300 mb-6">Soul not found</p>
            <Button
              onClick={() => router.push("/souls")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Back to Souls
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const openSeaLink = getOpenSeaNftLink(soul.data.pfpId)

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <UnifiedSoulHeader 
        soul={soul}
        onExport={handleExport}
        onDelete={handleDelete}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Character Summary */}
        <div className="mb-6">
          <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Large Character Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-64 h-64 rounded-lg overflow-hidden border border-purple-500/30">
                    <Image
                      src={soul.data.imageUrl || `/placeholder.svg?height=256&width=256&query=0N1 Force #${soul.data.pfpId}`}
                      alt={`0N1 Force #${soul.data.pfpId}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Character Info */}
                <div className="flex-grow space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{soul.data.soulName}</h2>
                    <p className="text-lg text-purple-300">0N1 Force #{soul.data.pfpId}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-sm">{soul.data.archetype}</Badge>
                    <Badge variant="outline" className="text-sm">{soul.data.background}</Badge>
                    {soul.data.powersAbilities?.powers.slice(0, 3).map((power, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {power}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300 mb-1">Current Status</h3>
                      <p className="text-cyan-300">Navigating the blurred lines between digital and physical realms...</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-purple-300 mb-1">Reputation</h3>
                      <p className="text-white">Respected as a mediator between warring tech clans and spiritual factions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-md font-semibold text-purple-300 mb-1">Personality</h4>
                        <p className="text-sm text-gray-300">A stoic exterior hiding a storm of emotions...</p>
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-purple-300 mb-1">Voice</h4>
                        <p className="text-sm text-gray-300">Speaks in clipped, technical phrases interwoven with ancient wisdom...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Character Dossier */}
        <CharacterDossier characterData={soul.data} className="h-auto" />
      </div>
    </div>
  )
} 