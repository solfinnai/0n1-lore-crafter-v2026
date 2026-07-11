"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type EnhancedMemory, MemoryCategory } from "@/lib/memory-enhanced"
import type { CharacterData } from "@/lib/types"
import { Search, Clock, Star, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContextExplorerProps {
  memory: EnhancedMemory
  characterData: CharacterData
  onClose: () => void
}

export function ContextExplorer({ memory, characterData, onClose }: ContextExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"relevance" | "importance" | "recency">("relevance")

  // Filter and sort memories
  const filteredMemories = memory.contextualMemories
    .filter((mem) => {
      // Apply search filter
      if (searchTerm && !mem.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Apply category filter
      if (categoryFilter !== "all" && mem.category !== categoryFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "relevance") {
        return b.relevance - a.relevance
      } else if (sortBy === "importance") {
        return b.importance - a.importance
      } else {
        return b.recency - a.recency
      }
    })

  return (
    <Card className="w-full h-full border border-purple-500/30 bg-black/90 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Soul Memory Explorer</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-background/50 border-purple-500/30"
              />
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-background/50 border-purple-500/30">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value={MemoryCategory.PERSONAL}>Personal</SelectItem>
                    <SelectItem value={MemoryCategory.RELATIONSHIP}>Relationship</SelectItem>
                    <SelectItem value={MemoryCategory.EVENT}>Event</SelectItem>
                    <SelectItem value={MemoryCategory.PREFERENCE}>Preference</SelectItem>
                    <SelectItem value={MemoryCategory.FACT}>Fact</SelectItem>
                    <SelectItem value={MemoryCategory.EMOTIONAL}>Emotional</SelectItem>
                    <SelectItem value={MemoryCategory.NARRATIVE}>Narrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-48">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="bg-background/50 border-purple-500/30">
                    <div className="flex items-center">
                      {sortBy === "relevance" && <Star className="h-4 w-4 mr-2" />}
                      {sortBy === "importance" && <Star className="h-4 w-4 mr-2" />}
                      {sortBy === "recency" && <Clock className="h-4 w-4 mr-2" />}
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort by Relevance</SelectItem>
                    <SelectItem value="importance">Sort by Importance</SelectItem>
                    <SelectItem value="recency">Sort by Recency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Memory list */}
          <div className="border border-purple-500/30 rounded-md">
            <Tabs defaultValue="memories">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="memories">Memories</TabsTrigger>
                <TabsTrigger value="threads">Conversation Threads</TabsTrigger>
                <TabsTrigger value="profile">User Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="memories" className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-3">
                    {filteredMemories.length > 0 ? (
                      filteredMemories.map((mem) => (
                        <div key={mem.id} className="p-3 rounded bg-purple-900/20 border border-purple-500/30">
                          <div className="flex justify-between items-start mb-1">
                            <Badge variant="outline">{mem.category}</Badge>
                            <div className="flex space-x-2 text-xs">
                              <span className="text-purple-300">Importance: {mem.importance}/10</span>
                              <span className="text-blue-300">Relevance: {mem.relevance}/10</span>
                            </div>
                          </div>
                          <p className="text-sm">{mem.content}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {mem.relatedTopics.map((topic, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(mem.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No memories found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="threads" className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-3">
                    {Object.values(memory.conversationThreads).length > 0 ? (
                      Object.values(memory.conversationThreads)
                        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                        .map((thread) => (
                          <div key={thread.id} className="p-3 rounded bg-purple-900/20 border border-purple-500/30">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium">{thread.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {thread.messageIds.length} messages
                              </Badge>
                            </div>
                            <p className="text-sm">{thread.summary}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Last updated: {new Date(thread.lastUpdated).toLocaleString()}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No conversation threads found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="profile" className="p-0">
                <div className="p-4 space-y-4">
                  <div className="p-3 rounded bg-purple-900/20 border border-purple-500/30">
                    <h3 className="font-medium mb-2">Basic Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {memory.userProfile.name || "Unknown"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Relationship Duration:</span>{" "}
                        {Math.floor((new Date().getTime() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Total Interactions:</span> {memory.messages.length} messages
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-purple-900/20 border border-purple-500/30">
                    <h3 className="font-medium mb-2">Preferences</h3>
                    {memory.userProfile.preferences.length > 0 ? (
                      <ul className="space-y-1">
                        {memory.userProfile.preferences.map((pref, i) => (
                          <li key={i} className="text-sm">
                            • {pref}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No preferences recorded yet</p>
                    )}
                  </div>

                  <div className="p-3 rounded bg-purple-900/20 border border-purple-500/30">
                    <h3 className="font-medium mb-2">Important Topics</h3>
                    {memory.userProfile.importantTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {memory.userProfile.importantTopics.map((topic, i) => (
                          <Badge key={i} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No important topics recorded yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
