"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { storeSoul, type StoredSoul } from "@/lib/storage-wrapper"
import type { CharacterData } from "@/lib/types"
import { Save, X, AlertTriangle } from 'lucide-react'
import Image from "next/image"

interface SoulEditorProps {
  soul: StoredSoul
  onSave: (updatedSoul: StoredSoul) => void
  onCancel: () => void
}

export function SoulEditor({ soul, onSave, onCancel }: SoulEditorProps) {
  const [editedData, setEditedData] = useState<CharacterData>({ ...soul.data })
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    section: keyof CharacterData,
    field: string,
    value: string | string[],
    isNestedField: boolean = false
  ) => {
    setEditedData((prev) => {
      if (isNestedField) {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof CharacterData],
            [field]: value,
          },
        }
      } else {
        return {
          ...prev,
          [field]: value,
        }
      }
    })
  }

  const handleSave = () => {
    try {
      setIsSaving(true)
      setError(null)

      // Validate required fields
      if (!editedData.soulName?.trim()) {
        setError("Soul name is required")
        setIsSaving(false)
        return
      }

      // Create updated soul
      const updatedSoul: StoredSoul = {
        ...soul,
        data: editedData,
      }

      // Save to storage
      storeSoul(editedData)

      // Notify parent component
      onSave(updatedSoul)
    } catch (err) {
      console.error("Error saving soul:", err)
      setError("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full border border-purple-500/30 bg-black/80 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Edit Soul: {soul.data.soulName}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="world">World</TabsTrigger>
            <TabsTrigger value="powers">Powers</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* NFT Image */}
              <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center">
                <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border border-purple-500/30">
                  <Image
                    src={
                      editedData.imageUrl ||
                      `/placeholder.svg?height=200&width=200&query=0N1 Force #${editedData.pfpId || "/placeholder.svg"}`
                    }
                    alt={`0N1 Force #${editedData.pfpId}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Basic Fields */}
              <div className="flex-grow space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="soulName">Soul Name</Label>
                  <Input
                    id="soulName"
                    value={editedData.soulName || ""}
                    onChange={(e) => handleChange("soulName", "soulName", e.target.value)}
                    className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="archetype">Archetype</Label>
                  <Input
                    id="archetype"
                    value={editedData.archetype || ""}
                    onChange={(e) => handleChange("archetype", "archetype", e.target.value)}
                    className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Background</Label>
                  <Textarea
                    id="background"
                    value={editedData.background || ""}
                    onChange={(e) => handleChange("background", "background", e.target.value)}
                    className="min-h-[120px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Personality Tab */}
          <TabsContent value="personality" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalityDescription">Personality Profile</Label>
              <Textarea
                id="personalityDescription"
                value={editedData.personalityProfile?.description || ""}
                onChange={(e) =>
                  handleChange("personalityProfile", "description", e.target.value, true)
                }
                className="min-h-[120px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hopes">Hopes & Dreams</Label>
                <Textarea
                  id="hopes"
                  value={editedData.hopesFears?.hopes || ""}
                  onChange={(e) => handleChange("hopesFears", "hopes", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fears">Fears & Anxieties</Label>
                <Textarea
                  id="fears"
                  value={editedData.hopesFears?.fears || ""}
                  onChange={(e) => handleChange("hopesFears", "fears", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drives">Inner Drives</Label>
                <Textarea
                  id="drives"
                  value={editedData.motivations?.drives || ""}
                  onChange={(e) => handleChange("motivations", "drives", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Goals & Ambitions</Label>
                <Textarea
                  id="goals"
                  value={editedData.motivations?.goals || ""}
                  onChange={(e) => handleChange("motivations", "goals", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="values">Core Values</Label>
                <Textarea
                  id="values"
                  value={editedData.motivations?.values || ""}
                  onChange={(e) => handleChange("motivations", "values", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>
            </div>
          </TabsContent>

          {/* Relationships Tab */}
          <TabsContent value="relationships" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="friends">Allies & Friends</Label>
              <Textarea
                id="friends"
                value={editedData.relationships?.friends || ""}
                onChange={(e) => handleChange("relationships", "friends", e.target.value, true)}
                className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rivals">Rivals & Enemies</Label>
              <Textarea
                id="rivals"
                value={editedData.relationships?.rivals || ""}
                onChange={(e) => handleChange("relationships", "rivals", e.target.value, true)}
                className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family">Family & Mentors</Label>
              <Textarea
                id="family"
                value={editedData.relationships?.family || ""}
                onChange={(e) => handleChange("relationships", "family", e.target.value, true)}
                className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>
          </TabsContent>

          {/* World Position Tab */}
          <TabsContent value="world" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="societalRole">Societal Role</Label>
              <Textarea
                id="societalRole"
                value={editedData.worldPosition?.societalRole || ""}
                onChange={(e) => handleChange("worldPosition", "societalRole", e.target.value, true)}
                className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classStatus">Class & Status</Label>
              <Textarea
                id="classStatus"
                value={editedData.worldPosition?.classStatus || ""}
                onChange={(e) => handleChange("worldPosition", "classStatus", e.target.value, true)}
                className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perception">Public Perception</Label>
              <Textarea
                id="perception"
                value={editedData.worldPosition?.perception || ""}
                onChange={(e) => handleChange("worldPosition", "perception", e.target.value, true)}
                className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="speechStyle">Speech Style</Label>
                <Textarea
                  id="speechStyle"
                  value={editedData.voice?.speechStyle || ""}
                  onChange={(e) => handleChange("voice", "speechStyle", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="innerDialogue">Inner Dialogue</Label>
                <Textarea
                  id="innerDialogue"
                  value={editedData.voice?.innerDialogue || ""}
                  onChange={(e) => handleChange("voice", "innerDialogue", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniquePhrases">Unique Phrases</Label>
                <Textarea
                  id="uniquePhrases"
                  value={editedData.voice?.uniquePhrases || ""}
                  onChange={(e) => handleChange("voice", "uniquePhrases", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>
            </div>
          </TabsContent>

          {/* Powers Tab */}
          <TabsContent value="powers" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="powersDescription">Powers Description</Label>
              <Textarea
                id="powersDescription"
                value={editedData.powersAbilities?.description || ""}
                onChange={(e) => handleChange("powersAbilities", "description", e.target.value, true)}
                className="min-h-[120px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="powers">Powers (comma-separated)</Label>
              <Input
                id="powers"
                value={(editedData.powersAbilities?.powers || []).join(", ")}
                onChange={(e) =>
                  handleChange(
                    "powersAbilities",
                    "powers",
                    e.target.value.split(",").map((p) => p.trim()),
                    true
                  )
                }
                className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
              <p className="text-xs text-muted-foreground">Enter powers separated by commas</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="colors">Colors & Palette</Label>
                <Textarea
                  id="colors"
                  value={editedData.symbolism?.colors || ""}
                  onChange={(e) => handleChange("symbolism", "colors", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="items">Symbolic Items</Label>
                <Textarea
                  id="items"
                  value={editedData.symbolism?.items || ""}
                  onChange={(e) => handleChange("symbolism", "items", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motifs">Recurring Motifs</Label>
                <Textarea
                  id="motifs"
                  value={editedData.symbolism?.motifs || ""}
                  onChange={(e) => handleChange("symbolism", "motifs", e.target.value, true)}
                  className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {error && (
        <div className="mx-4 my-2 p-2 rounded-md bg-red-950/30 border border-red-500/50 text-red-200 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <CardFooter className="flex justify-between p-4">
        <Button variant="outline" onClick={onCancel} className="border-purple-500/30 hover:bg-purple-900/20">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
