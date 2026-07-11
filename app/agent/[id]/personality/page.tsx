"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSoulByNftId, updateSoul, type StoredSoul } from "@/lib/storage-wrapper"
import { UnifiedSoulHeader } from "@/components/unified-soul-header"
import { PersonalityDashboard } from "@/components/personality-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PersonalityPage() {
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

  const handlePersonalityUpdate = (updatedSoul: StoredSoul) => {
    if (updateSoul(updatedSoul.id, updatedSoul.data)) {
      setSoul(updatedSoul)
    }
  }

  const handleDelete = () => {
    if (!soul) return
    if (confirm(`Are you sure you want to delete ${soul.data.soulName}? This action cannot be undone.`)) {
      // deleteSoul function would be imported if needed
      router.push("/souls")
    }
  }

  const handleExport = () => {
    if (!soul) return
    
    const dataStr = JSON.stringify(soul.data, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `${soul.data.soulName || "soul"}_personality_${soul.data.pfpId}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
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
        <PersonalityDashboard 
          soul={soul} 
          onUpdate={handlePersonalityUpdate}
        />
      </div>
    </div>
  )
} 