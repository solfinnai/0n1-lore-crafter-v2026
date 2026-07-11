"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Archive, 
  Download,
  Upload,
  Calendar,
  MessageSquare,
  Settings,
  Trash2,
  FileText,
  Search,
  Filter,
  Clock,
  User
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
import { 
  getArchivedChats, 
  deleteArchivedChat, 
  updateChatTitle,
  type ArchivedChat 
} from "@/lib/chat-archive"

import { UnifiedSoulHeader } from "@/components/unified-soul-header"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ArchivePage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useWallet()
  
  const [soul, setSoul] = useState<StoredSoul | null>(null)
  const [memoryProfile, setMemoryProfile] = useState<CharacterMemoryProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([])

  useEffect(() => {
    async function loadArchiveData() {
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
        if (!isConnected) {
          router.push("/?connect=true")
          return
        }

        // Get or create memory profile
        let profile = getMemoryProfile(nftId)
        
        if (!profile) {
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
          
          if (address) {
            profile.metadata.walletAddress = address
          }
          
          saveMemoryProfile(profile)
        }

        setMemoryProfile(profile)
        
        // Load archived chats for this character
        const allArchivedChats = getArchivedChats()
        const characterChats = allArchivedChats.filter(chat => chat.characterId === nftId)
        setArchivedChats(characterChats)
        
      } catch (err) {
        console.error("Error loading archive data:", err)
        setError("Failed to load archive data")
      } finally {
        setIsLoading(false)
      }
    }

    loadArchiveData()
  }, [params.id, isConnected, address, router])

  const handleExportArchive = () => {
    if (!memoryProfile) return
    
    const exportData = {
      profile: memoryProfile,
      archivedChats: archivedChats,
      exportDate: new Date(),
      version: "1.0"
    }
    
    const filename = `${soul?.data.soulName}_archive_${new Date().toISOString().split('T')[0]}.json`
    downloadJSON(JSON.stringify(exportData), filename)
  }

  const handleRestoreChat = (archivedChat: ArchivedChat) => {
    // Navigate to main chat page and restore the conversation
    router.push(`/agent/${archivedChat.characterId}?restore=${archivedChat.id}`)
  }

  const handleDeleteChat = (chatId: string) => {
    // Permanently delete an archived chat
    if (confirm("Are you sure you want to permanently delete this chat? This action cannot be undone.")) {
      const success = deleteArchivedChat(chatId)
      if (success) {
        // Reload archived chats
        const allArchivedChats = getArchivedChats()
        const characterChats = allArchivedChats.filter(chat => chat.characterId === params.id)
        setArchivedChats(characterChats)
      }
    }
  }

  const filteredChats = archivedChats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.summary.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || selectedType === "conversation"
    return matchesSearch && matchesType
  }).sort((a, b) => {
    switch (sortBy) {
      case "date":
        return b.sessionEnd.getTime() - a.sessionEnd.getTime()
      case "title":
        return a.title.localeCompare(b.title)
      case "type":
        return 0 // All chats are conversations
      default:
        return 0
    }
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="h-4 w-4" />
      case "memory":
        return <Clock className="h-4 w-4" />
      case "context":
        return <FileText className="h-4 w-4" />
      default:
        return <Archive className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conversation":
        return "bg-blue-500/20 text-blue-400"
      case "memory":
        return "bg-purple-500/20 text-purple-400"
      case "context":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-300">Loading archives...</p>
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
        onExport={handleExportArchive}
        onSettings={() => {}}
        onDelete={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Archive className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Archives
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage archived conversations, memories, and data for {soul.data.soulName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/20"
                onClick={handleExportArchive}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-purple-500/30 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32 border-purple-500/30">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="conversation">Conversations</SelectItem>
                <SelectItem value="memory">Memories</SelectItem>
                <SelectItem value="context">Context</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 border-purple-500/30">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Archive Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Chats</p>
                  <p className="text-2xl font-bold text-purple-400">{archivedChats.length}</p>
                </div>
                <Archive className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {archivedChats.reduce((sum, chat) => sum + chat.messageCount, 0)}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Duration</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {Math.round(archivedChats.reduce((sum, chat) => sum + chat.conversationDuration, 0))}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Length</p>
                  <p className="text-2xl font-bold text-green-400">
                    {archivedChats.length > 0 ? Math.round(archivedChats.reduce((sum, chat) => sum + chat.messageCount, 0) / archivedChats.length) : 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Archived Chats List */}
        <div className="space-y-4">
          {filteredChats.length === 0 ? (
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-8 text-center">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No archived chats found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedType !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "Archived conversations will appear here when you start new chats."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredChats.map((chat) => (
              <Card key={chat.id} className="bg-black/40 border-purple-500/30 hover:border-purple-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500/20 text-blue-400 border-0">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>Conversation</span>
                          </div>
                        </Badge>
                        <span className="text-sm text-muted-foreground">{chat.messageCount} messages</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{Math.round(chat.conversationDuration)}m</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{chat.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{chat.summary}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Archived {chat.sessionEnd.toLocaleDateString()}</span>
                        </div>
                        {chat.keyTopics.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>Topics:</span>
                            <span className="text-purple-400">{chat.keyTopics.slice(0, 2).join(", ")}</span>
                            {chat.keyTopics.length > 2 && <span>+{chat.keyTopics.length - 2} more</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500/30 hover:bg-green-900/20 text-green-400"
                        onClick={() => handleRestoreChat(chat)}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 hover:bg-red-900/20 text-red-400"
                        onClick={() => handleDeleteChat(chat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 