"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  MessageSquare, 
  ChevronUp, 
  ChevronDown,
  BarChart3,
  User,
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
import { verifyNftOwnership, createOwnershipError } from "@/lib/ownership"
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

// Import tab components (we'll create these next)
import { OverviewTab } from "@/components/memory/overview-tab"
import { CharacterProfileTab } from "@/components/memory/character-profile-tab"
import { ContextNotesTab } from "@/components/memory/context-notes-tab"
import { FloatingChat } from "@/components/memory/floating-chat"
import { UnifiedSoulHeader } from "@/components/unified-soul-header"

export default function MemoryPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useWallet()
  
  const [soul, setSoul] = useState<StoredSoul | null>(null)
  const [memoryProfile, setMemoryProfile] = useState<CharacterMemoryProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [ownershipVerified, setOwnershipVerified] = useState<boolean | null>(null)

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

        // Wallet connection and ownership verification
        if (!isConnected || !address) {
          router.push("/?connect=true")
          return
        }

        // Verify NFT ownership
        try {
          const owns = await verifyNftOwnership(address, nftId)
          setOwnershipVerified(owns)
          
          if (!owns) {
            setError(createOwnershipError(nftId))
            return
          }
        } catch (error) {
          console.error("Ownership verification failed:", error)
          setOwnershipVerified(false)
          setError("Unable to verify NFT ownership. Please try again.")
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
          <p className="text-purple-300">Loading character memory...</p>
        </div>
      </div>
    )
  }

  // Ownership verification check
  if (ownershipVerified === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-red-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center">
              <span className="text-red-400 text-2xl">🔒</span>
            </div>
            <p className="text-xl text-red-300 mb-4">Access Denied</p>
            <p className="text-muted-foreground mb-6 max-w-md">
              You don't own 0N1 Force #{params.id}. You can only access characters you own.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/souls")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Back to Your Souls
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/?connect=true")}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
              >
                Connect Different Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !soul || !memoryProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-xl text-red-300">{error || "Memory data not found"}</p>
          <Button
            onClick={() => router.push("/souls")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Back to Souls
          </Button>
        </div>
      </div>
    )
  }

  const handleCustomExport = () => {
    handleExportProfile()
  }

  const handleImportClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <UnifiedSoulHeader 
        soul={soul}
        onExport={handleCustomExport}
      />

      {/* Hidden file input for import */}
      <input
        type="file"
        accept=".json"
        onChange={handleImportProfile}
        className="hidden"
      />

      {/* Memory-specific toolbar */}
      <div className="border-b border-purple-500/20 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-purple-300">Memory Profile</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/20 text-xs"
                onClick={handleImportClick}
              >
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/20 text-xs"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {showChat ? "Hide Chat" : "Chat"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/20 text-xs"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="h-3 w-3 mr-1" />
                {isEditing ? "View" : "Edit"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60 border border-purple-500/30">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-purple-400 data-[state=active]:text-purple-300 hover:text-purple-300">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="character" className="flex items-center gap-2 text-purple-400 data-[state=active]:text-purple-300 hover:text-purple-300">
              <User className="h-4 w-4" />
              Character Profile
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2 text-purple-400 data-[state=active]:text-purple-300 hover:text-purple-300">
              <StickyNote className="h-4 w-4" />
              Context & Notes
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab
                memoryProfile={memoryProfile}
                onUpdate={handleUpdateMemoryProfile}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            </TabsContent>

            <TabsContent value="character" className="mt-0">
              <CharacterProfileTab
                memoryProfile={memoryProfile}
                onUpdate={handleUpdateMemoryProfile}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <ContextNotesTab
                memoryProfile={memoryProfile}
                onUpdate={handleUpdateMemoryProfile}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Floating Chat */}
      {showChat && soul && memoryProfile && (
        <FloatingChat
          soul={soul}
          memoryProfile={memoryProfile}
          onClose={() => setShowChat(false)}
          onUpdateMemory={handleUpdateMemoryProfile}
        />
      )}
    </div>
  )
} 