import type { CharacterData } from '@/lib/types'

export interface PreviewText {
  text: string
  style: 'action' | 'power' | 'personality' | 'mystery' | 'world'
}

/**
 * Generates dynamic preview text based on character data (Enclave canon only).
 */
export function generatePreviewText(characterData: CharacterData): PreviewText {
  const { traits, archetype, personalityProfile, powersAbilities, worldPosition } = characterData

  const bodyTrait = traits?.find(t => t.trait_type.toLowerCase().includes('body'))
  const eyesTrait = traits?.find(t => t.trait_type.toLowerCase().includes('eyes'))
  const clothingTrait = traits?.find(t => t.trait_type.toLowerCase().includes('wear') || t.trait_type.toLowerCase().includes('clothing'))

  const primaryPower = powersAbilities?.powers?.[0] || 'Unknown abilities'
  const powerDescription = powersAbilities?.description

  const previewOptions: PreviewText[] = []

  if (powerDescription) {
    if (powerDescription.toLowerCase().includes('shadow')) {
      previewOptions.push({
        text: `Channeling: Shadow techniques that bend the Veil's edges...`,
        style: 'power'
      })
    } else if (powerDescription.toLowerCase().includes('fire') || powerDescription.toLowerCase().includes('flame') || powerDescription.toLowerCase().includes('elemental')) {
      previewOptions.push({
        text: `Wielding: One Source currents to purge Akuma corruption...`,
        style: 'power'
      })
    } else if (powerDescription.toLowerCase().includes('light') || powerDescription.toLowerCase().includes('illusion')) {
      previewOptions.push({
        text: `Mastering: Light and perception tricks across Enclave streets...`,
        style: 'power'
      })
    } else {
      previewOptions.push({
        text: `Commanding: ${primaryPower} through their body lineage path...`,
        style: 'power'
      })
    }
  }

  if (personalityProfile?.description) {
    const personality = personalityProfile.description.toLowerCase()
    if (personality.includes('calm') || personality.includes('stoic') || personality.includes('wise')) {
      previewOptions.push({
        text: `Mindset: Listening for the Gen3sis current beneath the city...`,
        style: 'personality'
      })
    } else if (personality.includes('aggressive') || personality.includes('fierce') || personality.includes('warrior')) {
      previewOptions.push({
        text: `Attitude: Oni combat instinct sharpened on Battlements watch...`,
        style: 'personality'
      })
    } else if (personality.includes('mysterious') || personality.includes('secretive') || personality.includes('hidden')) {
      previewOptions.push({
        text: `Philosophy: "Trust is scarce under the dome; memory is leverage"...`,
        style: 'personality'
      })
    } else if (personality.includes('smart') || personality.includes('intelligent') || personality.includes('strategic')) {
      previewOptions.push({
        text: `Approach: Maps seventeen House outcomes before committing...`,
        style: 'personality'
      })
    } else {
      previewOptions.push({
        text: `Nature: ${personalityProfile.description.substring(0, 60)}...`,
        style: 'personality'
      })
    }
  }

  if (archetype) {
    const archetypeLower = archetype.toLowerCase()
    if (archetypeLower.includes('ronin') || archetypeLower.includes('warrior')) {
      previewOptions.push({
        text: `Status: Hunting F4LL3N scouts through The Vents' back alleys...`,
        style: 'action'
      })
    } else if (archetypeLower.includes('hacker') || archetypeLower.includes('phantom') || archetypeLower.includes('cypher')) {
      previewOptions.push({
        text: `Mission: Ghosting Synapse firewalls for a shard of MORIA...`,
        style: 'action'
      })
    } else if (archetypeLower.includes('monk') || archetypeLower.includes('shaman') || archetypeLower.includes('adept')) {
      previewOptions.push({
        text: `Tracking: One Source glitches along Halcyon's temple paths...`,
        style: 'action'
      })
    } else if (archetypeLower.includes('leader') || archetypeLower.includes('guardian') || archetypeLower.includes('warden')) {
      previewOptions.push({
        text: `Coordinating: Boundary Warden response along The Battlements...`,
        style: 'action'
      })
    } else {
      previewOptions.push({
        text: `Current: Navigating House politics and street truth in The Enclave...`,
        style: 'action'
      })
    }
  }

  if (eyesTrait?.value) {
    const eyesValue = eyesTrait.value.toLowerCase()
    if (eyesValue.includes('blue') || eyesValue.includes('ethereal') || eyesValue.includes('azure')) {
      previewOptions.push({
        text: `Harboring: Sight that pierces both Veil shimmer and soul...`,
        style: 'mystery'
      })
    } else if (eyesValue.includes('red') || eyesValue.includes('crimson') || eyesValue.includes('angry')) {
      previewOptions.push({
        text: `Remembering: Echoes of The Shift still burn behind their gaze...`,
        style: 'mystery'
      })
    } else if (eyesValue.includes('gold') || eyesValue.includes('yellow') || eyesValue.includes('citrine')) {
      previewOptions.push({
        text: `Seeking: Patterns in the 0N1 Matrix Eon has only begun to map...`,
        style: 'mystery'
      })
    }
  }

  if (worldPosition?.societalRole) {
    const role = worldPosition.societalRole.toLowerCase()
    if (role.includes('outcast') || role.includes('exile')) {
      previewOptions.push({
        text: `Territory: Claims a forgotten Substructure vent as sanctuary...`,
        style: 'world'
      })
    } else if (role.includes('leader') || role.includes('commander')) {
      previewOptions.push({
        text: `Reputation: Known in Force circles as a Pattern Breaker...`,
        style: 'world'
      })
    } else if (role.includes('merchant') || role.includes('trader')) {
      previewOptions.push({
        text: `Network: Trades rare tech and secrets in The Markets' black stalls...`,
        style: 'world'
      })
    }
  }

  if (bodyTrait?.value) {
    const bodyValue = bodyTrait.value.toLowerCase()
    if (bodyValue.includes('obsidian') || bodyValue.includes('shadow')) {
      previewOptions.push({
        text: `Legend: Their Obsidian lineage bends shadow to their will...`,
        style: 'mystery'
      })
    } else if (bodyValue.includes('citrine')) {
      previewOptions.push({
        text: `Phenomenon: Citrine elemental paths answering their call...`,
        style: 'mystery'
      })
    } else if (bodyValue.includes('azurite')) {
      previewOptions.push({
        text: `Interface: Azurite emotion-craft reading every room they enter...`,
        style: 'power'
      })
    }
  }

  if (clothingTrait?.value) {
    const clothing = clothingTrait.value.toLowerCase()
    if (clothing.includes('jacket') || clothing.includes('track')) {
      previewOptions.push({
        text: `Street: Market-district gear that blends into The Vents crowd...`,
        style: 'world'
      })
    } else if (clothing.includes('suit') || clothing.includes('formal')) {
      previewOptions.push({
        text: `Cover: Halcyon polish masking a Force operative's edge...`,
        style: 'action'
      })
    }
  }

  if (previewOptions.length === 0) {
    previewOptions.push(
      {
        text: `Investigating: Echoes of The Shift still haunt The Substructure...`,
        style: 'mystery'
      },
      {
        text: `Status: Navigating House rivalries under The Enclave dome...`,
        style: 'action'
      },
      {
        text: `Current: Seeking their place among the reborn Army of the Sevens...`,
        style: 'personality'
      },
      {
        text: `Mission: Listening for Gen3sis currents beneath Synapse stone...`,
        style: 'mystery'
      },
      {
        text: `Tracking: F4LL3N traces along the Veil's thinning edges...`,
        style: 'action'
      },
      {
        text: `Philosophy: "Between every breath lies a choice between Source and chaos"...`,
        style: 'personality'
      }
    )
  }

  const seed = parseInt(characterData.pfpId) || 1
  const index = seed % previewOptions.length
  return previewOptions[index]
}

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
