"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  MessageCircle, 
  User, 
  Brain, 
  Settings, 
  MoreVertical,
  Edit,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  StickyNote,
  Archive
} from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getOpenSeaNftLink } from "@/lib/api"
import type { StoredSoul } from "@/lib/storage-wrapper"

interface UnifiedSoulHeaderProps {
  soul: StoredSoul
  onEdit?: () => void // Deprecated - header handles edit navigation directly now
  onExport?: () => void
  onDelete?: () => void
  onAddContext?: () => void
  onArchive?: () => void
  onSettings?: () => void
  contextProviderComponent?: React.ReactNode // For rendering the context provider component
}

export function UnifiedSoulHeader({
  soul,
  onEdit,
  onExport,
  onDelete,
  onAddContext,
  onArchive,
  onSettings,
  contextProviderComponent
}: UnifiedSoulHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const baseId = soul.data.pfpId
  const basePath = `/agent/${baseId}`
  
  // Determine current page for active tab styling
  const currentPage = pathname === basePath ? 'chat' :
                     pathname.includes('/profile') ? 'profile' :
                     pathname.includes('/personality') ? 'personality' :
                     pathname.includes('/memory') ? 'memory' :
                     pathname.includes('/context-notes') ? 'context-notes' :
                     pathname.includes('/archives') ? 'archives' :
                     'chat'

  const openSeaLink = getOpenSeaNftLink(soul.data.pfpId)

  const handleNavigation = (page: string) => {
    switch (page) {
      case 'chat':
        router.push(basePath)
        break
      case 'profile':
        router.push(`${basePath}/profile`)
        break
      case 'personality':
        router.push(`${basePath}/personality`)
        break  
      case 'memory':
        router.push(`${basePath}/memory`)
        break
      case 'context-notes':
        router.push(`${basePath}/context-notes`)
        break
      case 'archives':
        router.push(`${basePath}/archives`)
        break
    }
  }

  return (
    <div className="border-b border-purple-500/30 bg-black/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and character info */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="border-purple-500/30 hover:bg-purple-900/20"
              onClick={() => router.push("/souls")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-purple-500/30">
                <Image
                  src={soul.data.imageUrl || `/placeholder.svg?height=48&width=48&query=0N1 Force #${soul.data.pfpId}`}
                  alt={`0N1 Force #${soul.data.pfpId}`}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  {soul.data.soulName}
                </h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>0N1 Force #{soul.data.pfpId}</span>
                  <span className="mx-2">•</span>
                  <a 
                    href={openSeaLink}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-purple-300 inline-flex items-center"
                  >
                    OpenSea <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Primary action and menu */}
          <div className="flex items-center space-x-3">
            {/* Add Context Button - Now prominent */}
            {(onAddContext || contextProviderComponent) && (
              <div className="flex items-center">
                {contextProviderComponent ? (
                  contextProviderComponent
                ) : (
                  <Button
                    onClick={onAddContext}
                    variant="outline"
                    className="border-purple-500/30 hover:bg-purple-900/20 text-purple-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Context
                  </Button>
                )}
              </div>
            )}

            {/* Edit Soul Button - Now prominent */}
            <Button
              onClick={() => {
                // Pass current page as return URL when editing
                const currentPath = window.location.pathname
                const editUrl = `/souls/edit/${soul.data.pfpId}?returnTo=${encodeURIComponent(currentPath)}`
                router.push(editUrl)
              }}
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-900/20 text-purple-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Soul
            </Button>

            {/* Main Soul Chat Button - Primary action */}
            <Button
              onClick={() => handleNavigation('chat')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Soul Chat
            </Button>

            {/* Actions Menu - Now contains fewer items, Archive removed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-purple-500/30 hover:bg-purple-900/20"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-black/90 border-purple-500/30">
                {onExport && (
                  <DropdownMenuItem onClick={onExport} className="text-purple-200 hover:bg-purple-900/50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                )}
                
                {onSettings && (
                  <DropdownMenuItem onClick={onSettings} className="text-purple-200 hover:bg-purple-900/50">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                
                {onDelete && (
                  <>
                    <DropdownMenuSeparator className="bg-purple-500/20" />
                    <DropdownMenuItem onClick={onDelete} className="text-red-300 hover:bg-red-900/50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Soul
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tab Navigation - Updated order: Profile, Personality, Chat, Context & Notes, Archives */}
        <div className="mt-4 border-b border-purple-500/20">
          <nav className="flex space-x-6">
            <button
              onClick={() => handleNavigation('profile')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'profile'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-purple-300 hover:border-purple-500/50'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            
            <button
              onClick={() => handleNavigation('personality')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'personality'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-purple-300 hover:border-purple-500/50'
              }`}
            >
              <Brain className="h-4 w-4 mr-2" />
              Personality
            </button>
            
            <button
              onClick={() => handleNavigation('chat')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'chat'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-purple-300 hover:border-purple-500/50'
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </button>
            
            <button
              onClick={() => handleNavigation('context-notes')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'context-notes'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-purple-300 hover:border-purple-500/50'
              }`}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Context & Notes
            </button>
            
            <button
              onClick={() => handleNavigation('archives')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'archives'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-purple-300 hover:border-purple-500/50'
              }`}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archives
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
} 