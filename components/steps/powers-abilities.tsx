"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import type { CharacterData } from "@/lib/types"
import { getPowerByBodyType, getDefaultPowerType, type PowerType } from "@/lib/powers"
import { X } from "lucide-react"

interface PowersAbilitiesProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function PowersAbilities({ characterData, updateCharacterData, nextStep, prevStep }: PowersAbilitiesProps) {
  const [powerType, setPowerType] = useState<PowerType | null>(null)
  const [selectedEvolution, setSelectedEvolution] = useState<string>("")
  const [description, setDescription] = useState(characterData.powersAbilities?.description || "")
  const [powers, setPowers] = useState<string[]>(characterData.powersAbilities?.powers || [])

  // Determine the body type from traits and set the power type
  useEffect(() => {
    if (characterData.traits && characterData.traits.length > 0) {
      // Look for a trait with trait_type "Body" or similar
      const bodyTrait = characterData.traits.find(
        (trait) =>
          trait.trait_type.toLowerCase() === "body" ||
          trait.trait_type.toLowerCase() === "skin" ||
          trait.trait_type.toLowerCase() === "body type",
      )

      if (bodyTrait) {
        const foundPowerType = getPowerByBodyType(bodyTrait.value)
        if (foundPowerType) {
          setPowerType(foundPowerType)

          // If powers array is empty, pre-populate with core power
          if (powers.length === 0) {
            setPowers([foundPowerType.corePower.name])
          }

          // If description is empty, pre-populate with core power description
          if (!description) {
            setDescription(foundPowerType.corePower.description)
          }

          return
        }
      }
    }

    // If no body trait found or no matching power type, use default
    const defaultPower = getDefaultPowerType()
    setPowerType(defaultPower)

    // Pre-populate with default if empty
    if (powers.length === 0) {
      setPowers([defaultPower.corePower.name])
    }

    if (!description) {
      setDescription(defaultPower.corePower.description)
    }
  }, [characterData.traits, powers.length, description])

  // Add the selected evolution to powers when it changes
  useEffect(() => {
    if (selectedEvolution && !powers.includes(selectedEvolution)) {
      // Remove any previous evolution options
      const filteredPowers = powers.filter((power) => {
        return powerType?.evolutionOptions.every((evo) => evo.name !== power)
      })

      // Add the new evolution
      setPowers([...filteredPowers, selectedEvolution])
    }
  }, [selectedEvolution, powers, powerType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCharacterData({
      powersAbilities: {
        powers,
        description,
      },
    })
    nextStep()
  }

  const removePower = (powerToRemove: string) => {
    // Don't allow removing the core power
    if (powerType && powerToRemove === powerType.corePower.name) {
      return
    }

    // If removing an evolution, also clear the selection
    if (selectedEvolution === powerToRemove) {
      setSelectedEvolution("")
    }

    setPowers(powers.filter((p) => p !== powerToRemove))
  }

  if (!powerType) {
    return <div>Loading powers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Powers & Abilities</h2>
        <p className="text-muted-foreground">
          Your character's powers are determined by their body type. Select an evolution path to specialize.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Body Type: {powerType.bodyType}</h3>
              <Badge variant="outline" className="bg-purple-900/50 text-purple-200 border-purple-500/30">
                {powerType.foundation}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-purple-300">Core Power: {powerType.corePower.name}</h4>
              <p className="text-sm">{powerType.corePower.description}</p>
            </div>

            {/* Current Powers */}
            <div className="space-y-2">
              <Label>Current Powers</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {powers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/30"
                  >
                    {p}
                    {p !== powerType.corePower.name && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-purple-800"
                        onClick={() => removePower(p)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {p}</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Evolution Options */}
            <div className="space-y-3">
              <Label>Evolution Path (Choose One)</Label>
              <RadioGroup value={selectedEvolution} onValueChange={setSelectedEvolution} className="space-y-3">
                {powerType.evolutionOptions.map((evolution, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <RadioGroupItem
                      value={evolution.name}
                      id={`evolution-${index}`}
                      className="border-purple-500/50 text-purple-500"
                    />
                    <div className="grid gap-1">
                      <Label htmlFor={`evolution-${index}`} className="font-medium cursor-pointer">
                        {evolution.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{evolution.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Canonical drawbacks and rules */}
            {powerType.drawbacks && (
              <div className="space-y-1 mt-4 p-3 border border-red-500/30 rounded-md bg-red-950/20">
                <h4 className="font-semibold text-red-300">Canonical Drawbacks</h4>
                <p className="text-sm text-red-100/90">{powerType.drawbacks}</p>
              </div>
            )}
            {powerType.canonNotes && (
              <div className="space-y-1 mt-2 p-3 border border-purple-500/30 rounded-md bg-purple-950/20">
                <h4 className="font-semibold text-purple-300">Canon Rules</h4>
                <p className="text-sm text-purple-100/90">{powerType.canonNotes}</p>
              </div>
            )}

            {/* Additional Power for Tiger Skin */}
            {powerType.additionalPower && (
              <div className="space-y-2 mt-4 p-3 border border-amber-500/30 rounded-md bg-amber-950/20">
                <h4 className="font-semibold text-amber-300">Additional Power: {powerType.additionalPower.name}</h4>
                <p className="text-sm">{powerType.additionalPower.description}</p>
                <div className="space-y-1 mt-2">
                  <h5 className="text-xs font-semibold text-amber-200">Key Aspects:</h5>
                  <ul className="text-xs space-y-1">
                    {powerType.additionalPower.keyAspects.map((aspect, index) => (
                      <li key={index} className="ml-4 list-disc">
                        {aspect}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="description">Power Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe how your character's powers work and connect to their traits..."
            className="min-h-[150px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
            required
          />
        </div>

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
            disabled={powers.length === 0 || !description.trim() || !selectedEvolution}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
