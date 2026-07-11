"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import { AiChat } from "@/components/ai-chat"
import type { CharacterData } from "@/lib/types"

interface MotivationsProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function Motivations({ characterData, updateCharacterData, nextStep, prevStep }: MotivationsProps) {
  const [drives, setDrives] = useState(characterData.motivations?.drives || "")
  const [goals, setGoals] = useState(characterData.motivations?.goals || "")
  const [values, setValues] = useState(characterData.motivations?.values || "")
  const [activeField, setActiveField] = useState<"drives" | "goals" | "values" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      motivations: {
        drives,
        goals,
        values,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // Populate the active field with the selected suggestion
    if (activeField === "drives") {
      setDrives(suggestion)
    } else if (activeField === "goals") {
      setGoals(suggestion)
    } else if (activeField === "values") {
      setValues(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Motivations</h2>
        <p className="text-muted-foreground">What drives your character? What are their goals and values?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drives">Inner Drives</Label>
            <Textarea
              id="drives"
              value={drives}
              onChange={(e) => setDrives(e.target.value)}
              onFocus={() => setActiveField("drives")}
              placeholder="What internal forces motivate your character?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals & Ambitions</Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              onFocus={() => setActiveField("goals")}
              placeholder="What does your character aim to achieve?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="values">Core Values</Label>
            <Textarea
              id="values"
              value={values}
              onChange={(e) => setValues(e.target.value)}
              onFocus={() => setActiveField("values")}
              placeholder="What principles does your character hold dear?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="motivations"
          subStep={activeField}
          onRegenerateSuggestions={() => {}}
          onSelectSuggestion={handleSelectSuggestion}
        />

        <AiChat characterData={characterData} currentStep="motivations" subStep={activeField} />

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
            disabled={!drives.trim() || !goals.trim() || !values.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
