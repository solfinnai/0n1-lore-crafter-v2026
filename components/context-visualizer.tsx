"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { EnhancedMemory } from "@/lib/memory-enhanced"
import type { CharacterData } from "@/lib/types"

interface ContextVisualizerProps {
  memory: EnhancedMemory
  characterData: CharacterData
  className?: string
}

export function ContextVisualizer({ memory, characterData, className = "" }: ContextVisualizerProps) {
  const [activeTab, setActiveTab] = useState("memory")

  return (
    <Card className={`border border-purple-500/30 bg-black/60 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Conversation Context</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="character">Character</TabsTrigger>
            <TabsTrigger value="world">World</TabsTrigger>
          </TabsList>

          <TabsContent value="memory" className="p-3 space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Relevant Memories</h4>
              <div className="space-y-1">
                {memory.contextualMemories
                  .sort((a, b) => b.relevance - a.relevance)
                  .slice(0, 3)
                  .map((mem) => (
                    <div key={mem.id} className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                      <div className="flex justify-between items-center mb-0.5">
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          {mem.category}
                        </Badge>
                        <span className="text-[10px] text-purple-300">Relevance: {mem.relevance}/10</span>
                      </div>
                      <p className="line-clamp-2">{mem.content}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">User Profile</h4>
              <div className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                <p>
                  <span className="font-medium">Name:</span> {memory.userProfile.name || "Unknown"}
                </p>
                <p className="mt-0.5">
                  <span className="font-medium">Preferences:</span>{" "}
                  {memory.userProfile.preferences.length > 0
                    ? memory.userProfile.preferences.slice(0, 2).join(", ")
                    : "None recorded"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="character" className="p-3 space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Personality</h4>
              <div className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                <p className="line-clamp-3">
                  {characterData.personalityProfile?.description || "No personality defined"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Voice</h4>
              <div className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                <p className="line-clamp-2">
                  <span className="font-medium">Speech:</span> {characterData.voice?.speechStyle || "Not defined"}
                </p>
                <p className="line-clamp-2 mt-0.5">
                  <span className="font-medium">Phrases:</span> {characterData.voice?.uniquePhrases || "None"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Motivations</h4>
              <div className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                <p className="line-clamp-2">
                  <span className="font-medium">Goals:</span> {characterData.motivations?.goals || "Unknown"}
                </p>
                <p className="line-clamp-2 mt-0.5">
                  <span className="font-medium">Values:</span> {characterData.motivations?.values || "Unknown"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="world" className="p-3 space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">World Position</h4>
              <div className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                <p className="line-clamp-2">
                  <span className="font-medium">Role:</span> {characterData.worldPosition?.societalRole || "Unknown"}
                </p>
                <p className="line-clamp-2 mt-0.5">
                  <span className="font-medium">Status:</span> {characterData.worldPosition?.classStatus || "Unknown"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Relationships</h4>
              <div className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                <p className="line-clamp-2">
                  <span className="font-medium">Friends:</span> {characterData.relationships?.friends || "None known"}
                </p>
                <p className="line-clamp-2 mt-0.5">
                  <span className="font-medium">Rivals:</span> {characterData.relationships?.rivals || "None known"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Powers</h4>
              <div className="text-xs p-1.5 rounded bg-purple-900/20 border border-purple-500/20">
                <p className="line-clamp-3">{characterData.powersAbilities?.description || "No powers defined"}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
