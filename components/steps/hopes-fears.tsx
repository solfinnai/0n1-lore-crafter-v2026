"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import type { CharacterData } from "@/lib/types"

interface HopesFearsProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function HopesFears({ characterData, updateCharacterData, nextStep, prevStep }: HopesFearsProps) {
  const [hopes, setHopes] = useState(characterData.hopesFears?.hopes || "")
  const [fears, setFears] = useState(characterData.hopesFears?.fears || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      hopesFears: {
        hopes,
        fears,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // For hopes and fears, we need to parse the suggestion to separate hopes and fears
    if (suggestion.toLowerCase().includes("hopes") && suggestion.toLowerCase().includes("fears")) {
      // Try to split by common patterns
      const parts = suggestion.split(/[,;.]/).filter((part) => part.trim())

      for (const part of parts) {
        const lowerPart = part.toLowerCase().trim()
        if (lowerPart.includes("hope")) {
          setHopes(part.trim())
        } else if (lowerPart.includes("fear")) {
          setFears(part.trim())
        }
      }
    } else {
      // If we can't clearly separate, just put the whole suggestion in hopes
      setHopes(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Hopes & Fears</h2>
        <p className="text-muted-foreground">What are your character's deepest dreams and darkest fears?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hopes">Hopes & Dreams</Label>
            <Textarea
              id="hopes"
              value={hopes}
              onChange={(e) => setHopes(e.target.value)}
              placeholder="What does your character aspire to achieve or become?"
              className="min-h-[120px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fears">Fears & Anxieties</Label>
            <Textarea
              id="fears"
              value={fears}
              onChange={(e) => setFears(e.target.value)}
              placeholder="What terrifies your character or keeps them up at night?"
              className="min-h-[120px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="hopesFears"
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
            disabled={!hopes.trim() || !fears.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
