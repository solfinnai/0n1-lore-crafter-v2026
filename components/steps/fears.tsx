"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import { AiChat } from "@/components/ai-chat"
import type { CharacterData } from "@/lib/types"

interface FearsProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function Fears({ characterData, updateCharacterData, nextStep, prevStep }: FearsProps) {
  const [fears, setFears] = useState(characterData.hopesFears?.fears || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      hopesFears: {
        ...characterData.hopesFears,
        fears,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // Extract fears from the suggestion if possible
    if (suggestion.toLowerCase().includes("fear") || suggestion.toLowerCase().includes("anxiet")) {
      setFears(suggestion)
    } else {
      // If we can't clearly identify it as fears, just use the whole suggestion
      setFears(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Fears & Anxieties</h2>
        <p className="text-muted-foreground">What terrifies your character or keeps them up at night?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fears">Fears & Anxieties</Label>
          <Textarea
            id="fears"
            value={fears}
            onChange={(e) => setFears(e.target.value)}
            placeholder="What terrifies your character or keeps them up at night?"
            className="min-h-[200px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
            required
          />
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="fears"
          onRegenerateSuggestions={() => {}}
          onSelectSuggestion={handleSelectSuggestion}
        />

        <AiChat characterData={characterData} currentStep="fears" />

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
            disabled={!fears.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
