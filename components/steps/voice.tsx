"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AiAssistant } from "@/components/ai-assistant"
import type { CharacterData } from "@/lib/types"

interface VoiceProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function Voice({ characterData, updateCharacterData, nextStep, prevStep }: VoiceProps) {
  const [speechStyle, setSpeechStyle] = useState(characterData.voice?.speechStyle || "")
  const [innerDialogue, setInnerDialogue] = useState(characterData.voice?.innerDialogue || "")
  const [uniquePhrases, setUniquePhrases] = useState(characterData.voice?.uniquePhrases || "")
  const [activeField, setActiveField] = useState<"speechStyle" | "innerDialogue" | "uniquePhrases" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      voice: {
        speechStyle,
        innerDialogue,
        uniquePhrases,
      },
    })
    nextStep()
  }

  const handleSelectSuggestion = (suggestion: string) => {
    // Populate the active field with the selected suggestion
    if (activeField === "speechStyle") {
      setSpeechStyle(suggestion)
    } else if (activeField === "innerDialogue") {
      setInnerDialogue(suggestion)
    } else if (activeField === "uniquePhrases") {
      setUniquePhrases(suggestion)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Character Voice</h2>
        <p className="text-muted-foreground">Define how your character speaks and their inner thoughts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="speechStyle">Speech Style</Label>
            <Textarea
              id="speechStyle"
              value={speechStyle}
              onChange={(e) => setSpeechStyle(e.target.value)}
              onFocus={() => setActiveField("speechStyle")}
              placeholder="How does your character speak? Formal, slang, accent, etc."
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="innerDialogue">Inner Dialogue</Label>
            <Textarea
              id="innerDialogue"
              value={innerDialogue}
              onChange={(e) => setInnerDialogue(e.target.value)}
              onFocus={() => setActiveField("innerDialogue")}
              placeholder="How does your character think? What's their internal voice like?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniquePhrases">Unique Phrases</Label>
            <Textarea
              id="uniquePhrases"
              value={uniquePhrases}
              onChange={(e) => setUniquePhrases(e.target.value)}
              onFocus={() => setActiveField("uniquePhrases")}
              placeholder="What catchphrases or unique expressions does your character use?"
              className="min-h-[100px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              required
            />
          </div>
        </div>

        <AiAssistant
          characterData={characterData}
          currentStep="voice"
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
            disabled={!speechStyle.trim() || !innerDialogue.trim() || !uniquePhrases.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
