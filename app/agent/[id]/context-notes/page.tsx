"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  MessageSquare, 
  StickyNote,
  Settings,
  Download,
  Upload,
  Search
} from "lucide-react"
import Image from "next/image"
import { getSoulByNftId, type StoredSoul } from "@/lib/storage-wrapper"
import { getCharacterMemories, saveCharacterMemories, createCharacterMemory } from "@/lib/memory"
import { upgradeToEnhancedMemory } from "@/lib/memory-enhanced"
import { useWallet } from "@/components/wallet/wallet-provider"
import { 
  getMemoryProfile, 
  saveMemoryProfile, 
  createDefaultMemoryProfile,
  type CharacterMemoryProfile 
} from "@/lib/memory-types"
import { 
  exportSingleProfile, 
  downloadJSON, 
  generateExportFilename,
  parseImportData,
  validateProfile
} from "@/lib/memory-export"

// Import tab components
import { ContextNotesTab } from "@/components/memory/context-notes-tab"
import { FloatingChat } from "@/components/memory/floating-chat"
import { UnifiedSoulHeader } from "@/components/unified-soul-header"

export default function ContextNotesPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useWallet()
  
  const [soul, setSoul] = useState<StoredSoul | null>(null)
  const [memoryProfile, setMemoryProfile] = useState<CharacterMemoryProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadMemoryData() {
      // Client-side only
      if (typeof window === 'undefined') return
      
      const nftId = params.id as string
      if (!nftId) {
        setError("No NFT ID provided")
        setIsLoading(false)
        return
      }

      try {
        // Get the soul data
        const foundSoul = getSoulByNftId(nftId)
        if (!foundSoul) {
          setError("Character soul not found")
          setIsLoading(false)
          return
        }

        setSoul(foundSoul)

        // TODO: Add wallet validation here
        // For now, we'll allow access but add validation later
        if (!isConnected) {
          // Redirect to login/wallet connection
          router.push("/?connect=true")
          return
        }

        // Get or create memory profile
        let profile = getMemoryProfile(nftId)
        
        if (!profile) {
          // Create new memory profile from existing data
          let conversationMemory = getCharacterMemories(nftId)
          if (!conversationMemory) {
            conversationMemory = createCharacterMemory(nftId, foundSoul.data.soulName)
          }
          
          const enhancedMemory = upgradeToEnhancedMemory(conversationMemory)
          
          profile = createDefaultMemoryProfile(
            nftId,
            foundSoul.data,
            conversationMemory,
            enhancedMemory
          )
          
          // Set wallet address if available
          if (address) {
            profile.metadata.walletAddress = address
          }
          
          saveMemoryProfile(profile)
        }

        setMemoryProfile(profile)
      } catch (err) {
        console.error("Error loading memory data:", err)
        setError("Failed to load memory data")
      } finally {
        setIsLoading(false)
      }
    }

    loadMemoryData()
  }, [params.id, isConnected, address, router])

  const handleUpdateMemoryProfile = (updates: Partial<CharacterMemoryProfile>) => {
    if (!memoryProfile) return

    const updatedProfile = {
      ...memoryProfile,
      ...updates,
      metadata: {
        ...memoryProfile.metadata,
        ...updates.metadata,
        lastUpdated: new Date()
      }
    }

    setMemoryProfile(updatedProfile)
    saveMemoryProfile(updatedProfile)
  }

  const handleExportProfile = () => {
    if (!memoryProfile) return
    
    const exportData = exportSingleProfile(memoryProfile)
    const filename = generateExportFilename(memoryProfile)
    downloadJSON(exportData, filename)
  }

  const handleImportProfile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = parseImportData(content)
        
        if (importData.profiles.length > 0) {
          const importedProfile = importData.profiles[0]
          
          if (validateProfile(importedProfile)) {
            // Update current profile with imported data
            handleUpdateMemoryProfile(importedProfile)
            alert('Profile imported successfully!')
          } else {
            alert('Invalid profile format')
          }
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('Failed to import profile: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
    
    reader.readAsText(file)
    // Reset input
    event.target.value = ''
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-300">Loading context & notes...</p>
        </div>
      </div>
    )
  }

  if (error || !soul || !memoryProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-red-300">{error || "Failed to load data"}</p>
          <Button 
            onClick={() => router.push("/souls")} 
            variant="outline"
            className="mt-4 border-purple-500/30 hover:bg-purple-900/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Souls
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedSoulHeader
        soul={soul}
        onExport={handleExportProfile}
        onSettings={() => {}}
        onDelete={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <StickyNote className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Context & Notes
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage contextual information, notes, and memories for {soul.data.soulName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/20"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/20"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/20"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'View Mode' : 'Edit'}
              </Button>
            </div>
          </div>
        </div>

        {/* Context & Notes Content */}
        <div className="space-y-6">
          <ContextNotesTab
            memoryProfile={memoryProfile}
            onUpdate={handleUpdateMemoryProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </div>

        {/* Hidden file input for import */}
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImportProfile}
          style={{ display: 'none' }}
        />

        {/* Floating Chat */}
        {showChat && (
          <FloatingChat
            soul={soul}
            memoryProfile={memoryProfile}
            onUpdateMemory={handleUpdateMemoryProfile}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  )
} 