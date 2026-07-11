"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Edit3, 
  Plus, 
  Trash2,
  Users,
  MapPin,
  Lightbulb,
  TrendingUp,
  Save,
  X
} from "lucide-react"
import Image from "next/image"
import type { MemoryTabProps } from "@/lib/memory-types"

export function CharacterProfileTab({ memoryProfile, onUpdate, isEditing }: MemoryTabProps) {
  const { characterData, characterEvolution } = memoryProfile
  const [editingTrait, setEditingTrait] = useState<string | null>(null)
  const [newTrait, setNewTrait] = useState({ traitName: "", description: "", context: "" })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const handleAddTrait = () => {
    if (!newTrait.traitName.trim() || !newTrait.description.trim()) return

    const trait = {
      id: `trait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      traitName: newTrait.traitName.trim(),
      description: newTrait.description.trim(),
      context: newTrait.context.trim(),
      dateAcquired: new Date()
    }

    onUpdate({
      characterEvolution: {
        ...characterEvolution,
        newTraits: [...characterEvolution.newTraits, trait]
      }
    })

    setNewTrait({ traitName: "", description: "", context: "" })
  }

  const handleRemoveTrait = (traitId: string) => {
    onUpdate({
      characterEvolution: {
        ...characterEvolution,
        newTraits: characterEvolution.newTraits.filter(t => t.id !== traitId)
      }
    })
  }

  const getTraitColor = (traitType: string) => {
    const colors: Record<string, string> = {
      'Clothing': 'border-blue-500/30 text-blue-400',
      'Eyes': 'border-green-500/30 text-green-400',
      'Hair': 'border-yellow-500/30 text-yellow-400',
      'Background': 'border-purple-500/30 text-purple-400',
      'Strength': 'border-red-500/30 text-red-400',
      'Spirit': 'border-pink-500/30 text-pink-400',
      'Intelligence': 'border-cyan-500/30 text-cyan-400',
      'Dexterity': 'border-orange-500/30 text-orange-400'
    }
    return colors[traitType] || 'border-gray-500/30 text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Core Character Data */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Core Character Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Character Image and Basic Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border border-purple-500/30">
                <Image
                  src={characterData.imageUrl || `/placeholder.svg?height=128&width=128&query=0N1 Force #${characterData.pfpId}`}
                  alt={`0N1 Force #${characterData.pfpId}`}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-purple-300">{characterData.soulName}</h3>
                <p className="text-sm text-muted-foreground">0N1 Force #{characterData.pfpId}</p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-purple-300">Archetype</label>
                  <div className="mt-1 p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
                    <span className="text-lg font-semibold">{characterData.archetype}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-purple-300">Background</label>
                  <div className="mt-1 p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
                    <span className="text-lg font-semibold">{characterData.background}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-purple-300">Backstory</label>
                <div className="mt-1 p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
                  <p className="text-sm leading-relaxed">{"No backstory written yet."}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original Traits */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Original Traits & Attributes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {characterData.traits.map((trait, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-300">{trait.trait_type}</span>
                  <Badge 
                    variant="outline" 
                    className={getTraitColor(trait.trait_type)}
                  >
                    {trait.value}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acquired Traits */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Acquired Traits & Development
          </CardTitle>
          {isEditing && (
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-900/20"
              onClick={() => setEditingTrait("new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trait
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Add New Trait Form */}
          {isEditing && editingTrait === "new" && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
              <h4 className="font-medium text-green-300 mb-3">Add New Trait</h4>
              <div className="space-y-3">
                <div>
                  <Input
                    placeholder="Trait name (e.g., 'Strategic Thinking', 'Empathy')"
                    value={newTrait.traitName}
                    onChange={(e) => setNewTrait(prev => ({ ...prev, traitName: e.target.value }))}
                    className="bg-black/40 border-green-500/30"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Description of this trait and how it manifests..."
                    value={newTrait.description}
                    onChange={(e) => setNewTrait(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-black/40 border-green-500/30"
                    rows={2}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Context: How/when was this trait acquired? (optional)"
                    value={newTrait.context}
                    onChange={(e) => setNewTrait(prev => ({ ...prev, context: e.target.value }))}
                    className="bg-black/40 border-green-500/30"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddTrait}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Add Trait
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTrait(null)
                      setNewTrait({ traitName: "", description: "", context: "" })
                    }}
                    className="border-green-500/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Acquired Traits */}
          {characterEvolution.newTraits.length > 0 ? (
            <div className="space-y-4">
              {characterEvolution.newTraits
                .sort((a, b) => b.dateAcquired.getTime() - a.dateAcquired.getTime())
                .map((trait) => (
                <div key={trait.id} className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-green-300">{trait.traitName}</h4>
                        <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                          {formatDate(trait.dateAcquired)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trait.description}</p>
                      {trait.context && (
                        <p className="text-xs text-green-300/70 italic">Context: {trait.context}</p>
                      )}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 hover:bg-red-900/20 text-red-400"
                        onClick={() => handleRemoveTrait(trait.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No acquired traits yet</p>
              <p className="text-sm">New personality traits and developments will appear here</p>
              {isEditing && (
                <Button
                  variant="outline"
                  className="mt-4 border-green-500/30 hover:bg-green-900/20"
                  onClick={() => setEditingTrait("new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Trait
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personality Changes */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-orange-500" />
            Personality Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {characterEvolution.personalityChanges.length > 0 ? (
            <div className="space-y-4">
              {characterEvolution.personalityChanges
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((change) => (
                <div key={change.id} className="p-4 rounded-lg bg-orange-900/20 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-orange-300">{change.aspect}</h4>
                    <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                      {formatDate(change.date)}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">From: </span>
                      <span className="line-through text-red-300">{change.oldValue}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To: </span>
                      <span className="text-green-300">{change.newValue}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{change.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No personality changes recorded</p>
              <p className="text-sm">Character development and changes will be tracked here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relationships */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-pink-500" />
            Relationships & Connections
          </CardTitle>
          {isEditing && (
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-900/20"
              onClick={() => {
                // TODO: Add relationship creation logic
                console.log("Add relationship")
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Relationship
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {characterEvolution.relationships.length > 0 ? (
            <div className="space-y-4">
              {characterEvolution.relationships
                .sort((a, b) => b.significance - a.significance)
                .map((relationship) => (
                <div key={relationship.id} className="p-4 rounded-lg bg-pink-900/20 border border-pink-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-pink-300">{relationship.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-pink-500/30 text-pink-400 text-xs">
                        {relationship.type}
                      </Badge>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-xs">
                        {relationship.significance}/10
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{relationship.description}</p>
                  <div className="text-xs text-pink-300/70">
                    <span>Relationship: {relationship.relationshipType}</span>
                    <span className="mx-2">•</span>
                    <span>Since: {formatDate(relationship.dateEstablished)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No relationships recorded</p>
              <p className="text-sm">Character relationships and connections will appear here</p>
              {isEditing && (
                <Button
                  variant="outline"
                  className="mt-4 border-pink-500/30 hover:bg-pink-900/20"
                  onClick={() => {
                    // TODO: Add relationship creation logic
                    console.log("Add first relationship")
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Relationship
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 