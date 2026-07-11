"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CharacterData } from "@/lib/types"
import { getArchetypeByName, getArchetypesByCategory } from "@/lib/archetypes"

interface ArchetypeSelectionProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function ArchetypeSelection({
  characterData,
  updateCharacterData,
  nextStep,
  prevStep,
}: ArchetypeSelectionProps) {
  const [archetype, setArchetype] = useState(characterData.archetype || "")

  // Group archetypes by category
  const archetypesByCategory = useMemo(() => getArchetypesByCategory(), [])

  // Get the selected archetype details
  const selectedArchetype = useMemo(() => (archetype ? getArchetypeByName(archetype) : undefined), [archetype])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({ archetype })
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Archetype</h2>
        <p className="text-muted-foreground">
          Select the core archetype that defines your 0N1 character's role in the world
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Select value={archetype} onValueChange={setArchetype} required>
            <SelectTrigger className="bg-background/50 border-purple-500/30 focus:ring-purple-500">
              <SelectValue placeholder="Select an archetype" />
            </SelectTrigger>
            <SelectContent className="bg-background/90 backdrop-blur-sm border-purple-500/30 max-h-[300px]">
              {Object.entries(archetypesByCategory).map(([category, categoryArchetypes]) => (
                <SelectGroup key={category}>
                  <SelectLabel className="text-purple-300">{category} Archetypes</SelectLabel>
                  {categoryArchetypes.map((a) => (
                    <SelectItem key={a.name} value={a.name} className="focus:bg-purple-900/50">
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedArchetype && (
          <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedArchetype.name}</h3>
                <Badge variant="outline" className="bg-purple-900/50 text-purple-200 border-purple-500/30">
                  {selectedArchetype.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-purple-100">{selectedArchetype.description}</p>
                <div className="text-xs text-purple-300 italic">
                  <span className="font-semibold">Example:</span> {selectedArchetype.example}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
            className="border-purple-500/30 hover:bg-purple-900/20"
          >
            Previous
          </Button>
          <Button
            type="submit"
            disabled={!archetype}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
