"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Heart, 
  Star,
  Plus,
  Clock,
  Activity,
  Save,
  X,
  Trash2
} from "lucide-react"
import type { MemoryTabProps } from "@/lib/memory-types"

export function OverviewTab({ memoryProfile, onUpdate, isEditing }: MemoryTabProps) {
  const { overview, conversationMemory, characterData } = memoryProfile
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    significance: 5
  })

  const relationshipColors = {
    new: "bg-gray-500",
    acquaintance: "bg-blue-500",
    friend: "bg-green-500", 
    close: "bg-yellow-500",
    intimate: "bg-pink-500"
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Never"
    
    try {
      // Ensure it's a valid Date object
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

  const getRelationshipProgress = (level: string) => {
    const levels = ["new", "acquaintance", "friend", "close", "intimate"]
    return ((levels.indexOf(level) + 1) / levels.length) * 100
  }

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim() || !newMilestone.description.trim()) return

    const milestone = {
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newMilestone.title.trim(),
      description: newMilestone.description.trim(),
      significance: newMilestone.significance,
      date: new Date()
    }

    onUpdate({
      overview: {
        ...overview,
        keyMilestones: [...overview.keyMilestones, milestone]
      }
    })

    setNewMilestone({ title: "", description: "", significance: 5 })
    setEditingMilestone(null)
  }

  const handleDeleteMilestone = (id: string) => {
    onUpdate({
      overview: {
        ...overview,
        keyMilestones: overview.keyMilestones.filter(milestone => milestone.id !== id)
      }
    })
  }

  const handleRelationshipLevelChange = (newLevel: "new" | "acquaintance" | "friend" | "close" | "intimate") => {
    onUpdate({
      overview: {
        ...overview,
        relationshipLevel: newLevel
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Character Summary Card */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Character Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-purple-300 mb-2">Basic Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Character Name:</span>
                  <span>{characterData.soulName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Archetype:</span>
                  <span>{characterData.archetype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Background:</span>
                  <span>{characterData.background}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NFT ID:</span>
                  <span>#{characterData.pfpId}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-300 mb-2">Traits & Stats</h3>
              <div className="space-y-2">
                {characterData.traits.slice(0, 4).map((trait, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{trait.trait_type}:</span>
                    <Badge variant="outline" className="border-purple-500/30">
                      {trait.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship & Activity Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Relationship Status */}
        <Card className="bg-black/60 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Relationship Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Level:</span>
              {isEditing ? (
                <Select value={overview.relationshipLevel} onValueChange={handleRelationshipLevelChange}>
                  <SelectTrigger className="w-32 bg-black/40 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="acquaintance">Acquaintance</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="close">Close</SelectItem>
                    <SelectItem value="intimate">Intimate</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge 
                  className={`${relationshipColors[overview.relationshipLevel]} text-white`}
                >
                  {overview.relationshipLevel.charAt(0).toUpperCase() + overview.relationshipLevel.slice(1)}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next level</span>
                <span>{Math.round(getRelationshipProgress(overview.relationshipLevel))}%</span>
              </div>
              <Progress 
                value={getRelationshipProgress(overview.relationshipLevel)} 
                className="h-2"
              />
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Interactions:</span>
                <span>{overview.totalInteractions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Activity:</span>
                <span>{formatDate(overview.lastActivity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Memories Stored:</span>
                <span>{conversationMemory.keyMemories.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-black/60 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversationMemory.messages.slice(-3).map((message, index) => (
                <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg bg-purple-900/20">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-purple-300">
                        {message.role === 'user' ? 'You' : characterData.soulName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {conversationMemory.messages.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversation history yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Milestones */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Key Milestones
          </CardTitle>
          {isEditing && (
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-900/20"
              onClick={() => setEditingMilestone("new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Add Milestone Form */}
          {isEditing && editingMilestone === "new" && (
            <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
              <h4 className="font-medium text-blue-300 mb-3">Add New Milestone</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Milestone title..."
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-black/40 border-blue-500/30"
                />
                <Textarea
                  placeholder="Milestone description..."
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-black/40 border-blue-500/30"
                  rows={3}
                />
                <div className="space-y-1">
                  <label className="text-xs text-blue-300">Significance (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newMilestone.significance}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, significance: parseInt(e.target.value) || 5 }))}
                    className="bg-black/40 border-blue-500/30"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddMilestone} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Milestone
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingMilestone(null)} className="border-blue-500/30">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {overview.keyMilestones.length > 0 ? (
            <div className="space-y-4">
              {overview.keyMilestones
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5)
                .map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-4 p-4 rounded-lg bg-purple-900/20">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-purple-300">{milestone.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(milestone.date)}
                        </span>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="h-6 w-6 p-0 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                        Significance: {milestone.significance}/10
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No milestones recorded yet</p>
              <p className="text-sm">Key moments in your relationship will appear here</p>
              {isEditing && (
                <Button
                  variant="outline"
                  className="mt-4 border-purple-500/30 hover:bg-purple-900/20"
                  onClick={() => setEditingMilestone("new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Milestone
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personality Growth */}
      {overview.personalityGrowth.length > 0 && (
        <Card className="bg-black/60 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Personality Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {overview.personalityGrowth.map((growth, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="border-green-500/30 text-green-400"
                >
                  {growth}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 