"use client"

import { useState } from "react"
import { PfpInput } from "@/components/steps/pfp-input"
import { ArchetypeSelection } from "@/components/steps/archetype-selection"
import { Background } from "@/components/steps/background"
import { Hopes } from "@/components/steps/hopes"
import { Fears } from "@/components/steps/fears"
import { PersonalityProfile } from "@/components/steps/personality-profile"
import { Motivations } from "@/components/steps/motivations"
import { Relationships } from "@/components/steps/relationships"
import { WorldPosition } from "@/components/steps/world-position"
import { Voice } from "@/components/steps/voice"
import { Symbolism } from "@/components/steps/symbolism"
import { PowersAbilities } from "@/components/steps/powers-abilities"
import { FinalLore } from "@/components/steps/final-lore"
import { NftTraitsSidebar } from "@/components/nft-traits-sidebar"
import { TraitsPanelContext } from "@/components/traits-panel-context"
import { SafeNftImage } from "@/components/safe-nft-image"
import { Button } from "@/components/ui/button"
import type { CharacterData } from "@/lib/types"

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [traitsPanelOpen, setTraitsPanelOpen] = useState(false)
  const [characterData, setCharacterData] = useState<CharacterData>({
    pfpId: "",
    traits: [],
    archetype: "",
    background: "",
    hopesFears: {
      hopes: "",
      fears: "",
    },
    personalityProfile: {
      description: "",
    },
    motivations: {
      drives: "",
      goals: "",
      values: "",
    },
    relationships: {
      friends: "",
      rivals: "",
      family: "",
    },
    worldPosition: {
      societalRole: "",
      classStatus: "",
      perception: "",
    },
    voice: {
      speechStyle: "",
      innerDialogue: "",
      uniquePhrases: "",
    },
    symbolism: {
      colors: "",
      items: "",
      motifs: "",
    },
    powersAbilities: {
      powers: [],
      description: "",
    },
    soulName: "",
  })

  const updateCharacterData = (data: Partial<CharacterData>) => {
    setCharacterData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const steps = [
    <PfpInput
      key="pfp-input"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
    />,
    <ArchetypeSelection
      key="archetype-selection"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <Background
      key="background"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <Hopes
      key="hopes"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <Fears
      key="fears"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <PersonalityProfile
      key="personality-profile"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <Motivations
      key="motivations"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <Relationships
      key="relationships"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <WorldPosition
      key="world-position"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <Voice
      key="voice"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <Symbolism
      key="symbolism"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <PowersAbilities
      key="powers-abilities"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      nextStep={nextStep}
      prevStep={prevStep}
    />,
    <FinalLore
      key="final-lore"
      characterData={characterData}
      updateCharacterData={updateCharacterData}
      prevStep={prevStep}
    />,
  ]

  // Panel is available once an NFT is selected. Step 0 keeps its own
  // fetch-based instance in PfpInput (users browse tokens they haven't
  // selected yet there), so the shared one is hidden until step 1+.
  const showTraitsEntry = currentStep > 0 && !!characterData.pfpId

  return (
    <TraitsPanelContext.Provider value={{ openTraitsPanel: () => setTraitsPanelOpen(true) }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            0N1 Soul Generator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Build the soul-core and personal identity lore for your 0N1 Force character
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {Array.from({ length: steps.length }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "w-4 bg-primary" : index < currentStep ? "bg-primary/70" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {showTraitsEntry && (
          <div className="max-w-4xl mx-auto mb-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTraitsPanelOpen(true)}
              className="gap-2 border-purple-500/30 bg-black/40 hover:bg-purple-900/30 text-purple-200"
            >
              {characterData.imageUrl && (
                <span className="relative w-5 h-5 rounded overflow-hidden shrink-0">
                  <SafeNftImage src={characterData.imageUrl} alt="" fill className="object-cover" />
                </span>
              )}
              #{characterData.pfpId} traits
            </Button>
          </div>
        )}

        <div className="max-w-4xl mx-auto">{steps[currentStep]}</div>

        {showTraitsEntry && (
          <NftTraitsSidebar
            isOpen={traitsPanelOpen}
            onClose={() => setTraitsPanelOpen(false)}
            tokenId={characterData.pfpId}
            imageUrl={characterData.imageUrl}
            traits={characterData.traits}
          />
        )}
      </div>
    </TraitsPanelContext.Provider>
  )
}
