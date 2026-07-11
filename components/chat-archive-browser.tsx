"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Archive, 
  Search, 
  Clock, 
  MessageCircle, 
  Star, 
  Play, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Filter,
  Calendar,
  User,
  Bot,
  TrendingUp
} from "lucide-react"
import { 
  getArchivedChats, 
  searchArchivedChats, 
  deleteArchivedChat, 
  updateChatTitle,
  type ArchivedChat 
} from "@/lib/chat-archive"

interface ChatArchiveBrowserProps {
  isOpen: boolean
  onClose: () => void
  onRestoreChat: (chat: ArchivedChat) => void
  currentCharacterId?: string
}

interface FilterState {
  character: string
  dateRange: "all" | "week" | "month" | "3months"
  minMessages: number
  sortBy: "recent" | "oldest" | "messages" | "duration"
}

export function ChatArchiveBrowser({ isOpen, onClose, onRestoreChat, currentCharacterId }: ChatArchiveBrowserProps) {
  const [chats, setChats] = useState<ArchivedChat[]>([])
  const [filteredChats, setFilteredChats] = useState<ArchivedChat[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChat, setSelectedChat] = useState<ArchivedChat | null>(null)
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    character: "all",
    dateRange: "all",
    minMessages: 0,
    sortBy: "recent"
  })

  // Load chats on mount
  useEffect(() => {
    if (isOpen) {
      loadChats()
    }
  }, [isOpen])

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch()
  }, [chats, searchQuery, filters])

  const loadChats = () => {
    const archivedChats = getArchivedChats()
    setChats(archivedChats)
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...chats]

    // Apply search
    if (searchQuery.trim()) {
      filtered = searchArchivedChats(searchQuery)
    }

    // Apply character filter
    if (filters.character !== "all") {
      filtered = filtered.filter(chat => chat.characterId === filters.character)
    }

    // Apply date range filter
    const now = new Date()
    switch (filters.dateRange) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(chat => chat.createdAt >= weekAgo)
        break
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(chat => chat.createdAt >= monthAgo)
        break
      case "3months":
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(chat => chat.createdAt >= threeMonthsAgo)
        break
    }

    // Apply minimum messages filter
    if (filters.minMessages > 0) {
      filtered = filtered.filter(chat => chat.messageCount >= filters.minMessages)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "recent":
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case "oldest":
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case "messages":
        filtered.sort((a, b) => b.messageCount - a.messageCount)
        break
      case "duration":
        filtered.sort((a, b) => b.conversationDuration - a.conversationDuration)
        break
    }

    setFilteredChats(filtered)
  }

  const handleRestoreChat = (chat: ArchivedChat) => {
    onRestoreChat(chat)
    onClose()
  }

  const handleEditTitle = (chatId: string, currentTitle: string) => {
    setEditingTitleId(chatId)
    setEditTitle(currentTitle)
  }

  const handleSaveTitle = () => {
    if (editingTitleId && editTitle.trim()) {
      const success = updateChatTitle(editingTitleId, editTitle.trim())
      if (success) {
        loadChats() // Reload to show updated title
      }
    }
    setEditingTitleId(null)
    setEditTitle("")
  }

  const handleDeleteChat = (chatId: string) => {
    const success = deleteArchivedChat(chatId)
    if (success) {
      loadChats() // Reload to show updated list
    }
    setDeleteConfirmId(null)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return "< 1 min"
    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}m`
  }

  const getUniqueCharacters = () => {
    const characters = new Set(chats.map(chat => ({ id: chat.characterId, name: chat.characterName })))
    return Array.from(characters)
  }

  const getStatistics = () => {
    return {
      totalChats: chats.length,
      totalMessages: chats.reduce((sum, chat) => sum + chat.messageCount, 0),
      totalDuration: chats.reduce((sum, chat) => sum + chat.conversationDuration, 0),
      averageEngagement: chats.reduce((sum, chat) => sum + (chat.metadata.userEngagementScore || 0), 0) / Math.max(chats.length, 1)
    }
  }

  const stats = getStatistics()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-purple-500/30 bg-black/90 backdrop-blur-sm max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-purple-300 flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Chat Archive
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[80vh]">
          {/* Statistics Bar */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="bg-purple-950/30 border-purple-500/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-300">{stats.totalChats}</div>
                <div className="text-xs text-muted-foreground">Total Chats</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-950/30 border-purple-500/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-300">{stats.totalMessages}</div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-950/30 border-purple-500/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-300">{formatDuration(stats.totalDuration)}</div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-950/30 border-purple-500/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-300">{stats.averageEngagement.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Engagement</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats by title, content, or character..."
                className="pl-10 bg-black/40 border-purple-500/30"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-purple-500/30 text-purple-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-4 bg-purple-950/20 border-purple-500/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-purple-300 mb-1 block">Character</label>
                    <select
                      value={filters.character}
                      onChange={(e) => setFilters({ ...filters, character: e.target.value })}
                      className="w-full p-2 rounded bg-black/40 border border-purple-500/30 text-white"
                    >
                      <option value="all">All Characters</option>
                      {getUniqueCharacters().map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-purple-300 mb-1 block">Date Range</label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                      className="w-full p-2 rounded bg-black/40 border border-purple-500/30 text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="3months">Last 3 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-purple-300 mb-1 block">Min Messages</label>
                    <Input
                      type="number"
                      value={filters.minMessages}
                      onChange={(e) => setFilters({ ...filters, minMessages: parseInt(e.target.value) || 0 })}
                      className="bg-black/40 border-purple-500/30"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-purple-300 mb-1 block">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                      className="w-full p-2 rounded bg-black/40 border border-purple-500/30 text-white"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="messages">Most Messages</option>
                      <option value="duration">Longest Duration</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat List */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
            {/* Chat List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-purple-300 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Archived Chats ({filteredChats.length})
              </h3>
              <ScrollArea className="h-full pr-4">
                <div className="space-y-2">
                  {filteredChats.map((chat) => (
                    <Card
                      key={chat.id}
                      className={`cursor-pointer transition-all border ${
                        selectedChat?.id === chat.id
                          ? "border-purple-500 bg-purple-900/30"
                          : "border-purple-500/20 bg-purple-950/20 hover:bg-purple-950/40"
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            {editingTitleId === chat.id ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveTitle()
                                    if (e.key === "Escape") setEditingTitleId(null)
                                  }}
                                  className="flex-1 h-6 text-sm bg-black/40 border-purple-500/30"
                                  autoFocus
                                />
                                <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                                  ✓
                                </Button>
                              </div>
                            ) : (
                              <h4 className="font-medium text-white truncate">{chat.title}</h4>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-black/90 border-purple-500/30">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRestoreChat(chat)
                                }}
                                className="text-purple-200 hover:bg-purple-900/50"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Restore Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTitle(chat.id, chat.title)
                                }}
                                className="text-purple-200 hover:bg-purple-900/50"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Title
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirmId(chat.id)
                                }}
                                className="text-red-400 hover:bg-red-900/50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Badge variant="outline" className="text-xs">
                            {chat.characterName}
                          </Badge>
                          <Clock className="h-3 w-3" />
                          {formatDate(chat.createdAt)}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {chat.summary}
                        </p>

                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {chat.messageCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(chat.conversationDuration)}
                            </span>
                            {chat.memorySegmentCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {chat.memorySegmentCount}
                              </span>
                            )}
                          </div>
                          {chat.metadata.userEngagementScore && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {chat.metadata.userEngagementScore.toFixed(1)}
                            </div>
                          )}
                        </div>

                        {chat.keyTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {chat.keyTopics.slice(0, 3).map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-xs bg-purple-900/30">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredChats.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No archived chats found</p>
                      {searchQuery && <p className="text-sm mt-1">Try adjusting your search or filters</p>}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Preview */}
            <div className="border-l border-purple-500/20 pl-4">
              {selectedChat ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-purple-300">{selectedChat.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.characterName} • {formatDate(selectedChat.createdAt)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRestoreChat(selectedChat)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Restore Chat
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-purple-950/20 rounded">
                      <div className="font-semibold text-purple-300">{selectedChat.messageCount}</div>
                      <div className="text-xs text-muted-foreground">Messages</div>
                    </div>
                    <div className="text-center p-2 bg-purple-950/20 rounded">
                      <div className="font-semibold text-purple-300">{formatDuration(selectedChat.conversationDuration)}</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{selectedChat.summary}</p>
                  </div>

                  {selectedChat.keyTopics.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-purple-300 mb-2">Topics</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedChat.keyTopics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs bg-purple-900/30">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Message Preview</h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {selectedChat.messages.slice(0, 10).map((message) => (
                          <div key={message.id} className={`p-2 rounded text-sm ${
                            message.role === "user" ? "bg-blue-900/20 ml-4" : "bg-purple-900/20 mr-4"
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              {message.role === "user" ? (
                                <User className="h-3 w-3" />
                              ) : (
                                <Bot className="h-3 w-3" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {message.role === "user" ? "You" : selectedChat.characterName}
                              </span>
                            </div>
                            <p className="line-clamp-2">{message.content}</p>
                          </div>
                        ))}
                        {selectedChat.messages.length > 10 && (
                          <p className="text-xs text-center text-muted-foreground py-2">
                            ... and {selectedChat.messages.length - 10} more messages
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a chat to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent className="bg-black/90 border-purple-500/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-purple-300">Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chat? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-purple-500/30">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmId && handleDeleteChat(deleteConfirmId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
} 