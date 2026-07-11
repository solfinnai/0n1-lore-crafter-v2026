"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSoulByNftId, type StoredSoul } from "@/lib/storage-wrapper"
import { SoulEditor } from "@/components/soul-editor"
import { ArrowLeft } from 'lucide-react'

export default function EditSoulPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [soul, setSoul] = useState<StoredSoul | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get return URL from query params, default to character profile
  const getReturnUrl = () => {
    const returnTo = searchParams.get('returnTo')
    if (returnTo) {
      return decodeURIComponent(returnTo)
    }
    // Default to character profile if no return URL specified
    return `/agent/${params.id}/profile`
  }

  useEffect(() => {
    const nftId = params.id as string
    if (nftId) {
      const foundSoul = getSoulByNftId(nftId)
      setSoul(foundSoul)
      setIsLoading(false)
    }
  }, [params.id])

  const handleSaveSoul = (updatedSoul: StoredSoul) => {
    // After saving, redirect back to where user came from
    router.push(getReturnUrl())
  }

  const handleCancel = () => {
    router.push(getReturnUrl())
  }

  const handleBack = () => {
    router.push(getReturnUrl())
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-xl text-purple-300 mb-6">Soul not found</p>
        <Button
          onClick={() => router.push("/souls")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Back to Souls
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="border-purple-500/30 hover:bg-purple-900/20"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Edit Soul: {soul.data.soulName}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        <SoulEditor soul={soul} onSave={handleSaveSoul} onCancel={handleCancel} />
      </div>
    </div>
  )
}
