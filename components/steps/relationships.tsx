"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import type { CharacterData } from "@/lib/types"

interface RelationshipsProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function Relationships({ characterData, updateCharacterData, nextStep, prevStep }: RelationshipsProps) {
  const [friends, setFriends] = useState(characterData.relationships?.friends || "")
  const [rivals, setRivals] = useState(characterData.relationships?.rivals || "")
  const [family, setFamily] = useState(characterData.relationships?.family || "")
  const [activeField, setActiveField] = useState<"friends" | "rivals" | "family" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      relationships: {
        friends,
        rivals,
        family,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // Populate the active field with the selected suggestion
    if (activeField === "friends") {
      setFriends(suggestion)
    } else if (activeField === "rivals") {
      setRivals(suggestion)
    } else if (activeField === "family") {
      setFamily(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Relationships</h2>
        <p className="text-muted-foreground">Define your character's connections to others in the world</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="friends">Allies & Friends</Label>
            <Textarea
              id="friends"
              value={friends}
              onChange={(e) => setFriends(e.target.value)}
              onFocus={() => setActiveField("friends")}
              placeholder="Who does your character trust and rely on?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rivals">Rivals & Enemies</Label>
            <Textarea
              id="rivals"
              value={rivals}
              onChange={(e) => setRivals(e.target.value)}
              onFocus={() => setActiveField("rivals")}
              placeholder="Who opposes or challenges your character?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="family">Family & Mentors</Label>
            <Textarea
              id="family"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              onFocus={() => setActiveField("family")}
              placeholder="What is your character's relationship with family or mentors?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="relationships"
          subStep={activeField}
          onRegenerateSuggestions={() => {}}
          onSelectSuggestion={handleSelectSuggestion}
        />

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
            disabled={!friends.trim() || !rivals.trim() || !family.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
