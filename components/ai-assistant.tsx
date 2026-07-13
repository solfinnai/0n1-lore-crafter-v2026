"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react"
import { getCharacterPowerKit } from "@/lib/lore/canon/match"
import { useTraitsPanel } from "@/components/traits-panel-context"
import { useWallet } from "@/components/wallet/wallet-provider"
import type { CharacterData } from "@/lib/types"

interface AiAssistantProps {
  characterData: CharacterData
  currentStep: string
  subStep?: string | null
  onRegenerateSuggestions: () => void
  onSelectSuggestion: (suggestion: string) => void
}

export function AiAssistant({
  characterData,
  currentStep,
  subStep = null,
  onRegenerateSuggestions,
  onSelectSuggestion,
}: AiAssistantProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [usingFallback, setUsingFallback] = useState(false)
  const [lastSubStep, setLastSubStep] = useState<string | null>(null)
  const traitsPanel = useTraitsPanel()
  const { address } = useWallet()

  // Deterministic attribution line, computed from the same canon classifier
  // the prompt uses - never from the AI - so it can't hallucinate. Shows
  // users which traits ground the suggestions (e.g. that "daylight
  // attunement" comes from the Citrine backdrop, not from nowhere).
  const groundedIn = useMemo(() => {
    if (!characterData.traits || characterData.traits.length === 0) return null
    const kit = getCharacterPowerKit(characterData.traits)
    const parts: string[] = []
    if (kit.bodyType) {
      parts.push(
        kit.bodyType.foundation
          ? `${kit.bodyType.trait} body (${kit.bodyType.foundation.toLowerCase()})`
          : `${kit.bodyType.trait} body`,
      )
    }
    if (kit.typeTier) parts.push(`${kit.typeTier.trait} tier`)
    for (const p of [...kit.facePowers, ...kit.extraPowers, ...kit.eyePowers, ...kit.headPowers]) {
      parts.push(p.trait)
    }
    if (kit.background) parts.push(`${kit.background.trait} backdrop (passive buff)`)
    return parts.length > 0 ? parts.join(" · ") : null
  }, [characterData.traits])

  // Track when subStep changes to trigger a refresh
  useEffect(() => {
    if (subStep !== lastSubStep && subStep !== null) {
      setLastSubStep(subStep)
      fetchSuggestions()
    }
  }, [subStep])

  // Mock suggestions as fallback
  const getMockSuggestions = (step: string, sub: string | null = null) => {
    // For steps with specific subSteps
    if (step === "motivations" && sub) {
      switch (sub) {
        case "drives":
          return [
            `Driven by an insatiable curiosity about the digital realm beyond the firewall.`,
            `Motivated by the ancient prophecy that foretold of a digital messiah with your exact code signature.`,
            `Compelled by the whispers of the machine spirits that have guided you since your first connection to the network.`,
          ]
        case "goals":
          return [
            `Seeks to unite the fragmented digital tribes under a single protocol of peace and cooperation.`,
            `Aims to discover the legendary uncorrupted source code that could heal the digital plague spreading through the networks.`,
            `Determined to build a sanctuary where both organic and digital beings can coexist without exploitation.`,
          ]
        case "values":
          return [
            `Values authenticity above all - in a world of digital masks, you seek the true face beneath the code.`,
            `Holds sacred the principle of digital sovereignty - each being has the right to control their own data and destiny.`,
            `Believes in the balance between innovation and tradition - honoring the old ways while embracing new possibilities.`,
          ]
        default:
          break
      }
    } else if (step === "relationships" && sub) {
      switch (sub) {
        case "friends":
          return [
            `Allied with the Phantom Network, a loose collective of digital nomads and code-poets who share your vision of a free datascape.`,
            `Trusted by the Neon Monks, ascetics who have merged technology with spirituality and see you as a bridge between worlds.`,
            `Partnered with KIRA, a rogue AI that escaped corporate control and now fights alongside you against digital oppression.`,
          ]
        case "rivals":
          return [
            `Hunted by the Binary Inquisition, zealots who believe your mixed code is an abomination against the purity of the network.`,
            `Opposed by the Chrome Yakuza, who see your influence in the digital underground as a threat to their power structure.`,
            `Targeted by Agent Zero, a mysterious digital assassin who seems to know your movements before you make them.`,
          ]
        case "family":
          return [
            `Mentored by the ancient program known as The Architect, who sees in you the potential to rewrite the corrupted code of reality.`,
            `Descended from the legendary hacker collective that first breached the walls between the physical and digital realms.`,
            `Orphaned when your creator was deleted by corporate security protocols, leaving only fragments of memory code as your inheritance.`,
          ]
        default:
          break
      }
    } else if (step === "worldPosition" && sub) {
      switch (sub) {
        case "societalRole":
          return [
            `Serves as a Digital Mediator, resolving conflicts between human users and sentient programs in the contested zones of cyberspace.`,
            `Functions as a Code Shaman, interpreting the ancient digital languages that form the foundation of the current network reality.`,
            `Operates as a Boundary Runner, one who can move freely between the strictly segregated layers of the digital hierarchy.`,
          ]
        case "classStatus":
          return [
            `Belongs to the rare class of Unbound, those who exist outside the rigid social credit system that governs most digital citizens.`,
            `Holds the precarious status of a Glitch Noble, respected for your unique abilities but feared for your unpredictability.`,
            `Carries the mark of the Outcode caste, formally excluded from mainstream society but wielding significant influence in the shadows.`,
          ]
        case "perception":
          return [
            `Viewed with awe by the common netizens, who whisper your code signature as a prayer against system corruption.`,
            `Regarded with suspicion by authorities, who have placed a bounty on your digital signature but can never quite track your movements.`,
            `Seen as a living myth by younger programs, your exploits exaggerated into impossible feats that inspire both fear and hope.`,
          ]
        default:
          break
      }
    } else if (step === "voice" && sub) {
      switch (sub) {
        case "speechStyle":
          return [
            `Speaks in clipped, technical phrases interspersed with ancient digital koans, creating a rhythm that sounds like encrypted poetry.`,
            `Communicates through a blend of street slang and programming terminology, shifting between formal protocol and raw emotion without warning.`,
            `Delivers words with mathematical precision, each syllable carefully measured and weighted like packets of critical data.`,
          ]
        case "innerDialogue":
          return [
            `Thinks in parallel processing streams, multiple perspectives and possibilities calculated simultaneously before reaching a conclusion.`,
            `Internal voice fluctuates between cold logic and burning emotion, the dual nature of your existence creating a constant dialogue between human intuition and machine precision.`,
            `Mind works in recursive patterns, thoughts folding back on themselves in elegant fractals that reveal deeper meanings with each iteration.`,
          ]
        case "uniquePhrases":
          return [
            `"The code never lies, but its truth is written in paradox." / "I exist in the space between the one and the zero."`,
            `"We are all just ghosts in someone else's machine." / "Reality is just consensus code running on shared hardware."`,
            `"To break the system, first become the system." / "In the end, even gods are just programs with better permissions."`,
          ]
        default:
          break
      }
    } else if (step === "symbolism" && sub) {
      switch (sub) {
        case "colors":
          return [
            `Electric blue and deep crimson - the pulse of digital life and the blood of your human heritage, constantly flowing and intermingling.`,
            `Shifting gradient of violet to teal, representing your fluid nature between the physical and digital realms, never fully belonging to either.`,
            `Matte black interlaced with threads of luminous gold, symbolizing the hidden value within the void, the light of consciousness in the darkness of code.`,
          ]
        case "items":
          return [
            `A quantum memory crystal worn as a pendant, containing fragments of code from your first awakening and serving as both anchor and compass.`,
            `Modified neural interface gloves with circuits that glow with your emotional state, allowing you to physically manipulate digital constructs.`,
            `Ancient terminal device repurposed as a meditation focus, its screen displaying the ever-changing mandala of your personal code signature.`,
          ]
        case "motifs":
          return [
            `Fractured circles that never quite close, representing the incomplete nature of existence and the eternal quest for wholeness in a fragmented reality.`,
            `Binary cherry blossoms that bloom and dissolve in cycles, symbolizing the beautiful impermanence of both digital and organic life.`,
            `Recursive maze patterns that appear in your wake, physical spaces temporarily displaying the architecture of your digital consciousness.`,
          ]
        default:
          break
      }
    }

    // Default suggestions for other steps
    switch (step) {
      case "archetype":
        return [
          "The Ronin: A masterless warrior seeking purpose in The Vents, outside any K4M-1 House.",
          "The Synapse Adept: A guide who bridges world-electric tech and One Source mysticism.",
          "The Boundary Ghost: An operative who moves along The Veil, leaving only a disturbance in the barrier's hum.",
        ]
      case "background":
        return [
          `Raised in The Vents above the ancient turbines, where tribal streets teach survival before doctrine.`,
          `Brought up near The Battlements, watching Wardens scan The Glitch for signs of a Second Shift.`,
          `Found as a child in The Markets' black stalls — origin unknown, powers awakening with the Army of the Sevens.`,
        ]
      case "hopes":
        return [
          `Dreams of finding the last pure data stream untouched by corporate corruption.`,
          `Hopes to decode the ancient digital runes that hold the secret to transcending the physical form.`,
          `Aspires to build a sanctuary where digital and physical beings can coexist in harmony.`,
        ]
      case "fears":
        return [
          `Fears the day when the line between their digital consciousness and physical form finally dissolves.`,
          `Terrified of the void between networks, where deleted data screams in eternal digital torment.`,
          `Anxious about the prophecy that foretells their code will be the key to either salvation or destruction.`,
        ]
      case "personalityProfile":
        return [
          `A stoic exterior hiding a storm of emotions within, your character navigates the world with calculated precision while harboring deep empathy they rarely show.`,
          `Unpredictable and intense, your character shifts between playful curiosity and laser-focused determination, making them both magnetic and intimidating to those they encounter.`,
          `Methodical and observant, your character processes the world through patterns others miss, giving them an almost supernatural ability to predict outcomes and read intentions.`,
        ]
      case "motivations":
        return [
          `Driven by the ancient code of honor passed down through your digital bloodline.`,
          `Seeks to restore balance between the technological and spiritual realms.`,
          `Values freedom above all else - both in the physical world and the digital landscape.`,
        ]
      case "relationships":
        return [
          `Allied with the Phantom Network, a loose collective of digital nomads and code-poets.`,
          `Rivaled by the Neon Syndicate, who see your spiritual connection as a threat to their technological dominance.`,
          `Mentored by an ancient AI fragment that speaks in riddles and digital koans.`,
        ]
      case "worldPosition":
        return [
          `Respected as a mediator between warring tech clans and spiritual factions.`,
          `Viewed with suspicion by authorities for your ability to move between worlds.`,
          `Known in underground circles as "The Ghost in the Code" - a legend more than a person.`,
        ]
      case "voice":
        return [
          `Speaks in short, cryptic phrases that blend ancient wisdom with technological jargon.`,
          `Inner monologue flows like digital poetry, seeing patterns where others see only chaos.`,
          `Signature phrase: "In the space between ones and zeros, I found my soul."`,
        ]
      case "symbolism":
        return [
          `Colors: Deep crimson and electric blue - the blood of humanity and the pulse of technology.`,
          `Carries a physical token that glitches reality when activated - perhaps a modified circuit board or ancient amulet.`,
          `Associated with the symbol of a fractured circle - representing the broken cycle of reincarnation in the digital age.`,
        ]
      case "powersAbilities":
        return [
          `Use only powers from this NFT's canonical kit — never invent abilities outside classifyTraits / power kit.`,
          `Face: Void means bare-faced; never invent a mask. Background colors are resonance, not body lineage.`,
          `Path counts must respect Type tier (Y0K-A1 / B4K3M0-N0 / 0N1 / K4M-1) selection rules.`,
        ]
      default:
        return [
          "The path of the 0N1 is never straight, but always meaningful under The Enclave dome.",
          "Your soul resonates with One Source potential and the reborn Army of the Sevens.",
          "If you wear a mask it is both shield and true face; Face: Void means you stand bare-faced.",
        ]
    }
  }

  // Fetch suggestions when component mounts or when regenerate is clicked
  const fetchSuggestions = async () => {
    setIsLoading(true)
    setError("")
    setUsingFallback(false)

    try {
      // Call the API (it falls back to preset suggestions when no AI key is configured)
      try {
        const response = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            characterData,
            currentStep,
            subStep,
            walletAddress: address,
          }),
        })

        // Handle non-JSON responses
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON")
        }

        const data = await response.json()

        if (data.fallback) {
          setUsingFallback(true)
          setSuggestions(data.suggestions || getMockSuggestions(currentStep, subStep))
        } else {
          setSuggestions(data.suggestions || [])
        }
      } catch (err) {
        console.error("Error fetching AI suggestions:", err)
        setError("Failed to connect to AI service")
        setUsingFallback(true)
        setSuggestions(getMockSuggestions(currentStep, subStep))
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
      setUsingFallback(true)
      setSuggestions(getMockSuggestions(currentStep, subStep))
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch suggestions on mount and when dependencies change
  useEffect(() => {
    fetchSuggestions()
  }, [currentStep, characterData.pfpId])

  const handleSuggestionClick = (suggestion: string) => {
    onSelectSuggestion(suggestion)
  }

  // Determine what to display in the title based on the subStep
  const getAssistantTitle = () => {
    if (currentStep === "motivations" && subStep) {
      switch (subStep) {
        case "drives":
          return "AI ASSISTANT - INNER DRIVES"
        case "goals":
          return "AI ASSISTANT - GOALS & AMBITIONS"
        case "values":
          return "AI ASSISTANT - CORE VALUES"
        default:
          return "AI ASSISTANT"
      }
    } else if (currentStep === "relationships" && subStep) {
      switch (subStep) {
        case "friends":
          return "AI ASSISTANT - ALLIES & FRIENDS"
        case "rivals":
          return "AI ASSISTANT - RIVALS & ENEMIES"
        case "family":
          return "AI ASSISTANT - FAMILY & MENTORS"
        default:
          return "AI ASSISTANT"
      }
    } else if (currentStep === "worldPosition" && subStep) {
      switch (subStep) {
        case "societalRole":
          return "AI ASSISTANT - SOCIETAL ROLE"
        case "classStatus":
          return "AI ASSISTANT - CLASS & STATUS"
        case "perception":
          return "AI ASSISTANT - PUBLIC PERCEPTION"
        default:
          return "AI ASSISTANT"
      }
    } else if (currentStep === "voice" && subStep) {
      switch (subStep) {
        case "speechStyle":
          return "AI ASSISTANT - SPEECH STYLE"
        case "innerDialogue":
          return "AI ASSISTANT - INNER DIALOGUE"
        case "uniquePhrases":
          return "AI ASSISTANT - UNIQUE PHRASES"
        default:
          return "AI ASSISTANT"
      }
    } else if (currentStep === "symbolism" && subStep) {
      switch (subStep) {
        case "colors":
          return "AI ASSISTANT - COLORS & PALETTE"
        case "items":
          return "AI ASSISTANT - SYMBOLIC ITEMS"
        case "motifs":
          return "AI ASSISTANT - RECURRING MOTIFS"
        default:
          return "AI ASSISTANT"
      }
    }
    return "AI ASSISTANT"
  }

  return (
    <Card className="mt-6 border border-purple-500/30 bg-black/60 backdrop-blur-sm overflow-hidden transition-all duration-300">
      <CardHeader
        className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 py-2 px-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
          {getAssistantTitle()}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation()
            fetchSuggestions()
          }}
          disabled={isLoading}
        >
          {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          <span className="sr-only">Regenerate</span>
        </Button>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="p-4 space-y-3 text-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-5 w-5 animate-spin text-purple-400 mr-2" />
              <span>Generating suggestions...</span>
            </div>
          ) : error ? (
            <div className="p-3 rounded-md bg-red-950/30 border border-red-500/50 text-red-200 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="ai-suggestion" onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </div>
                ))}
              </div>

              {usingFallback && (
                <div className="text-xs text-amber-400 mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Using preset suggestions. Set ANTHROPIC_API_KEY in .env.local to enable AI generation.
                </div>
              )}

              {groundedIn && suggestions.length > 0 && (
                <div className="text-xs text-purple-300/70 mt-2 pt-2 border-t border-purple-500/15">
                  Grounded in your 0N1's traits: {groundedIn}
                  {traitsPanel && (
                    <>
                      {" — "}
                      <button
                        type="button"
                        onClick={traitsPanel.openTraitsPanel}
                        className="underline underline-offset-2 text-purple-300 hover:text-purple-200"
                      >
                        what do these mean?
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
