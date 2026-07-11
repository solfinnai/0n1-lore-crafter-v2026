"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import type { CharacterData } from "@/lib/types"

interface SymbolismProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function Symbolism({ characterData, updateCharacterData, nextStep, prevStep }: SymbolismProps) {
  const [colors, setColors] = useState(characterData.symbolism?.colors || "")
  const [items, setItems] = useState(characterData.symbolism?.items || "")
  const [motifs, setMotifs] = useState(characterData.symbolism?.motifs || "")
  const [activeField, setActiveField] = useState<"colors" | "items" | "motifs" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      symbolism: {
        colors,
        items,
        motifs,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // Populate the active field with the selected suggestion
    if (activeField === "colors") {
      setColors(suggestion)
    } else if (activeField === "items") {
      setItems(suggestion)
    } else if (activeField === "motifs") {
      setMotifs(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Symbolism</h2>
        <p className="text-muted-foreground">Define the visual and thematic elements that represent your character</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="colors">Colors & Palette</Label>
            <Textarea
              id="colors"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              onFocus={() => setActiveField("colors")}
              placeholder="What colors are associated with your character? What do they represent?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="items">Symbolic Items</Label>
            <Textarea
              id="items"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              onFocus={() => setActiveField("items")}
              placeholder="What objects or possessions have special meaning to your character?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motifs">Recurring Motifs</Label>
            <Textarea
              id="motifs"
              value={motifs}
              onChange={(e) => setMotifs(e.target.value)}
              onFocus={() => setActiveField("motifs")}
              placeholder="What themes, images, or patterns recur in your character's story?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="symbolism"
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
            disabled={!colors.trim() || !items.trim() || !motifs.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
