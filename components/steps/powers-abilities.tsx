"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { CharacterData } from "@/lib/types"
import { getPowerByBodyType, getDefaultPowerType, type PowerType } from "@/lib/powers"
import { getPathSelectionRules, getComboElements, type PathSelectionRules } from "@/lib/lore/canon/selection-rules"
import { getCharacterPowerKit } from "@/lib/lore/canon/match"
import { AlertTriangle } from "lucide-react"

interface PowersAbilitiesProps {
  characterData: CharacterData
  updateCharacterData: (data: Partial<CharacterData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function PowersAbilities({ characterData, updateCharacterData, nextStep, prevStep }: PowersAbilitiesProps) {
  const [powerType, setPowerType] = useState<PowerType | null>(null)
  const [rules, setRules] = useState<PathSelectionRules | null>(null)
  const [typeTier, setTypeTier] = useState<string | null>(null)
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [description, setDescription] = useState(characterData.powersAbilities?.description || "")

  // Determine the body type + tier from traits and set the power type and canon rules
  useEffect(() => {
    let foundPowerType: PowerType | null = null

    if (characterData.traits && characterData.traits.length > 0) {
      const bodyTrait = characterData.traits.find(
        (trait) =>
          trait.trait_type.toLowerCase() === "body" ||
          trait.trait_type.toLowerCase() === "skin" ||
          trait.trait_type.toLowerCase() === "body type",
      )
      if (bodyTrait) {
        foundPowerType = getPowerByBodyType(bodyTrait.value) ?? null
      }
    }

    const resolved = foundPowerType || getDefaultPowerType()
    setPowerType(resolved)

    const kit = getCharacterPowerKit(characterData.traits || [])
    const tier = kit.typeTier?.trait ?? null
    setTypeTier(tier)
    setRules(getPathSelectionRules(resolved.bodyType, tier))

    // Restore previously chosen paths from a saved soul
    const pathNames = new Set(resolved.evolutionOptions.map((o) => o.name.toLowerCase()))
    const savedPaths = (characterData.powersAbilities?.powers || []).filter((p) => pathNames.has(p.toLowerCase()))
    setSelectedPaths(savedPaths)

    if (!characterData.powersAbilities?.description) {
      setDescription(resolved.corePower.description)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterData.traits])

  const maxPaths = rules?.count ?? 1

  // For Citrine multi-combo rule: elements already claimed by chosen combos
  const claimedElements = useMemo(() => {
    if (!rules?.disjointElements) return []
    return selectedPaths.flatMap(getComboElements)
  }, [selectedPaths, rules])

  const togglePath = (name: string) => {
    setSelectedPaths((prev) => {
      if (prev.includes(name)) return prev.filter((p) => p !== name)
      if (maxPaths === 1) return [name] // radio-like behavior for single choice
      if (prev.length >= maxPaths) return prev
      return [...prev, name]
    })
  }

  const isPathDisabled = (name: string): boolean => {
    if (selectedPaths.includes(name)) return false
    if (maxPaths > 1 && selectedPaths.length >= maxPaths) return true
    if (rules?.disjointElements) {
      const elements = getComboElements(name)
      if (elements.some((el) => claimedElements.includes(el))) return true
    }
    return false
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!powerType) return
    updateCharacterData({
      powersAbilities: {
        powers: [powerType.corePower.name, ...selectedPaths],
        description,
      },
    })
    nextStep()
  }

  if (!powerType || !rules) {
    return <div>Loading powers...</div>
  }

  const remaining = maxPaths - selectedPaths.length

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Powers & Abilities</h2>
        <p className="text-muted-foreground">
          Your character's powers come from their NFT's traits. Choose the development path
          {maxPaths > 1 ? "s" : ""} they specialize in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xl font-bold">Body Type: {powerType.bodyType}</h3>
              <div className="flex gap-2">
                {typeTier && (
                  <Badge variant="outline" className="bg-pink-900/40 text-pink-200 border-pink-500/30">
                    {typeTier}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-purple-900/50 text-purple-200 border-purple-500/30">
                  {powerType.foundation}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-purple-300">Core Power: {powerType.corePower.name}</h4>
              <p className="text-sm">{powerType.corePower.description}</p>
            </div>

            {/* Canon selection rule */}
            <div className="p-3 border border-purple-500/30 rounded-md bg-purple-950/30 text-sm text-purple-200">
              {rules.rule}
              {rules.extrapolated && (
                <span className="block mt-1 text-purple-300/70 italic">
                  (Your tier's exact allowance is still being finalized in canon.)
                </span>
              )}
            </div>

            {/* Development path selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Development Path{maxPaths > 1 ? "s" : ""} — choose {maxPaths}
                </Label>
                <Badge
                  className={
                    remaining === 0
                      ? "bg-green-700/70 text-green-100"
                      : "bg-purple-900/60 text-purple-200 border border-purple-500/30"
                  }
                >
                  {selectedPaths.length} / {maxPaths} chosen
                </Badge>
              </div>

              <div className="space-y-2">
                {powerType.evolutionOptions.map((evolution, index) => {
                  const checked = selectedPaths.includes(evolution.name)
                  const disabled = isPathDisabled(evolution.name)
                  return (
                    <label
                      key={index}
                      htmlFor={`path-${index}`}
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        checked
                          ? "border-purple-400 bg-purple-900/40"
                          : disabled
                            ? "border-purple-500/10 bg-black/30 opacity-45 cursor-not-allowed"
                            : "border-purple-500/25 bg-black/40 hover:bg-purple-950/40"
                      }`}
                    >
                      <Checkbox
                        id={`path-${index}`}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => togglePath(evolution.name)}
                        className="mt-0.5 border-purple-500/50 data-[state=checked]:bg-purple-600"
                      />
                      <div className="grid gap-1">
                        <span className="font-medium">{evolution.name}</span>
                        <span className="text-sm text-muted-foreground">{evolution.description}</span>
                      </div>
                    </label>
                  )
                })}
              </div>

              {rules.disjointElements && selectedPaths.length > 0 && remaining > 0 && (
                <p className="text-xs text-purple-300/80 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Combos sharing an element with {selectedPaths.join(" or ")} are locked — your pairs must cover
                  distinct elements.
                </p>
              )}
            </div>

            {/* Canonical drawbacks and rules */}
            {powerType.drawbacks && (
              <div className="space-y-1 p-3 border border-red-500/30 rounded-md bg-red-950/20">
                <h4 className="font-semibold text-red-300">Canonical Drawbacks</h4>
                <p className="text-sm text-red-100/90">{powerType.drawbacks}</p>
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
            disabled={selectedPaths.length !== maxPaths || !description.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
