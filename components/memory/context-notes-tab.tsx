"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  StickyNote, 
  Plus, 
  Trash2,
  Edit3,
  Save,
  X,
  FileText,
  Lightbulb,
  MapPin,
  Target,
  Calendar,
  Search,
  Pin,
  PinOff,
  Tag,
  Hash,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react"
import type { 
  MemoryTabProps, 
  ContextEntry
} from "@/lib/memory-types"
import {
  addContextEntry,
  getAllTags,
  getEntriesByTag,
  getEntriesByType,
  pinTag,
  unpinTag
} from "@/lib/memory-types"

export function ContextNotesTab({ memoryProfile, onUpdate, isEditing }: MemoryTabProps) {
  const { contextNotes } = memoryProfile
  const [activeView, setActiveView] = useState<"all" | "session" | "plot" | "note" | "world" | "context">("context")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<ContextEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTagManager, setShowTagManager] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  
  const ITEMS_PER_PAGE = 20
  
  // Form state for new/edited entries
  const [entryForm, setEntryForm] = useState({
    type: "context" as ContextEntry['type'],
    title: "",
    content: "",
    tags: [] as string[],
    customTags: [] as string[],
    importance: 5,
    // Type-specific data
    sessionData: { importance: 5 },
    plotData: { status: "active" as "active" | "completed" | "shelved", priority: 5 },
    noteData: { category: "general" as "general" | "reminder" | "insight" | "plan" | "observation" },
    worldData: { type: "location" as "location" | "organization" | "event" | "custom", name: "", connections: [] as string[] }
  })
  
  const [tagInput, setTagInput] = useState("")

  // Get all tags and organize them
  const allTags = getAllTags(memoryProfile)
  const pinnedTags = contextNotes.tagManagement.pinnedTags
  const customTags = contextNotes.tagManagement.customTags
  
  // Organize tags for display
  const organizedTags = {
    pinned: allTags.filter(tag => pinnedTags.includes(tag)),
    popular: customTags
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map(t => t.name)
      .filter(tag => !pinnedTags.includes(tag)),
    recent: customTags
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 10)
      .map(t => t.name)
      .filter(tag => !pinnedTags.includes(tag)),
    all: allTags.filter(tag => !pinnedTags.includes(tag))
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Never"
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      if (isNaN(dateObj.getTime())) return "Invalid date"
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !entryForm.customTags.includes(trimmedTag) && !entryForm.tags.includes(trimmedTag)) {
      if (allTags.includes(trimmedTag)) {
        setEntryForm(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }))
      } else {
        setEntryForm(prev => ({ ...prev, customTags: [...prev.customTags, trimmedTag] }))
      }
    }
    setTagInput("")
  }

  const handleRemoveTag = (tag: string, isCustom: boolean) => {
    if (isCustom) {
      setEntryForm(prev => ({ ...prev, customTags: prev.customTags.filter(t => t !== tag) }))
    } else {
      setEntryForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    }
  }

  const handleSaveEntry = () => {
    if (!entryForm.content.trim()) return

    const entry: Omit<ContextEntry, 'id' | 'date'> = {
      type: entryForm.type,
      title: entryForm.title.trim() || undefined,
      content: entryForm.content.trim(),
      tags: entryForm.tags,
      customTags: entryForm.customTags,
      importance: entryForm.importance,
      ...getTypeSpecificData()
    }

    if (editingEntry && editingEntry.id && editingEntry.id !== "") {
      // Update existing entry
      const updatedEntries = contextNotes.contextEntries.map(e => 
        e.id === editingEntry.id 
          ? { ...entry, id: editingEntry.id, date: editingEntry.date }
          : e
      )
      
      onUpdate({
        contextNotes: {
          ...contextNotes,
          contextEntries: updatedEntries
        }
      })
    } else {
      // Add new entry using the utility function
      const updatedProfile = addContextEntry(memoryProfile, entry)
      onUpdate({
        contextNotes: updatedProfile.contextNotes,
        metadata: updatedProfile.metadata
      })
    }

    resetForm()
  }

  const getTypeSpecificData = () => {
    switch (entryForm.type) {
      case "session":
        return { sessionData: entryForm.sessionData }
      case "plot":
        return { plotData: entryForm.plotData }
      case "note":
        return { noteData: entryForm.noteData }
      case "world":
        return { worldData: entryForm.worldData }
      default:
        return {}
    }
  }

  const resetForm = () => {
    setEntryForm({
      type: "context",
      title: "",
      content: "",
      tags: [],
      customTags: [],
      importance: 5,
      sessionData: { importance: 5 },
      plotData: { status: "active", priority: 5 },
      noteData: { category: "general" },
      worldData: { type: "location", name: "", connections: [] }
    })
    setEditingEntry(null)
    setTagInput("")
  }

  const handleEditEntry = (entry: ContextEntry) => {
    setEntryForm({
      type: entry.type,
      title: entry.title || "",
      content: entry.content,
      tags: entry.tags,
      customTags: entry.customTags,
      importance: entry.importance || 5,
      sessionData: entry.sessionData || { importance: 5 },
      plotData: entry.plotData || { status: "active", priority: 5 },
      noteData: entry.noteData || { category: "general" },
      worldData: entry.worldData || { type: "location", name: "", connections: [] }
    })
    setEditingEntry(entry)
  }

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = contextNotes.contextEntries.filter(e => e.id !== entryId)
    onUpdate({
      contextNotes: {
        ...contextNotes,
        contextEntries: updatedEntries
      }
    })
  }

  const handlePinTag = (tag: string) => {
    const updatedProfile = pinTag(memoryProfile, tag)
    onUpdate({
      contextNotes: updatedProfile.contextNotes
    })
  }

  const handleUnpinTag = (tag: string) => {
    const updatedProfile = unpinTag(memoryProfile, tag)
    onUpdate({
      contextNotes: updatedProfile.contextNotes
    })
  }

  // Filter and search entries
  const getFilteredEntries = () => {
    let entries = [...contextNotes.contextEntries]

    // Filter by type
    if (activeView !== "all") {
      entries = getEntriesByType(memoryProfile, activeView)
    }

    // Filter by selected tag
    if (selectedTag) {
      entries = getEntriesByTag(memoryProfile, selectedTag)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      entries = entries.filter(entry => 
        entry.content.toLowerCase().includes(query) ||
        entry.title?.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query)) ||
        entry.customTags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const filteredEntries = getFilteredEntries()
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getEntryIcon = (type: ContextEntry['type']) => {
    switch (type) {
      case "session": return <Calendar className="h-4 w-4" />
      case "plot": return <Target className="h-4 w-4" />
      case "note": return <StickyNote className="h-4 w-4" />
      case "world": return <MapPin className="h-4 w-4" />
      case "context": return <Lightbulb className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getEntryTypeColor = (type: ContextEntry['type']) => {
    switch (type) {
      case "session": return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      case "plot": return "bg-green-500/20 text-green-300 border-green-500/50"
      case "note": return "bg-purple-500/20 text-purple-300 border-purple-500/50"
      case "world": return "bg-orange-500/20 text-orange-300 border-orange-500/50"
      case "context": return "bg-pink-500/20 text-pink-300 border-pink-500/50"
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {selectedTag && (
              <Badge 
                variant="outline" 
                className="bg-purple-500/20 border-purple-500/50 cursor-pointer"
                onClick={() => setSelectedTag(null)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {selectedTag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {activeView !== "all" && (
              <Badge 
                variant="outline"
                className="bg-blue-500/20 border-blue-500/50 cursor-pointer"
                onClick={() => setActiveView("all")}
              >
                Type: {activeView}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTagManager(!showTagManager)}
          >
            <Tag className="h-4 w-4 mr-2" />
            Tags
          </Button>
          <Button onClick={() => setEditingEntry({ id: "", date: new Date() } as ContextEntry)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Tag Manager Panel */}
      {showTagManager && (
        <Card className="border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tag Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pinned Tags */}
            {organizedTags.pinned.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned Tags ({organizedTags.pinned.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {organizedTags.pinned.map(tag => (
                    <div key={tag} className="flex items-center gap-1">
                      <Badge
                        variant="default"
                        className="bg-purple-600 cursor-pointer"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleUnpinTag(tag)}
                      >
                        <PinOff className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {organizedTags.popular.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Most Used Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {organizedTags.popular.map(tag => {
                    const tagData = customTags.find(t => t.name === tag)
                    return (
                      <div key={tag} className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-500/20"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag} ({tagData?.usageCount || 0})
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handlePinTag(tag)}
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Tags */}
            {organizedTags.all.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">All Tags</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {organizedTags.all.slice(0, 50).map(tag => (
                    <div key={tag} className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handlePinTag(tag)}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Type Filter Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({contextNotes.contextEntries.length})</TabsTrigger>
          <TabsTrigger value="context">Context ({getEntriesByType(memoryProfile, "context").length})</TabsTrigger>
          <TabsTrigger value="session">Session ({getEntriesByType(memoryProfile, "session").length})</TabsTrigger>
          <TabsTrigger value="plot">Plot ({getEntriesByType(memoryProfile, "plot").length})</TabsTrigger>
          <TabsTrigger value="note">Notes ({getEntriesByType(memoryProfile, "note").length})</TabsTrigger>
          <TabsTrigger value="world">World ({getEntriesByType(memoryProfile, "world").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Add/Edit Entry Form */}
      {editingEntry && (
        <Card className="border-green-500/30">
          <CardHeader>
            <CardTitle>{editingEntry.id && editingEntry.id !== "" ? "Edit Entry" : "Add New Entry"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={entryForm.type} 
                  onValueChange={(value) => setEntryForm(prev => ({ ...prev, type: value as ContextEntry['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="context">Context (from chat)</SelectItem>
                    <SelectItem value="session">Session Note</SelectItem>
                    <SelectItem value="plot">Plot Hook</SelectItem>
                    <SelectItem value="note">Freeform Note</SelectItem>
                    <SelectItem value="world">World Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Importance</label>
                <Select 
                  value={entryForm.importance.toString()} 
                  onValueChange={(value) => setEntryForm(prev => ({ ...prev, importance: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} - {num >= 8 ? "Critical" : num >= 5 ? "Important" : "Normal"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {entryForm.type !== "note" && (
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={entryForm.title}
                  onChange={(e) => setEntryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Entry title..."
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={entryForm.content}
                onChange={(e) => setEntryForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your content..."
                rows={4}
              />
            </div>

            {/* Type-specific fields */}
            {entryForm.type === "plot" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={entryForm.plotData.status} 
                    onValueChange={(value) => setEntryForm(prev => ({ 
                      ...prev, 
                      plotData: { ...prev.plotData, status: value as "active" | "completed" | "shelved" } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="shelved">Shelved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={entryForm.plotData.priority.toString()} 
                    onValueChange={(value) => setEntryForm(prev => ({ 
                      ...prev, 
                      plotData: { ...prev.plotData, priority: parseInt(value) } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} - {num >= 8 ? "Critical" : num >= 5 ? "Important" : "Normal"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {entryForm.type === "note" && (
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={entryForm.noteData.category} 
                  onValueChange={(value) => setEntryForm(prev => ({ 
                    ...prev, 
                    noteData: { ...prev.noteData, category: value as "general" | "reminder" | "insight" | "plan" | "observation" } 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="insight">Insight</SelectItem>
                    <SelectItem value="plan">Plan</SelectItem>
                    <SelectItem value="observation">Observation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {entryForm.type === "world" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={entryForm.worldData.type} 
                    onValueChange={(value) => setEntryForm(prev => ({ 
                      ...prev, 
                      worldData: { ...prev.worldData, type: value as "location" | "organization" | "event" | "custom" } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={entryForm.worldData.name}
                    onChange={(e) => setEntryForm(prev => ({ 
                      ...prev, 
                      worldData: { ...prev.worldData, name: e.target.value } 
                    }))}
                    placeholder="World element name..."
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              
              {/* Quick tag selection */}
              <div className="flex flex-wrap gap-1 mb-2">
                {pinnedTags.slice(0, 8).map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleAddTag(tag)}
                  >
                    <Pin className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>

              {/* Custom tag input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      if (tagInput.trim()) handleAddTag(tagInput)
                    }
                  }}
                />
                {tagInput.trim() && (
                  <Button onClick={() => handleAddTag(tagInput)}>
                    Add
                  </Button>
                )}
              </div>

              {/* Selected tags */}
              {(entryForm.tags.length > 0 || entryForm.customTags.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {entryForm.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag, false)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {entryForm.customTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag, true)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEntry}>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedEntries.length} of {filteredEntries.length} entries
          </p>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm flex items-center px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {paginatedEntries.length === 0 ? (
          <Card className="border-dashed border-muted-foreground/30">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No entries found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedTag || activeView !== "all" 
                  ? "Try adjusting your filters or search terms"
                  : "Start by adding your first context entry"
                }
              </p>
              {!searchQuery && !selectedTag && activeView === "all" && (
                <Button onClick={() => setEditingEntry({ id: "", date: new Date() } as ContextEntry)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paginatedEntries.map((entry) => (
              <Card key={entry.id} className="border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getEntryTypeColor(entry.type)}>
                          {getEntryIcon(entry.type)}
                          <span className="ml-1 capitalize">{entry.type}</span>
                        </Badge>
                        
                        {entry.title && (
                          <h4 className="font-semibold text-foreground">{entry.title}</h4>
                        )}
                        
                        {entry.importance && entry.importance > 7 && (
                          <Badge variant="destructive">High Priority</Badge>
                        )}
                        
                        {/* Type-specific badges */}
                        {entry.plotData && (
                          <Badge 
                            variant="outline" 
                            className={`${entry.plotData.status === 'active' ? 'border-green-500/50 text-green-300' : 
                                       entry.plotData.status === 'completed' ? 'border-blue-500/50 text-blue-300' : 
                                       'border-gray-500/50 text-gray-300'}`}
                          >
                            {entry.plotData.status}
                          </Badge>
                        )}
                        
                        {entry.noteData && (
                          <Badge variant="outline">
                            {entry.noteData.category}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {entry.content}
                      </p>

                      {/* Tags */}
                      {(entry.tags.length > 0 || entry.customTags.length > 0) && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-purple-500/20"
                              onClick={() => setSelectedTag(tag)}
                            >
                              <Hash className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {entry.customTags.map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-purple-500/20"
                              onClick={() => setSelectedTag(tag)}
                            >
                              <Hash className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.date)}
                        </span>
                        {entry.importance && (
                          <span>Importance: {entry.importance}/10</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
