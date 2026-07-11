import type { PersonalitySettings, CharacterData } from '@/lib/types'

export interface PersonalityTrigger {
  id: string
  name: string
  triggerType: 'keyword' | 'topic' | 'emotion' | 'pattern'
  conditions: TriggerCondition[]
  effects: TriggerEffect[]
  priority: number // Higher priority triggers evaluate first
}

export interface TriggerCondition {
  type: 'contains' | 'matches' | 'sentiment' | 'context'
  value: string | string[]
  caseSensitive?: boolean
}

export interface TriggerEffect {
  trait: keyof PersonalitySettings
  modifier: number // -100 to +100, applied as percentage change
  duration: 'instant' | 'conversation' | 'permanent'
}

export interface TriggerContext {
  message: string
  conversationHistory: string[]
  currentMood?: string
  relationshipLevel?: number
}

// Basic trigger library
export const personalityTriggers: PersonalityTrigger[] = [
  // Trauma triggers
  {
    id: 'parent-trauma',
    name: 'Parental Trauma Trigger',
    triggerType: 'topic',
    conditions: [
      { type: 'contains', value: ['parent', 'mother', 'father', 'mom', 'dad'], caseSensitive: false }
    ],
    effects: [
      { trait: 'neuroticism', modifier: 50, duration: 'conversation' },
      { trait: 'trustLevel', modifier: -30, duration: 'instant' },
      { trait: 'emotionalVolatility', modifier: 40, duration: 'instant' }
    ],
    priority: 90
  },
  
  // Compliment response
  {
    id: 'genuine-compliment',
    name: 'Genuine Compliment',
    triggerType: 'emotion',
    conditions: [
      { type: 'sentiment', value: 'positive' },
      { type: 'contains', value: ['amazing', 'brilliant', 'awesome', 'love', 'great'], caseSensitive: false }
    ],
    effects: [
      { trait: 'confidence', modifier: 10, duration: 'conversation' },
      { trait: 'agreeableness', modifier: 15, duration: 'instant' }
    ],
    priority: 70
  },
  
  // Hostility detection
  {
    id: 'hostile-attack',
    name: 'Hostile Attack',
    triggerType: 'pattern',
    conditions: [
      { type: 'contains', value: ['fuck', 'shit', 'hate', 'stupid', 'idiot'], caseSensitive: false }
    ],
    effects: [
      { trait: 'agreeableness', modifier: -40, duration: 'instant' },
      { trait: 'directness', modifier: 30, duration: 'instant' },
      { trait: 'stressResponse', modifier: 20, duration: 'instant' }
    ],
    priority: 85
  }
]

// Evaluate triggers for a given context
export function evaluateTriggers(
  triggers: PersonalityTrigger[],
  context: TriggerContext,
  characterData: CharacterData
): TriggerEffect[] {
  const activatedEffects: TriggerEffect[] = []
  
  // Sort triggers by priority
  const sortedTriggers = [...triggers].sort((a, b) => b.priority - a.priority)
  
  for (const trigger of sortedTriggers) {
    if (checkTriggerConditions(trigger.conditions, context)) {
      // Check if this trigger is relevant to the character's background
      if (shouldActivateTrigger(trigger, characterData)) {
        activatedEffects.push(...trigger.effects)
      }
    }
  }
  
  return activatedEffects
}

// Check if all conditions for a trigger are met
function checkTriggerConditions(
  conditions: TriggerCondition[],
  context: TriggerContext
): boolean {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'contains':
        const searchTerms = Array.isArray(condition.value) ? condition.value : [condition.value]
        const searchText = condition.caseSensitive ? context.message : context.message.toLowerCase()
        return searchTerms.some(term => {
          const searchTerm = condition.caseSensitive ? term : term.toLowerCase()
          return searchText.includes(searchTerm)
        })
        
      case 'matches':
        const pattern = new RegExp(condition.value as string, condition.caseSensitive ? 'g' : 'gi')
        return pattern.test(context.message)
        
      case 'sentiment':
        // Simplified sentiment detection
        return detectSentiment(context.message) === condition.value
        
      case 'context':
        // Check conversation history for context
        return checkConversationContext(context.conversationHistory, condition.value as string)
        
      default:
        return false
    }
  })
}

// Check if a trigger should activate based on character background
function shouldActivateTrigger(
  trigger: PersonalityTrigger,
  characterData: CharacterData
): boolean {
  // Special handling for trauma triggers
  if (trigger.id === 'parent-trauma') {
    const background = characterData.background?.toLowerCase() || ''
    const trauma = characterData.personalitySettings?.formativeTrauma?.toLowerCase() || ''
    return background.includes('parent') || trauma.includes('parent') || 
           background.includes('orphan') || trauma.includes('family')
  }
  
  // Most triggers activate for all characters
  return true
}

// Simple sentiment detection
function detectSentiment(text: string): string {
  const positive = ['good', 'great', 'amazing', 'love', 'happy', 'wonderful']
  const negative = ['bad', 'hate', 'terrible', 'awful', 'stupid', 'angry']
  
  const lowerText = text.toLowerCase()
  const positiveCount = positive.filter(word => lowerText.includes(word)).length
  const negativeCount = negative.filter(word => lowerText.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// Check conversation context
function checkConversationContext(history: string[], contextType: string): boolean {
  const recentHistory = history.slice(-5).join(' ').toLowerCase()
  
  switch (contextType) {
    case 'repeated-hostility':
      const hostileWords = ['fuck', 'shit', 'hate', 'stupid']
      return hostileWords.filter(word => recentHistory.includes(word)).length >= 3
      
    case 'building-trust':
      const trustWords = ['trust', 'believe', 'honest', 'truth']
      return trustWords.some(word => recentHistory.includes(word))
      
    default:
      return false
  }
}

// Apply trigger effects to personality settings
export function applyTriggerEffects(
  baseSettings: PersonalitySettings,
  effects: TriggerEffect[]
): PersonalitySettings {
  const modifiedSettings: any = { ...baseSettings }
  
  for (const effect of effects) {
    const currentValue = modifiedSettings[effect.trait]
    if (typeof currentValue === 'number') {
      // Apply modifier as percentage change
      const change = (currentValue * effect.modifier) / 100
      const newValue = currentValue + change
      
      // Clamp to 0-100 range
      modifiedSettings[effect.trait] = Math.max(0, Math.min(100, newValue))
    }
  }
  
  return modifiedSettings as PersonalitySettings
}

// Get character-specific triggers based on their background
export function getCharacterSpecificTriggers(characterData: CharacterData): PersonalityTrigger[] {
  const specificTriggers: PersonalityTrigger[] = []
  
  // Add triggers based on character's core fear
  if (characterData.personalitySettings?.coreFear) {
    const fearWords = characterData.personalitySettings.coreFear.toLowerCase().split(' ')
    specificTriggers.push({
      id: 'core-fear-trigger',
      name: 'Core Fear Activation',
      triggerType: 'topic',
      conditions: [
        { type: 'contains', value: fearWords, caseSensitive: false }
      ],
      effects: [
        { trait: 'neuroticism', modifier: 40, duration: 'instant' },
        { trait: 'stressResponse', modifier: 50, duration: 'instant' }
      ],
      priority: 95
    })
  }
  
  return [...personalityTriggers, ...specificTriggers]
} 