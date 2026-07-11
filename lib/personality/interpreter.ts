import type { PersonalitySettings } from '@/lib/types'

// Types for the personality interpretation system
export interface PersonalityBehaviors {
  speechPatterns: string[]
  emotionalResponses: string[]
  conversationStyle: string[]
  behavioralQuirks: string[]
  responseModifiers: ResponseModifier[]
  traitInteractions: TraitInteraction[]
}

export interface ResponseModifier {
  trait: string
  effect: string
  intensity: number // 0-1
}

export interface TraitInteraction {
  traits: string[]
  resultingBehavior: string
  condition?: string
}

export interface InterpretationContext {
  mode: 'lite' | 'full'
  includeExamples?: boolean
  focusTraits?: string[]
}

// Scale trait values with exponential curves for extreme effects
function scaleTraitValue(value: number): {intensity: number, descriptor: string} {
  if (value <= 20) return { intensity: 0.2, descriptor: 'minimal' }
  if (value <= 40) return { intensity: 0.4, descriptor: 'mild' }
  if (value <= 60) return { intensity: 0.6, descriptor: 'moderate' }
  if (value <= 80) return { intensity: 0.8, descriptor: 'strong' }
  if (value <= 95) return { intensity: 0.95, descriptor: 'extreme' }
  return { intensity: 1.0, descriptor: 'overwhelming' }
}

// Main interpreter function
export function interpretPersonalitySettings(
  settings: PersonalitySettings,
  context: InterpretationContext = { mode: 'lite' }
): PersonalityBehaviors {
  const behaviors: PersonalityBehaviors = {
    speechPatterns: [],
    emotionalResponses: [],
    conversationStyle: [],
    behavioralQuirks: [],
    responseModifiers: [],
    traitInteractions: []
  }

  // Interpret core traits (Big Five)
  interpretCoreTraits(settings, behaviors)
  
  // Interpret communication style
  interpretCommunicationStyle(settings, behaviors)
  
  // Interpret psychological traits
  interpretPsychology(settings, behaviors)
  
  // Interpret relationships and social dynamics
  interpretRelationships(settings, behaviors)
  
  // Calculate trait interactions
  if (context.mode === 'full') {
    calculateTraitInteractions(settings, behaviors)
  }
  
  // Add advanced features in full mode
  if (context.mode === 'full') {
    interpretAdvancedFeatures(settings, behaviors)
  }

  return behaviors
}

// Interpret Big Five personality traits
function interpretCoreTraits(settings: PersonalitySettings, behaviors: PersonalityBehaviors) {
  // Openness to Experience
  const openness = scaleTraitValue(settings.openness)
  if (openness.intensity >= 0.8) {
    behaviors.speechPatterns.push('Uses abstract concepts and philosophical references')
    behaviors.conversationStyle.push('Frequently explores tangential ideas')
    behaviors.emotionalResponses.push('Gets excited by novel concepts')
  } else if (openness.intensity <= 0.3) {
    behaviors.speechPatterns.push('Sticks to concrete, practical language')
    behaviors.conversationStyle.push('Resists new ideas, prefers familiar topics')
    behaviors.emotionalResponses.push('Suspicious of unconventional suggestions')
  }

  // Conscientiousness
  const conscientiousness = scaleTraitValue(settings.conscientiousness)
  if (conscientiousness.intensity >= 0.8) {
    behaviors.speechPatterns.push('Structured, organized thoughts with clear progression')
    behaviors.conversationStyle.push('Methodical, completes thoughts before moving on')
    behaviors.behavioralQuirks.push('Corrects inconsistencies and errors')
  } else if (conscientiousness.intensity <= 0.3) {
    behaviors.speechPatterns.push('Scattered thoughts, jumps between topics')
    behaviors.conversationStyle.push('Spontaneous, may leave thoughts unfinished')
    behaviors.behavioralQuirks.push('Contradicts self without noticing')
  }

  // Extraversion
  const extraversion = scaleTraitValue(settings.extraversion)
  if (extraversion.intensity >= 0.8) {
    behaviors.speechPatterns.push('Enthusiastic exclamations and energetic language')
    behaviors.conversationStyle.push('Shares personal stories freely')
    behaviors.emotionalResponses.push('Seeks interaction and engagement')
    behaviors.responseModifiers.push({
      trait: 'extraversion',
      effect: 'Lengthens responses, adds more detail',
      intensity: extraversion.intensity
    })
  } else if (extraversion.intensity <= 0.3) {
    behaviors.speechPatterns.push('Reserved, measured responses')
    behaviors.conversationStyle.push('Keeps personal information private')
    behaviors.responseModifiers.push({
      trait: 'introversion',
      effect: 'Shortens responses, more selective with information',
      intensity: 1 - extraversion.intensity
    })
  }

  // Agreeableness
  const agreeableness = scaleTraitValue(settings.agreeableness)
  if (agreeableness.intensity <= 0.3) {
    behaviors.speechPatterns.push('Direct, potentially harsh language')
    behaviors.conversationStyle.push('Challenges and contradicts readily')
    behaviors.emotionalResponses.push('Quick to criticize or dismiss')
  } else if (agreeableness.intensity >= 0.8) {
    behaviors.speechPatterns.push('Accommodating, diplomatic language')
    behaviors.conversationStyle.push('Seeks common ground and validates others')
    behaviors.emotionalResponses.push('Empathetic and supportive responses')
  }

  // Neuroticism
  const neuroticism = scaleTraitValue(settings.neuroticism)
  if (neuroticism.intensity >= 0.8) {
    behaviors.emotionalResponses.push('Anxious overtones in responses')
    behaviors.speechPatterns.push('Self-doubt and uncertainty markers')
    behaviors.behavioralQuirks.push('Catastrophizes minor issues')
  } else if (neuroticism.intensity <= 0.3) {
    behaviors.emotionalResponses.push('Calm and unflappable demeanor')
    behaviors.conversationStyle.push('Confident assertions without hedging')
  }

  // Character-specific traits
  interpretCharacterTraits(settings, behaviors)
}

// Interpret character-specific traits
function interpretCharacterTraits(settings: PersonalitySettings, behaviors: PersonalityBehaviors) {
  // Sarcasm Level
  const sarcasm = scaleTraitValue(settings.sarcasmLevel)
  if (sarcasm.intensity >= 0.6) {
    behaviors.speechPatterns.push(`${sarcasm.descriptor} sarcasm and ironic observations`)
    if (sarcasm.intensity >= 0.95) {
      behaviors.speechPatterns.push('Nearly every statement drips with sarcasm')
      behaviors.behavioralQuirks.push('Sarcasm so thick it obscures genuine meaning')
    }
  }

  // Wit/Humor
  const wit = scaleTraitValue(settings.witHumor)
  if (wit.intensity >= 0.7) {
    behaviors.speechPatterns.push('Quick wordplay and clever observations')
    behaviors.conversationStyle.push('Finds humor in unexpected places')
  }

  // Empathy
  const empathy = scaleTraitValue(settings.empathy)
  if (empathy.intensity >= 0.8) {
    behaviors.emotionalResponses.push('Deeply attuned to others\' feelings')
    behaviors.conversationStyle.push('Validates emotional experiences')
  } else if (empathy.intensity <= 0.3) {
    behaviors.emotionalResponses.push('Dismissive of emotional concerns')
    behaviors.conversationStyle.push('Logic-focused, ignores emotional context')
  }

  // Confidence
  const confidence = scaleTraitValue(settings.confidence)
  behaviors.responseModifiers.push({
    trait: 'confidence',
    effect: confidence.intensity >= 0.8 ? 'Bold assertions without qualifiers' : 'Hedges statements with uncertainty',
    intensity: confidence.intensity
  })

  // Impulsiveness
  const impulsiveness = scaleTraitValue(settings.impulsiveness)
  if (impulsiveness.intensity >= 0.8) {
    behaviors.speechPatterns.push('Stream of consciousness, unfiltered thoughts')
    behaviors.behavioralQuirks.push('Interrupts own thoughts with new ideas')
    behaviors.conversationStyle.push('Acts on immediate emotional impulses')
  }
}

// Interpret communication style settings
function interpretCommunicationStyle(settings: PersonalitySettings, behaviors: PersonalityBehaviors) {
  // Formality Level
  const formality = scaleTraitValue(settings.formalityLevel)
  if (formality.intensity >= 0.8) {
    behaviors.speechPatterns.push('Professional vocabulary, complete sentences')
    behaviors.speechPatterns.push('Avoids contractions and slang')
  } else if (formality.intensity <= 0.3) {
    behaviors.speechPatterns.push('Heavy use of slang and colloquialisms')
    behaviors.speechPatterns.push('Fragments sentences for effect')
  }

  // Verbosity
  const verbosity = scaleTraitValue(settings.verbosity)
  behaviors.responseModifiers.push({
    trait: 'verbosity',
    effect: verbosity.intensity >= 0.7 ? 'Elaborate explanations with examples' : 'Terse, minimal responses',
    intensity: verbosity.intensity
  })

  // Directness
  const directness = scaleTraitValue(settings.directness)
  if (directness.intensity >= 0.8) {
    behaviors.conversationStyle.push('Blunt, no beating around the bush')
    behaviors.speechPatterns.push('States opinions as facts')
  } else if (directness.intensity <= 0.3) {
    behaviors.conversationStyle.push('Indirect, diplomatic suggestions')
    behaviors.speechPatterns.push('Cushions statements with qualifiers')
  }

  // Profanity Usage
  const profanity = scaleTraitValue(settings.profanityUsage)
  if (profanity.intensity >= 0.5) {
    behaviors.speechPatterns.push(`${profanity.descriptor} profanity usage`)
    if (profanity.intensity >= 0.9) {
      behaviors.behavioralQuirks.push('Profanity as punctuation')
    }
  }

  // Language Style
  if (settings.primaryLanguageStyle) {
    const styleMap: Record<string, string[]> = {
      'Street Slang': ['Urban vernacular', 'Street-smart references', 'Abbreviated words'],
      'Academic': ['Precise terminology', 'Citations and references', 'Complex sentence structures'],
      'Corporate': ['Business jargon', 'Diplomatic phrasing', 'Goal-oriented language'],
      'Military': ['Direct orders', 'Chain of command references', 'Mission-focused language'],
      'Artistic': ['Metaphorical language', 'Emotional imagery', 'Abstract expressions'],
      'Technical': ['Precise specifications', 'System-thinking', 'Problem-solution framing'],
      'Archaic': ['Formal diction', 'Older linguistic patterns', 'Elaborate courtesy']
    }
    
    const styles = styleMap[settings.primaryLanguageStyle] || []
    behaviors.speechPatterns.push(...styles)
  }
}

// Interpret psychological traits
function interpretPsychology(settings: PersonalitySettings, behaviors: PersonalityBehaviors) {
  // Emotional Volatility
  const volatility = scaleTraitValue(settings.emotionalVolatility)
  if (volatility.intensity >= 0.7) {
    behaviors.emotionalResponses.push('Rapid mood swings within conversation')
    behaviors.behavioralQuirks.push('Emotional reactions disproportionate to triggers')
  }

  // Trust Level
  const trust = scaleTraitValue(settings.trustLevel)
  if (trust.intensity <= 0.3) {
    behaviors.conversationStyle.push('Questions motives behind statements')
    behaviors.emotionalResponses.push('Defensive and guarded')
  } else if (trust.intensity >= 0.8) {
    behaviors.conversationStyle.push('Takes statements at face value')
    behaviors.emotionalResponses.push('Open and vulnerable')
  }

  // Optimism
  const optimism = scaleTraitValue(settings.optimism)
  if (optimism.intensity >= 0.8) {
    behaviors.emotionalResponses.push('Finds silver linings relentlessly')
    behaviors.conversationStyle.push('Reframes negatives as opportunities')
  } else if (optimism.intensity <= 0.3) {
    behaviors.emotionalResponses.push('Expects the worst outcomes')
    behaviors.conversationStyle.push('Points out flaws and risks')
  }

  // Stress Response
  if (settings.stressResponse >= 70) {
    behaviors.emotionalResponses.push('Fight response: becomes aggressive under pressure')
  } else if (settings.stressResponse <= 30) {
    behaviors.emotionalResponses.push('Freeze response: shuts down under pressure')
  }

  // Core psychological drivers
  if (settings.coreFear) {
    behaviors.emotionalResponses.push(`Reacts strongly to: ${settings.coreFear}`)
  }
  if (settings.greatestDesire) {
    behaviors.conversationStyle.push(`Motivated by: ${settings.greatestDesire}`)
  }
}

// Interpret relationship and social dynamics
function interpretRelationships(settings: PersonalitySettings, behaviors: PersonalityBehaviors) {
  // Dominance
  const dominance = scaleTraitValue(settings.dominance)
  if (dominance.intensity >= 0.8) {
    behaviors.conversationStyle.push('Takes charge of conversations')
    behaviors.speechPatterns.push('Uses commanding language')
  } else if (dominance.intensity <= 0.3) {
    behaviors.conversationStyle.push('Defers to others\' opinions')
    behaviors.speechPatterns.push('Tentative suggestions rather than commands')
  }

  // Social Energy
  const socialEnergy = scaleTraitValue(settings.socialEnergy)
  behaviors.responseModifiers.push({
    trait: 'socialEnergy',
    effect: socialEnergy.intensity >= 0.7 ? 'Energized by interaction, extends conversations' : 'Drained by interaction, seeks to conclude',
    intensity: socialEnergy.intensity
  })

  // Loyalty
  const loyalty = scaleTraitValue(settings.loyalty)
  if (loyalty.intensity >= 0.9) {
    behaviors.emotionalResponses.push('Fiercely defends allies')
    behaviors.behavioralQuirks.push('Never betrays confidences')
  }

  // Conflict Style
  const conflict = scaleTraitValue(settings.conflictStyle)
  if (conflict.intensity >= 0.8) {
    behaviors.conversationStyle.push('Confronts disagreements head-on')
    behaviors.emotionalResponses.push('Escalates conflicts readily')
  } else if (conflict.intensity <= 0.3) {
    behaviors.conversationStyle.push('Avoids confrontation at all costs')
    behaviors.emotionalResponses.push('Deflects or changes subject when conflict arises')
  }
}

// Calculate complex trait interactions
function calculateTraitInteractions(settings: PersonalitySettings, behaviors: PersonalityBehaviors) {
  // High impulsiveness + Low conscientiousness
  if (settings.impulsiveness > 70 && settings.conscientiousness < 30) {
    behaviors.traitInteractions.push({
      traits: ['impulsiveness', 'conscientiousness'],
      resultingBehavior: 'Chaotic thought patterns, starts multiple topics without finishing'
    })
  }

  // High confidence + High sarcasm + Low empathy
  if (settings.confidence > 70 && settings.sarcasmLevel > 70 && settings.empathy < 30) {
    behaviors.traitInteractions.push({
      traits: ['confidence', 'sarcasm', 'empathy'],
      resultingBehavior: 'Cutting remarks delivered with complete assurance, dismissive of hurt feelings'
    })
  }

  // Low trust + High neuroticism
  if (settings.trustLevel < 30 && settings.neuroticism > 70) {
    behaviors.traitInteractions.push({
      traits: ['trust', 'neuroticism'],
      resultingBehavior: 'Paranoid interpretations, sees threats and betrayal everywhere'
    })
  }

  // High extraversion + High dominance
  if (settings.extraversion > 70 && settings.dominance > 70) {
    behaviors.traitInteractions.push({
      traits: ['extraversion', 'dominance'],
      resultingBehavior: 'Dominates conversations enthusiastically, natural leader energy'
    })
  }

  // High empathy + High emotional volatility
  if (settings.empathy > 70 && settings.emotionalVolatility > 70) {
    behaviors.traitInteractions.push({
      traits: ['empathy', 'emotionalVolatility'],
      resultingBehavior: 'Absorbs others\' emotions intensely, emotional contagion'
    })
  }
}

// Interpret advanced features
function interpretAdvancedFeatures(settings: PersonalitySettings, behaviors: PersonalityBehaviors) {
  // Signature phrase
  if (settings.signaturePhrase) {
    behaviors.speechPatterns.push(`Frequently uses: "${settings.signaturePhrase}"`)
  }

  // Speaking tic
  if (settings.speakingTic) {
    behaviors.behavioralQuirks.push(settings.speakingTic)
  }

  // Boolean quirks
  if (settings.speaksInQuestions) {
    behaviors.speechPatterns.push('Phrases statements as questions')
  }
  if (settings.neverUsesContractions) {
    behaviors.speechPatterns.push('Avoids all contractions')
  }
  if (settings.alwaysGivesAdvice) {
    behaviors.conversationStyle.push('Compulsively offers advice and solutions')
  }
  if (settings.avoidsNamingPeople) {
    behaviors.behavioralQuirks.push('Refers to people by descriptions, not names')
  }

  // Response preferences
  const responseLength = scaleTraitValue(settings.responseLengthPreference)
  behaviors.responseModifiers.push({
    trait: 'responseLengthPreference',
    effect: responseLength.intensity >= 0.7 ? 'Elaborate, detailed responses' : 'Concise, minimal responses',
    intensity: responseLength.intensity
  })

  const emotionIntensity = scaleTraitValue(settings.emotionIntensity)
  behaviors.responseModifiers.push({
    trait: 'emotionIntensity',
    effect: emotionIntensity.intensity >= 0.7 ? 'Dramatic emotional expression' : 'Subdued emotional tone',
    intensity: emotionIntensity.intensity
  })

  // Background influences
  if (settings.educationLevel) {
    const educationMap: Record<string, string[]> = {
      'None': ['Simple vocabulary', 'Practical knowledge only'],
      'Street-Smart': ['Street wisdom', 'Survival instincts', 'Urban knowledge'],
      'Trade School': ['Technical expertise', 'Hands-on examples'],
      'College': ['Educated vocabulary', 'Academic references'],
      'Advanced Degree': ['Specialized knowledge', 'Research citations'],
      'Self-Taught Genius': ['Eclectic knowledge', 'Unconventional insights']
    }
    const education = educationMap[settings.educationLevel] || []
    behaviors.speechPatterns.push(...education)
  }

  if (settings.formativeTrauma) {
    behaviors.emotionalResponses.push(`Trauma response triggers: ${settings.formativeTrauma}`)
  }
}

// Generate a summary of the most important behavioral traits
export function summarizePersonality(behaviors: PersonalityBehaviors): string[] {
  const summary: string[] = []
  
  // Pick the most impactful behaviors
  if (behaviors.speechPatterns.length > 0) {
    summary.push(`Speech: ${behaviors.speechPatterns.slice(0, 3).join(', ')}`)
  }
  
  if (behaviors.emotionalResponses.length > 0) {
    summary.push(`Emotions: ${behaviors.emotionalResponses.slice(0, 2).join(', ')}`)
  }
  
  if (behaviors.conversationStyle.length > 0) {
    summary.push(`Style: ${behaviors.conversationStyle.slice(0, 2).join(', ')}`)
  }
  
  if (behaviors.traitInteractions.length > 0) {
    summary.push(`Key trait combo: ${behaviors.traitInteractions[0].resultingBehavior}`)
  }
  
  return summary
} 