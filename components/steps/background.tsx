"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import { AiChat } from "@/components/ai-chat"
import type { CharacterData } from "@/lib/types"
// import { StepImage } from "@/components/step-image"

interface BackgroundProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function Background({ characterData, updateCharacterData, nextStep, prevStep }: BackgroundProps) {
  const [background, setBackground] = useState(characterData.background || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({ background })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setBackground(suggestion)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Character Background</h2>
        <p className="text-muted-foreground">Where was your character born? What was their upbringing like?</p>
      </div>

      {/* Add the StepImage component */}
      {/* <StepImage step="background" /> */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="background">Background Story</Label>
          <Textarea
            id="background"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Describe your character's origins and early life..."
            className="min-h-[200px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
            required
          />
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="background"
          onRegenerateSuggestions={() => {}}
          onSelectSuggestion={handleSelectSuggestion}
        />

        <AiChat characterData={characterData} currentStep="background" />

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
            disabled={!background.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
