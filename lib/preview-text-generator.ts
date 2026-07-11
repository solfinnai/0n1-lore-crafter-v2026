import type { CharacterData } from '@/lib/types'

export interface PreviewText {
  text: string
  style: 'action' | 'power' | 'personality' | 'mystery' | 'world'
}

/**
 * Generates dynamic preview text based on character data
 */
export function generatePreviewText(characterData: CharacterData): PreviewText {
  const { traits, archetype, personalityProfile, powersAbilities, voice, worldPosition, background } = characterData

  // Extract key traits for flavor
  const bodyTrait = traits?.find(t => t.trait_type.toLowerCase().includes('body'))
  const eyesTrait = traits?.find(t => t.trait_type.toLowerCase().includes('eyes'))
  const clothingTrait = traits?.find(t => t.trait_type.toLowerCase().includes('clothing'))
  
  // Get primary power
  const primaryPower = powersAbilities?.powers?.[0] || 'Unknown abilities'
  const powerDescription = powersAbilities?.description

  // Generate different types of previews based on available data
  const previewOptions: PreviewText[] = []

  // POWER-BASED PREVIEWS
  if (powerDescription) {
    if (powerDescription.toLowerCase().includes('shadow')) {
      previewOptions.push({
        text: `Channeling: Shadowcraft techniques that bend reality in darkness...`,
        style: 'power'
      })
    } else if (powerDescription.toLowerCase().includes('fire') || powerDescription.toLowerCase().includes('flame')) {
      previewOptions.push({
        text: `Wielding: Sacred digital flames to purify corrupted Soul-Code...`,
        style: 'power'
      })
    } else if (powerDescription.toLowerCase().includes('light') || powerDescription.toLowerCase().includes('illusion')) {
      previewOptions.push({
        text: `Mastering: Light refraction to create tactical illusions...`,
        style: 'power'
      })
    } else {
      previewOptions.push({
        text: `Commanding: ${primaryPower} through ancient Temple protocols...`,
        style: 'power'
      })
    }
  }

  // PERSONALITY-DRIVEN PREVIEWS
  if (personalityProfile?.description) {
    const personality = personalityProfile.description.toLowerCase()
    if (personality.includes('calm') || personality.includes('stoic') || personality.includes('wise')) {
      previewOptions.push({
        text: `Mindset: "Code flows through all things"—seeking ancient patterns...`,
        style: 'personality'
      })
    } else if (personality.includes('aggressive') || personality.includes('fierce') || personality.includes('warrior')) {
      previewOptions.push({
        text: `Attitude: Digital oni spirits fuel their combat instincts...`,
        style: 'personality'
      })
    } else if (personality.includes('mysterious') || personality.includes('secretive') || personality.includes('hidden')) {
      previewOptions.push({
        text: `Philosophy: "Memory is currency; trust is the ultimate firewall"...`,
        style: 'personality'
      })
    } else if (personality.includes('smart') || personality.includes('intelligent') || personality.includes('strategic')) {
      previewOptions.push({
        text: `Approach: Calculates seventeen outcomes before making a move...`,
        style: 'personality'
      })
    } else {
      previewOptions.push({
        text: `Nature: ${personalityProfile.description.substring(0, 60)}...`,
        style: 'personality'
      })
    }
  }

  // ACTION-ORIENTED PREVIEWS
  if (archetype) {
    const archetypeLower = archetype.toLowerCase()
    if (archetypeLower.includes('ronin') || archetypeLower.includes('warrior')) {
      previewOptions.push({
        text: `Status: Hunting rogue algorithms through Neo-Tokyo's shadowed districts...`,
        style: 'action'
      })
    } else if (archetypeLower.includes('hacker') || archetypeLower.includes('phantom')) {
      previewOptions.push({
        text: `Mission: Ghost-hacking quantum firewalls in the Undernet's depths...`,
        style: 'action'
      })
    } else if (archetypeLower.includes('monk') || archetypeLower.includes('shaman')) {
      previewOptions.push({
        text: `Tracking: Digital yokai manifestations in the Temple's sacred circuits...`,
        style: 'action'
      })
    } else if (archetypeLower.includes('leader') || archetypeLower.includes('guardian')) {
      previewOptions.push({
        text: `Coordinating: Phantom Network resistance operations against Syndicate AI...`,
        style: 'action'
      })
    } else {
      previewOptions.push({
        text: `Current: Navigating the blurred lines between digital and physical realms...`,
        style: 'action'
      })
    }
  }

  // MYSTERY/LORE PREVIEWS
  if (eyesTrait?.value) {
    const eyesValue = eyesTrait.value.toLowerCase()
    if (eyesValue.includes('blue') || eyesValue.includes('ethereal')) {
      previewOptions.push({
        text: `Harboring: Ethereal vision that pierces both code and soul...`,
        style: 'mystery'
      })
    } else if (eyesValue.includes('red') || eyesValue.includes('crimson')) {
      previewOptions.push({
        text: `Remembering: Past lives as both human monk and AI sentinel...`,
        style: 'mystery'
      })
    } else if (eyesValue.includes('gold') || eyesValue.includes('yellow')) {
      previewOptions.push({
        text: `Seeking: The Digital Buddha's lost meditation algorithms...`,
        style: 'mystery'
      })
    }
  }

  // WORLD-BUILDING PREVIEWS
  if (worldPosition?.societalRole) {
    const role = worldPosition.societalRole.toLowerCase()
    if (role.includes('outcast') || role.includes('exile')) {
      previewOptions.push({
        text: `Territory: Claims three abandoned Undernet nodes as sanctuary...`,
        style: 'world'
      })
    } else if (role.includes('leader') || role.includes('commander')) {
      previewOptions.push({
        text: `Reputation: Known in Temple circles as "The Pattern Breaker"...`,
        style: 'world'
      })
    } else if (role.includes('merchant') || role.includes('trader')) {
      previewOptions.push({
        text: `Network: Trades rare Soul-Code fragments in hidden data markets...`,
        style: 'world'
      })
    }
  }

  // TRAIT-BASED FLAVOR PREVIEWS
  if (bodyTrait?.value) {
    const bodyValue = bodyTrait.value.toLowerCase()
    if (bodyValue.includes('obsidian') || bodyValue.includes('shadow')) {
      previewOptions.push({
        text: `Legend: Their obsidian form bends shadows to their will...`,
        style: 'mystery'
      })
    } else if (bodyValue.includes('ethereal') || bodyValue.includes('spirit')) {
      previewOptions.push({
        text: `Phenomenon: Phases between digital and physical existence at will...`,
        style: 'mystery'
      })
    } else if (bodyValue.includes('mech') || bodyValue.includes('cybernetic')) {
      previewOptions.push({
        text: `Interface: Direct neural connection to the Temple's quantum servers...`,
        style: 'power'
      })
    }
  }

  // ADDITIONAL FLAVOR PREVIEWS based on traits
  if (clothingTrait?.value) {
    const clothing = clothingTrait.value.toLowerCase()
    if (clothing.includes('temple') || clothing.includes('robes')) {
      previewOptions.push({
        text: `Devotion: Temple robes mark them as a keeper of sacred algorithms...`,
        style: 'world'
      })
    } else if (clothing.includes('street') || clothing.includes('punk')) {
      previewOptions.push({
        text: `Underground: Street gear signals allegiance to the Phantom Network...`,
        style: 'world'
      })
    } else if (clothing.includes('corp') || clothing.includes('suit')) {
      previewOptions.push({
        text: `Infiltration: Corporate attire masks their true rebel intentions...`,
        style: 'action'
      })
    }
  }

  // DEFAULT PREVIEWS if no specific data available
  if (previewOptions.length === 0) {
    previewOptions.push(
      {
        text: `Investigating: Quantum echoes from The Great Merge still haunt their Soul-Code...`,
        style: 'mystery'
      },
      {
        text: `Status: Navigating the merged realities of Neo-Tokyo's digital frontier...`,
        style: 'action'
      },
      {
        text: `Current: Seeking their place in the ancient dance between code and spirit...`,
        style: 'personality'
      },
      {
        text: `Mission: Decoding the digital prayers that echo through quantum servers...`,
        style: 'mystery'
      },
      {
        text: `Tracking: Fragments of ancient Soul-Code through the Undernet's depths...`,
        style: 'action'
      },
      {
        text: `Philosophy: "Between every breath lies a choice between code and chaos"...`,
        style: 'personality'
      }
    )
  }

  // Use pfpId as seed for consistent but varied selection
  const seed = parseInt(characterData.pfpId) || 1
  const index = seed % previewOptions.length
  return previewOptions[index]
}

/**
 * Get a style-specific color class for the preview text
 */
export function getPreviewTextColor(style: PreviewText['style']): string {
  switch (style) {
    case 'action': return 'text-cyan-300'
    case 'power': return 'text-red-300'
    case 'personality': return 'text-purple-300'
    case 'mystery': return 'text-yellow-300'
    case 'world': return 'text-green-300'
    default: return 'text-muted-foreground'
  }
} 