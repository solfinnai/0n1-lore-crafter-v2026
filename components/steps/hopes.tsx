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

interface HopesProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function Hopes({ characterData, updateCharacterData, nextStep, prevStep }: HopesProps) {
  const [hopes, setHopes] = useState(characterData.hopesFears?.hopes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      hopesFears: {
        ...characterData.hopesFears,
        hopes,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // Extract hopes from the suggestion if possible
    if (suggestion.toLowerCase().includes("hope") || suggestion.toLowerCase().includes("dream")) {
      setHopes(suggestion)
    } else {
      // If we can't clearly identify it as hopes, just use the whole suggestion
      setHopes(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Hopes & Dreams</h2>
        <p className="text-muted-foreground">What are your character's deepest aspirations and dreams?</p>
      </div>

      {/* Add the StepImage component */}
      {/* <StepImage step="hopes" /> */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="hopes">Hopes & Dreams</Label>
          <Textarea
            id="hopes"
            value={hopes}
            onChange={(e) => setHopes(e.target.value)}
            placeholder="What does your character aspire to achieve or become?"
            className="min-h-[200px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
            required
          />
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="hopes"
          onRegenerateSuggestions={() => {}}
          onSelectSuggestion={handleSelectSuggestion}
        />

        <AiChat characterData={characterData} currentStep="hopes" />

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
            disabled={!hopes.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
