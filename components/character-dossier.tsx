"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Sparkles, 
  Heart, 
  Zap, 
  Globe, 
  Target, 
  BookOpen,
  Clock,
  Star,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Image from "next/image"
import type { CharacterData } from "@/lib/types"
import type { CharacterMemoryProfile } from "@/lib/memory-types"
import { getMemoryProfile } from "@/lib/memory-types"

interface CharacterDossierProps {
  characterData: CharacterData
  className?: string
}

export function CharacterDossier({ characterData, className = "" }: CharacterDossierProps) {
  const [memoryProfile, setMemoryProfile] = useState<CharacterMemoryProfile | null>(null)
  const [aiSummary, setAiSummary] = useState<string>("")
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string>("")

  // Load memory profile
  useEffect(() => {
    const profile = getMemoryProfile(characterData.pfpId)
    setMemoryProfile(profile)
  }, [characterData.pfpId])

  // Generate AI summary
  const generateSummary = async () => {
    setIsLoadingSummary(true)
    setSummaryError("")
    
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterData,
          memoryProfile
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setAiSummary(data.summary)
    } catch (error) {
      console.error('Error generating summary:', error)
      setSummaryError('Failed to generate AI summary')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  // Auto-generate summary when component loads
  useEffect(() => {
    if (characterData && !aiSummary && !isLoadingSummary) {
      generateSummary()
    }
  }, [characterData, memoryProfile])

  const getTraitColor = (traitType: string) => {
    const colors: Record<string, string> = {
      'Clothing': 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      'Eyes': 'border-green-500/30 text-green-400 bg-green-500/10',
      'Hair': 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
      'Background': 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      'Strength': 'border-red-500/30 text-red-400 bg-red-500/10',
      'Spirit': 'border-pink-500/30 text-pink-400 bg-pink-500/10',
      'Intelligence': 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      'Dexterity': 'border-orange-500/30 text-orange-400 bg-orange-500/10'
    }
    return colors[traitType] || 'border-gray-500/30 text-gray-400 bg-gray-500/10'
  }

  const formatDate = (date: Date | string) => {
    if (!date) return 'Unknown'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Unknown'
    return d.toLocaleDateString()
  }

  return (
    <Card className={`border border-red-500/40 bg-gradient-to-br from-red-950/20 to-purple-950/20 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-red-400" />
          Character Dossier
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4">
            {/* Character Header */}
            <div className="text-center space-y-3 pb-4">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-red-500/40">
                <Image
                  src={characterData.imageUrl || `/placeholder.svg?height=80&width=80&query=0N1 Force #${characterData.pfpId}`}
                  alt={`0N1 Force #${characterData.pfpId}`}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-xl text-red-300">{characterData.soulName}</h3>
                <p className="text-sm text-red-400/80">0N1 Force #{characterData.pfpId}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                    {characterData.archetype}
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                    {characterData.background}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="bg-red-500/20" />

            {/* Complete Character Profile */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Complete Character Profile
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateSummary}
                  disabled={isLoadingSummary}
                  className="h-6 text-xs"
                >
                  {isLoadingSummary ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                </Button>
              </div>
              
              <ScrollArea className="h-[400px] p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                <div className="space-y-4 text-sm leading-relaxed text-red-100">
                  {isLoadingSummary ? (
                    <div className="flex items-center gap-2 text-red-400/60">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating comprehensive character profile...
                    </div>
                  ) : summaryError ? (
                    <p className="text-red-400/60">{summaryError}</p>
                  ) : (
                    <>
                      {/* Character Overview */}
                      <div>
                        <h5 className="font-semibold text-red-300 mb-2">Character Overview</h5>
                        <p className="mb-3">
                          <strong>{characterData.soulName}</strong> is a {characterData.archetype} from the {characterData.background} background, 
                          embodying the essence of 0N1 Force #{characterData.pfpId}. 
                          {aiSummary && ` ${aiSummary}`}
                        </p>
                      </div>

                      {/* Background & History */}
                      {characterData.background && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Background & History</h5>
                          <p className="mb-3">{characterData.background}</p>
                        </div>
                      )}

                      {/* Personality & Psychology */}
                      {characterData.personalityProfile?.description && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Personality Profile</h5>
                          <p className="mb-3">{characterData.personalityProfile.description}</p>
                        </div>
                      )}

                      {/* Hopes, Dreams & Fears */}
                      {(characterData.hopesFears?.hopes || characterData.hopesFears?.fears) && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Inner Motivations</h5>
                          {characterData.hopesFears.hopes && (
                            <p className="mb-2"><span className="font-medium text-green-300">Hopes & Dreams:</span> {characterData.hopesFears.hopes}</p>
                          )}
                          {characterData.hopesFears.fears && (
                            <p className="mb-3"><span className="font-medium text-red-300">Fears & Anxieties:</span> {characterData.hopesFears.fears}</p>
                          )}
                        </div>
                      )}

                      {/* Core Motivations */}
                      {(characterData.motivations?.drives || characterData.motivations?.goals || characterData.motivations?.values) && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Core Motivations</h5>
                          {characterData.motivations.drives && (
                            <p className="mb-2"><span className="font-medium text-purple-300">Primary Drives:</span> {characterData.motivations.drives}</p>
                          )}
                          {characterData.motivations.goals && (
                            <p className="mb-2"><span className="font-medium text-blue-300">Life Goals:</span> {characterData.motivations.goals}</p>
                          )}
                          {characterData.motivations.values && (
                            <p className="mb-3"><span className="font-medium text-yellow-300">Core Values:</span> {characterData.motivations.values}</p>
                          )}
                        </div>
                      )}

                      {/* Relationships & Social Position */}
                      {(characterData.relationships?.friends || characterData.relationships?.rivals || characterData.relationships?.family) && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Relationships & Social Bonds</h5>
                          {characterData.relationships.friends && (
                            <p className="mb-2"><span className="font-medium text-green-300">Allies & Friends:</span> {characterData.relationships.friends}</p>
                          )}
                          {characterData.relationships.rivals && (
                            <p className="mb-2"><span className="font-medium text-red-400">Rivals & Enemies:</span> {characterData.relationships.rivals}</p>
                          )}
                          {characterData.relationships.family && (
                            <p className="mb-3"><span className="font-medium text-blue-300">Family Connections:</span> {characterData.relationships.family}</p>
                          )}
                        </div>
                      )}

                      {/* World Position & Status */}
                      {(characterData.worldPosition?.societalRole || characterData.worldPosition?.classStatus || characterData.worldPosition?.perception) && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">World Position & Status</h5>
                          {characterData.worldPosition.societalRole && (
                            <p className="mb-2"><span className="font-medium text-orange-300">Societal Role:</span> {characterData.worldPosition.societalRole}</p>
                          )}
                          {characterData.worldPosition.classStatus && (
                            <p className="mb-2"><span className="font-medium text-cyan-300">Social Class:</span> {characterData.worldPosition.classStatus}</p>
                          )}
                          {characterData.worldPosition.perception && (
                            <p className="mb-3"><span className="font-medium text-pink-300">Public Perception:</span> {characterData.worldPosition.perception}</p>
                          )}
                        </div>
                      )}

                      {/* Voice & Communication */}
                      {(characterData.voice?.speechStyle || characterData.voice?.innerDialogue || characterData.voice?.uniquePhrases) && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Voice & Communication Style</h5>
                          {characterData.voice.speechStyle && (
                            <p className="mb-2"><span className="font-medium text-purple-300">Speech Style:</span> {characterData.voice.speechStyle}</p>
                          )}
                          {characterData.voice.innerDialogue && (
                            <p className="mb-2"><span className="font-medium text-blue-300">Inner Voice:</span> {characterData.voice.innerDialogue}</p>
                          )}
                          {characterData.voice.uniquePhrases && (
                            <p className="mb-3"><span className="font-medium text-green-300">Signature Phrases:</span> {characterData.voice.uniquePhrases}</p>
                          )}
                        </div>
                      )}

                      {/* Powers & Abilities */}
                      {characterData.powersAbilities && (characterData.powersAbilities.description || characterData.powersAbilities.powers.length > 0) && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Powers & Abilities</h5>
                          {characterData.powersAbilities.powers.length > 0 && (
                            <p className="mb-2"><span className="font-medium text-yellow-300">Active Powers:</span> {characterData.powersAbilities.powers.join(", ")}</p>
                          )}
                          {characterData.powersAbilities.description && (
                            <p className="mb-3">{characterData.powersAbilities.description}</p>
                          )}
                        </div>
                      )}

                      {/* Symbolism & Meaning */}
                      {(characterData.symbolism?.colors || characterData.symbolism?.items || characterData.symbolism?.motifs) && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Symbolic Elements</h5>
                          {characterData.symbolism.colors && (
                            <p className="mb-2"><span className="font-medium text-rainbow-300">Signature Colors:</span> {characterData.symbolism.colors}</p>
                          )}
                          {characterData.symbolism.items && (
                            <p className="mb-2"><span className="font-medium text-cyan-300">Important Items:</span> {characterData.symbolism.items}</p>
                          )}
                          {characterData.symbolism.motifs && (
                            <p className="mb-3"><span className="font-medium text-pink-300">Personal Motifs:</span> {characterData.symbolism.motifs}</p>
                          )}
                        </div>
                      )}

                      {/* Recent Developments */}
                      {memoryProfile && (
                        <div>
                          <h5 className="font-semibold text-red-300 mb-2">Recent Developments</h5>
                          <div className="space-y-2">
                            {memoryProfile.overview.keyMilestones.length > 0 && (
                              <div>
                                <span className="font-medium text-blue-300">Latest Milestones:</span>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {memoryProfile.overview.keyMilestones
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 3)
                                    .map((milestone) => (
                                      <li key={milestone.id} className="text-red-100/90 mb-1">
                                        {milestone.title} - {milestone.description}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}

                            {memoryProfile.characterEvolution.newTraits.length > 0 && (
                              <div className="mt-3">
                                <span className="font-medium text-green-300">Acquired Traits:</span>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {memoryProfile.characterEvolution.newTraits.slice(0, 3).map((trait) => (
                                    <li key={trait.id} className="text-red-100/90 mb-1">
                                      <strong>{trait.traitName}:</strong> {trait.description}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {memoryProfile.contextNotes.plotHooks.filter(p => p.status === 'active').length > 0 && (
                              <div className="mt-3">
                                <span className="font-medium text-orange-300">Active Storylines:</span>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {memoryProfile.contextNotes.plotHooks
                                    .filter(p => p.status === 'active')
                                    .slice(0, 3)
                                    .map((plot) => (
                                      <li key={plot.id} className="text-red-100/90 mb-1">
                                        <strong>{plot.title}:</strong> {plot.description}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}

                            <div className="mt-3 p-2 rounded bg-red-800/30 border border-red-500/20">
                              <span className="font-medium text-red-200">Current Status:</span> {memoryProfile.overview.relationshipLevel} relationship • {memoryProfile.overview.totalInteractions} total interactions
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            <Separator className="bg-red-500/20" />

            {/* Core Traits */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Core Traits
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {characterData.traits.slice(0, 6).map((trait, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-md border text-xs ${getTraitColor(trait.trait_type)}`}
                  >
                    <div className="font-medium">{trait.trait_type}</div>
                    <div className="text-xs opacity-80">{trait.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {memoryProfile && (
              <>
                <Separator className="bg-red-500/20" />

                {/* Relationship Status */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Relationship Status
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded-lg bg-red-900/20 border border-red-500/20">
                      <div className="text-xs text-red-400/80">Level</div>
                      <div className="text-sm font-medium text-red-200 capitalize">
                        {memoryProfile.overview.relationshipLevel}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-red-900/20 border border-red-500/20">
                      <div className="text-xs text-red-400/80">Interactions</div>
                      <div className="text-sm font-medium text-red-200">
                        {memoryProfile.overview.totalInteractions}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acquired Traits */}
                {memoryProfile.characterEvolution.newTraits.length > 0 && (
                  <>
                    <Separator className="bg-red-500/20" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Acquired Traits
                      </h4>
                      <div className="space-y-2">
                        {memoryProfile.characterEvolution.newTraits.slice(0, 3).map((trait) => (
                          <div key={trait.id} className="p-2 rounded-lg bg-green-900/20 border border-green-500/20">
                            <div className="font-medium text-sm text-green-300">{trait.traitName}</div>
                            <div className="text-xs text-green-400/80 line-clamp-2">{trait.description}</div>
                            <div className="text-xs text-green-400/60 mt-1">
                              Acquired {formatDate(trait.dateAcquired)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Key Relationships */}
                {memoryProfile.characterEvolution.relationships.length > 0 && (
                  <>
                    <Separator className="bg-red-500/20" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Key Relationships
                      </h4>
                      <div className="space-y-2">
                        {memoryProfile.characterEvolution.relationships.slice(0, 3).map((relationship) => (
                          <div key={relationship.id} className="p-2 rounded-lg bg-purple-900/20 border border-purple-500/20">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm text-purple-300">{relationship.name}</div>
                              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                {relationship.type}
                              </Badge>
                            </div>
                            <div className="text-xs text-purple-400/80 line-clamp-1">
                              {relationship.relationshipType}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Active Plot Hooks */}
                {memoryProfile.contextNotes.plotHooks.filter(p => p.status === 'active').length > 0 && (
                  <>
                    <Separator className="bg-red-500/20" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Active Plot Hooks
                      </h4>
                      <div className="space-y-2">
                        {memoryProfile.contextNotes.plotHooks
                          .filter(p => p.status === 'active')
                          .slice(0, 2)
                          .map((plot) => (
                            <div key={plot.id} className="p-2 rounded-lg bg-orange-900/20 border border-orange-500/20">
                              <div className="font-medium text-sm text-orange-300">{plot.title}</div>
                              <div className="text-xs text-orange-400/80 line-clamp-2">{plot.description}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Recent Milestones */}
                {memoryProfile.overview.keyMilestones.length > 0 && (
                  <>
                    <Separator className="bg-red-500/20" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Milestones
                      </h4>
                      <div className="space-y-2">
                        {memoryProfile.overview.keyMilestones
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 2)
                          .map((milestone) => (
                            <div key={milestone.id} className="p-2 rounded-lg bg-blue-900/20 border border-blue-500/20">
                              <div className="font-medium text-sm text-blue-300">{milestone.title}</div>
                              <div className="text-xs text-blue-400/80 line-clamp-2">{milestone.description}</div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-xs text-blue-400/60">{formatDate(milestone.date)}</div>
                                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                                  {milestone.significance}/10
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {/* World Building Elements */}
                {memoryProfile.contextNotes.worldBuilding.length > 0 && (
                  <>
                    <Separator className="bg-red-500/20" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        World Elements
                      </h4>
                      <div className="space-y-2">
                        {memoryProfile.contextNotes.worldBuilding.slice(0, 2).map((world) => (
                          <div key={world.id} className="p-2 rounded-lg bg-cyan-900/20 border border-cyan-500/20">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm text-cyan-300">{world.name}</div>
                              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                                {world.type}
                              </Badge>
                            </div>
                            <div className="text-xs text-cyan-400/80 line-clamp-2">{world.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Powers and Abilities */}
            {characterData.powersAbilities && (
              <>
                <Separator className="bg-red-500/20" />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Powers & Abilities
                  </h4>
                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20">
                    <p className="text-sm text-red-100 leading-relaxed">
                      {characterData.powersAbilities.description || "Powers and abilities not yet defined."}
                    </p>
                    {characterData.powersAbilities.powers && characterData.powersAbilities.powers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {characterData.powersAbilities.powers.slice(0, 4).map((power, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-red-500/30 text-red-400">
                            {power}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="pb-4" />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 