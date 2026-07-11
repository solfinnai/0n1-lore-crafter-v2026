"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import type { CharacterData } from "@/lib/types"

interface WorldPositionProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function WorldPosition({ characterData, updateCharacterData, nextStep, prevStep }: WorldPositionProps) {
  const [societalRole, setSocietalRole] = useState(characterData.worldPosition?.societalRole || "")
  const [classStatus, setClassStatus] = useState(characterData.worldPosition?.classStatus || "")
  const [perception, setPerception] = useState(characterData.worldPosition?.perception || "")
  const [activeField, setActiveField] = useState<"societalRole" | "classStatus" | "perception" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      worldPosition: {
        societalRole,
        classStatus,
        perception,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // Populate the active field with the selected suggestion
    if (activeField === "societalRole") {
      setSocietalRole(suggestion)
    } else if (activeField === "classStatus") {
      setClassStatus(suggestion)
    } else if (activeField === "perception") {
      setPerception(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">World Position</h2>
        <p className="text-muted-foreground">Define your character's place in society and how others perceive them</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="societalRole">Societal Role</Label>
            <Textarea
              id="societalRole"
              value={societalRole}
              onChange={(e) => setSocietalRole(e.target.value)}
              onFocus={() => setActiveField("societalRole")}
              placeholder="What function does your character serve in society?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classStatus">Class & Status</Label>
            <Textarea
              id="classStatus"
              value={classStatus}
              onChange={(e) => setClassStatus(e.target.value)}
              onFocus={() => setActiveField("classStatus")}
              placeholder="What is your character's social standing or economic class?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="perception">Public Perception</Label>
            <Textarea
              id="perception"
              value={perception}
              onChange={(e) => setPerception(e.target.value)}
              onFocus={() => setActiveField("perception")}
              placeholder="How is your character viewed by the general public?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="worldPosition"
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
            disabled={!societalRole.trim() || !classStatus.trim() || !perception.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
