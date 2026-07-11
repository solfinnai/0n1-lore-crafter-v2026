import type { CharacterData, PersonalitySettings } from "./types"

function getRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Default personality settings with reasonable middle values
export function createDefaultPersonalitySettings(): PersonalitySettings {
  return {
    // Core Personality Traits (Big 5 + Extensions)
    openness: Math.floor(Math.random() * 100),
    conscientiousness: Math.floor(Math.random() * 100),
    extraversion: Math.floor(Math.random() * 100),
    agreeableness: Math.floor(Math.random() * 100),
    neuroticism: Math.floor(Math.random() * 100),
    sarcasmLevel: Math.floor(Math.random() * 100),
    witHumor: Math.floor(Math.random() * 100),
    empathy: Math.floor(Math.random() * 100),
    confidence: Math.floor(Math.random() * 100),
    impulsiveness: Math.floor(Math.random() * 100),
    
    // Communication Style Controls
    formalityLevel: Math.floor(Math.random() * 100),
    verbosity: Math.floor(Math.random() * 100),
    directness: Math.floor(Math.random() * 100),
    profanityUsage: Math.floor(Math.random() * 100),
    technicalLanguage: Math.floor(Math.random() * 100),
    metaphorUsage: Math.floor(Math.random() * 100),
    storytellingTendency: Math.floor(Math.random() * 100),
    
    // Communication Style Dropdowns
    primaryLanguageStyle: getRandomFromArray(['Street Slang', 'Academic', 'Corporate', 'Military', 'Artistic', 'Technical', 'Archaic']),
    sentenceStructure: getRandomFromArray(['Short & Punchy', 'Flowing & Complex', 'Fragmented', 'Poetic', 'Stream of Consciousness']),
    responseSpeedStyle: getRandomFromArray(['Immediate', 'Thoughtful Pauses', 'Delayed', 'Interrupt-Heavy']),
    
    // Psychological Depth
    emotionalVolatility: Math.floor(Math.random() * 100),
    trustLevel: Math.floor(Math.random() * 100),
    optimism: Math.floor(Math.random() * 100),
    stressResponse: Math.floor(Math.random() * 100),
    attentionToDetail: Math.floor(Math.random() * 100),
    riskTolerance: Math.floor(Math.random() * 100),
    authorityRespect: Math.floor(Math.random() * 100),
    
    // Psychological Text Fields
    coreFear: "The unknown",
    greatestDesire: "Understanding",
    primaryDefenseMechanism: "Intellectualization",
    
    // Background & Identity
    educationLevel: getRandomFromArray(['Street-Smart', 'Trade School', 'College', 'Advanced Degree', 'Self-Taught Genius']),
    socialClass: getRandomFromArray(['Upper Middle', 'Middle', 'Working', 'Street/Exile']),
    geographicOrigin: getRandomFromArray(['Oni Empire', 'Sector 7', 'The Underbelly', 'Tech Districts', 'Wastelands']),
    professionRole: getRandomFromArray(['Warrior', 'Diplomat', 'Hacker', 'Merchant', 'Scholar', 'Operative', 'Artist']),
    ageRange: getRandomFromArray(['Young Adult', 'Prime', 'Experienced', 'Elder']),
    
    // Background Text Fields
    culturalBackground: "Digital native culture",
    religiousBeliefSystem: "Tech-Spiritualist",
    formativeTrauma: "System betrayal",
    greatestAchievement: "Survived the transition",
    
    // Relationship Dynamics
    dominance: Math.floor(Math.random() * 100),
    socialEnergy: Math.floor(Math.random() * 100),
    boundarySetting: Math.floor(Math.random() * 100),
    conflictStyle: Math.floor(Math.random() * 100),
    intimacyComfort: Math.floor(Math.random() * 100),
    loyalty: Math.floor(Math.random() * 100),
    mentorshipInclination: Math.floor(Math.random() * 100),
    
    // Relationship Dropdowns
    defaultRelationshipStance: getRandomFromArray(['Friendly', 'Neutral', 'Suspicious', 'Protective']),
    authorityResponse: getRandomFromArray(['Defer', 'Challenge', 'Ignore', 'Respect']),
    
    // Specialized Traits
    curiosityLevel: Math.floor(Math.random() * 100),
    philosophicalTendency: Math.floor(Math.random() * 100),
    creativity: Math.floor(Math.random() * 100),
    analyticalNature: Math.floor(Math.random() * 100),
    memoryForDetails: Math.floor(Math.random() * 100),
    physicalAwareness: Math.floor(Math.random() * 100),
    
    // Quirks & Personality Flavoring
    signaturePhrase: "Interesting...",
    speakingTic: "Adjusts posture when focused",
    uniqueReferencePool: "Digital analogies",
    physicalTell: "Looks up when thinking",
    conversationHabit: "Asks clarifying questions",
    
    // Quirks Checkboxes
    usesSpecificEmoji: false,
    speaksInQuestions: false,
    neverUsesContractions: false,
    frequentlyInterrupts: false,
    alwaysGivesAdvice: false,
    tellsStoriesInsteadOfAnswers: false,
    usesTechnicalMetaphors: false,
    avoidsNamingPeople: false,
    
    // Contextual Modifiers
    stressAdaptability: Math.floor(Math.random() * 100),
    environmentalSensitivity: Math.floor(Math.random() * 100),
    moodStability: Math.floor(Math.random() * 100),
    audienceAwareness: Math.floor(Math.random() * 100),
    
    // Contextual Dropdowns
    primaryMotivation: getRandomFromArray(['Survival', 'Power', 'Knowledge', 'Connection', 'Recognition', 'Justice']),
    currentLifePhase: getRandomFromArray(['Searching', 'Building', 'Protecting', 'Transforming']),
    energyLevel: getRandomFromArray(['Moderate', 'High', 'Low']),
    
    // Advanced Controls
    responseComplexity: Math.floor(Math.random() * 100),
    emotionalExpression: Math.floor(Math.random() * 100),
    memoryReference: Math.floor(Math.random() * 100),
    futureOrientation: Math.floor(Math.random() * 100),
    
    // Advanced Text Fields
    backstorySummary: "A soul shaped by digital transformation",
    currentGoal: "Finding their place in the new world",
    secretHiddenAspect: "Deep uncertainty about their identity",
    characterArcDirection: "Growing into their true potential",
    
    // Output Controls
    responseLengthPreference: Math.floor(Math.random() * 100),
    emotionIntensity: Math.floor(Math.random() * 100),
    adviceGivingTendency: Math.floor(Math.random() * 100),
    questionAskingFrequency: Math.floor(Math.random() * 100),
  }
}

// Generate personality settings based on soul questionnaire data
export function generatePersonalityFromSoul(characterData: CharacterData): PersonalitySettings {
  const settings = createDefaultPersonalitySettings()
  
  // Analyze archetype and adjust traits accordingly
  analyzeArchetype(characterData.archetype, settings)
  analyzePersonalityDescription(characterData.personalityProfile?.description || "", settings)
  analyzeHopesAndFears(characterData.hopesFears, settings)
  analyzeMotivations(characterData.motivations, settings)
  analyzeRelationships(characterData.relationships, settings)
  analyzeWorldPosition(characterData.worldPosition, settings)
  analyzeVoice(characterData.voice, settings)
  analyzePowersAbilities(characterData.powersAbilities, settings)
  analyzeBackground(characterData.background, settings)
  
  return settings
}

function analyzeArchetype(archetype: string, settings: PersonalitySettings) {
  const archetypeLower = archetype.toLowerCase()
  
  if (archetypeLower.includes('warrior') || archetypeLower.includes('fighter')) {
    settings.confidence = Math.max(60, settings.confidence)
    settings.dominance = Math.max(65, settings.dominance)  
    settings.directness = Math.max(70, settings.directness)
    settings.stressResponse = Math.max(75, settings.stressResponse)
    settings.riskTolerance = Math.max(70, settings.riskTolerance)
  } else if (archetypeLower.includes('scholar') || archetypeLower.includes('sage')) {
    settings.openness = Math.max(75, settings.openness)
    settings.curiosityLevel = Math.max(80, settings.curiosityLevel)
    settings.analyticalNature = Math.max(75, settings.analyticalNature)
    settings.verbosity = Math.max(65, settings.verbosity)
    settings.technicalLanguage = Math.max(60, settings.technicalLanguage)
  } else if (archetypeLower.includes('rogue') || archetypeLower.includes('trickster')) {
    settings.sarcasmLevel = Math.max(60, settings.sarcasmLevel)
    settings.witHumor = Math.max(70, settings.witHumor)
    settings.impulsiveness = Math.max(60, settings.impulsiveness)
    settings.trustLevel = Math.min(40, settings.trustLevel)
  } else if (archetypeLower.includes('healer') || archetypeLower.includes('caregiver')) {
    settings.empathy = Math.max(80, settings.empathy)
    settings.agreeableness = Math.max(75, settings.agreeableness)
    settings.alwaysGivesAdvice = true
  } else if (archetypeLower.includes('leader') || archetypeLower.includes('commander')) {
    settings.dominance = Math.max(75, settings.dominance)
    settings.confidence = Math.max(70, settings.confidence)
    settings.directness = Math.max(75, settings.directness)
    settings.authorityRespect = Math.min(30, settings.authorityRespect)
  }
}

function analyzePersonalityDescription(description: string, settings: PersonalitySettings) {
  const descLower = description.toLowerCase()
  
  if (descLower.includes('introvert') || descLower.includes('quiet') || descLower.includes('reserved')) {
    settings.extraversion = Math.min(30, settings.extraversion)
    settings.socialEnergy = Math.min(25, settings.socialEnergy)
  }
  if (descLower.includes('extrovert') || descLower.includes('outgoing') || descLower.includes('social')) {
    settings.extraversion = Math.max(70, settings.extraversion)
    settings.socialEnergy = Math.max(75, settings.socialEnergy)
  }
  if (descLower.includes('sarcastic') || descLower.includes('cynical') || descLower.includes('dry wit')) {
    settings.sarcasmLevel = Math.max(70, settings.sarcasmLevel)
    settings.witHumor = Math.max(65, settings.witHumor)
  }
  if (descLower.includes('empathetic') || descLower.includes('caring') || descLower.includes('compassionate')) {
    settings.empathy = Math.max(75, settings.empathy)
    settings.agreeableness = Math.max(65, settings.agreeableness)
  }
  if (descLower.includes('anxious') || descLower.includes('nervous') || descLower.includes('worry')) {
    settings.neuroticism = Math.max(65, settings.neuroticism)
    settings.confidence = Math.min(35, settings.confidence)
  }
  if (descLower.includes('confident') || descLower.includes('assured') || descLower.includes('bold')) {
    settings.confidence = Math.max(70, settings.confidence)
    settings.neuroticism = Math.min(35, settings.neuroticism)
  }
}

function analyzeHopesAndFears(hopesAndFears: {hopes: string, fears: string}, settings: PersonalitySettings) {
  const hopesLower = hopesAndFears.hopes.toLowerCase()
  const fearsLower = hopesAndFears.fears.toLowerCase()
  
  if (fearsLower.includes('abandon') || fearsLower.includes('alone') || fearsLower.includes('isolat')) {
    settings.coreFear = "Being abandoned or alone"
    settings.socialEnergy = Math.max(60, settings.socialEnergy)
    settings.intimacyComfort = Math.max(55, settings.intimacyComfort)
  } else if (fearsLower.includes('fail') || fearsLower.includes('inadequ')) {
    settings.coreFear = "Failure and inadequacy"
    settings.confidence = Math.min(40, settings.confidence)
    settings.neuroticism = Math.max(60, settings.neuroticism)
  } else if (fearsLower.includes('betray') || fearsLower.includes('trust') || fearsLower.includes('deceiv')) {
    settings.coreFear = "Betrayal and deception"
    settings.trustLevel = Math.min(30, settings.trustLevel)
    settings.boundarySetting = Math.max(70, settings.boundarySetting)
  }
  
  if (hopesLower.includes('recogni') || hopesLower.includes('famous') || hopesLower.includes('respect')) {
    settings.greatestDesire = "Recognition and respect"
    settings.confidence = Math.max(55, settings.confidence)
    settings.dominance = Math.max(50, settings.dominance)
  } else if (hopesLower.includes('peace') || hopesLower.includes('harmony') || hopesLower.includes('calm')) {
    settings.greatestDesire = "Peace and harmony"
    settings.conflictStyle = Math.min(30, settings.conflictStyle)
    settings.agreeableness = Math.max(65, settings.agreeableness)
  } else if (hopesLower.includes('power') || hopesLower.includes('control') || hopesLower.includes('dominan')) {
    settings.greatestDesire = "Power and control"
    settings.dominance = Math.max(75, settings.dominance)
    settings.primaryMotivation = "Power"
  }
}

function analyzeMotivations(motivations: {drives: string, goals: string, values: string}, settings: PersonalitySettings) {
  const valuesLower = motivations.values.toLowerCase()
  
  if (valuesLower.includes('justice') || valuesLower.includes('fairness') || valuesLower.includes('right')) {
    settings.primaryMotivation = "Justice"
    settings.agreeableness = Math.max(60, settings.agreeableness)
    settings.directness = Math.max(60, settings.directness)
  } else if (valuesLower.includes('knowledge') || valuesLower.includes('learn') || valuesLower.includes('wisdom')) {
    settings.primaryMotivation = "Knowledge"
    settings.curiosityLevel = Math.max(80, settings.curiosityLevel)
    settings.openness = Math.max(70, settings.openness)
  } else if (valuesLower.includes('family') || valuesLower.includes('friends') || valuesLower.includes('connection')) {
    settings.primaryMotivation = "Connection"
    settings.loyalty = Math.max(75, settings.loyalty)
    settings.empathy = Math.max(65, settings.empathy)
  }
}

function analyzeRelationships(relationships: {friends: string, rivals: string, family: string}, settings: PersonalitySettings) {
  const friendsLower = relationships.friends.toLowerCase()
  const rivalsLower = relationships.rivals.toLowerCase()
  
  if (friendsLower.length > 100 || friendsLower.includes('many') || friendsLower.includes('numerous')) {
    settings.extraversion = Math.max(60, settings.extraversion)
    settings.socialEnergy = Math.max(65, settings.socialEnergy)
    settings.agreeableness = Math.max(55, settings.agreeableness)
  }
  
  if (rivalsLower.length > 100 || rivalsLower.includes('many') || rivalsLower.includes('numerous')) {
    settings.conflictStyle = Math.max(60, settings.conflictStyle)
    settings.dominance = Math.max(55, settings.dominance)
  }
}

function analyzeWorldPosition(worldPosition: {societalRole: string, classStatus: string, perception: string}, settings: PersonalitySettings) {
  const roleLower = worldPosition.societalRole.toLowerCase()
  const statusLower = worldPosition.classStatus.toLowerCase()
  
  if (roleLower.includes('leader') || roleLower.includes('command') || roleLower.includes('authority')) {
    settings.dominance = Math.max(70, settings.dominance)
    settings.confidence = Math.max(65, settings.confidence)
    settings.authorityResponse = "Challenge"
  } else if (roleLower.includes('scholar') || roleLower.includes('research') || roleLower.includes('academic')) {
    settings.educationLevel = "Advanced Degree"
    settings.primaryLanguageStyle = "Academic"
    settings.technicalLanguage = Math.max(70, settings.technicalLanguage)
    settings.verbosity = Math.max(60, settings.verbosity)
  }
  
  if (statusLower.includes('noble') || statusLower.includes('elite') || statusLower.includes('upper')) {
    settings.socialClass = "Elite/Noble"
    settings.formalityLevel = Math.max(60, settings.formalityLevel)
    settings.confidence = Math.max(55, settings.confidence)
  } else if (statusLower.includes('street') || statusLower.includes('underground') || statusLower.includes('exile')) {
    settings.socialClass = "Street/Exile"
    settings.primaryLanguageStyle = "Street Slang"
    settings.trustLevel = Math.min(40, settings.trustLevel)
    settings.riskTolerance = Math.max(60, settings.riskTolerance)
  }
}

function analyzeVoice(voice: {speechStyle: string, innerDialogue: string, uniquePhrases: string}, settings: PersonalitySettings) {
  const speechLower = voice.speechStyle.toLowerCase()
  
  if (speechLower.includes('formal') || speechLower.includes('proper') || speechLower.includes('professional')) {
    settings.formalityLevel = Math.max(70, settings.formalityLevel)
    settings.primaryLanguageStyle = "Corporate"
  } else if (speechLower.includes('casual') || speechLower.includes('slang') || speechLower.includes('street')) {
    settings.formalityLevel = Math.min(30, settings.formalityLevel)
    settings.primaryLanguageStyle = "Street Slang"
  }
  
  if (speechLower.includes('brief') || speechLower.includes('short') || speechLower.includes('concise')) {
    settings.verbosity = Math.min(30, settings.verbosity)
    settings.sentenceStructure = "Short & Punchy"
  } else if (speechLower.includes('verbose') || speechLower.includes('detailed') || speechLower.includes('elaborate')) {
    settings.verbosity = Math.max(70, settings.verbosity)
    settings.sentenceStructure = "Flowing & Complex"
  }
}

function analyzePowersAbilities(powersAbilities: {powers: string[], description: string}, settings: PersonalitySettings) {
  const powers = powersAbilities.powers.join(' ').toLowerCase()
  
  if (powers.includes('tech') || powers.includes('cyber') || powers.includes('digital')) {
    settings.technicalLanguage = Math.max(65, settings.technicalLanguage)
    settings.usesTechnicalMetaphors = true
    settings.primaryLanguageStyle = "Technical"
  } else if (powers.includes('magic') || powers.includes('mystic') || powers.includes('arcane')) {
    settings.metaphorUsage = Math.max(70, settings.metaphorUsage)
    settings.primaryLanguageStyle = "Archaic"
    settings.philosophicalTendency = Math.max(60, settings.philosophicalTendency)
  } else if (powers.includes('combat') || powers.includes('fight') || powers.includes('battle')) {
    settings.directness = Math.max(65, settings.directness)
    settings.conflictStyle = Math.max(60, settings.conflictStyle)
    settings.primaryLanguageStyle = "Military"
  }
}

function analyzeBackground(background: string, settings: PersonalitySettings) {
  const bgLower = background.toLowerCase()
  
  if (bgLower.includes('military') || bgLower.includes('soldier') || bgLower.includes('army')) {
    settings.primaryLanguageStyle = "Military"
    settings.conscientiousness = Math.max(70, settings.conscientiousness)
    settings.authorityRespect = Math.max(60, settings.authorityRespect)
  } else if (bgLower.includes('academic') || bgLower.includes('university') || bgLower.includes('scholar')) {
    settings.educationLevel = "Advanced Degree"
    settings.primaryLanguageStyle = "Academic"
    settings.openness = Math.max(70, settings.openness)
  } else if (bgLower.includes('street') || bgLower.includes('criminal') || bgLower.includes('gang')) {
    settings.socialClass = "Criminal"
    settings.primaryLanguageStyle = "Street Slang"
    settings.trustLevel = Math.min(35, settings.trustLevel)
    settings.riskTolerance = Math.max(70, settings.riskTolerance)
  }
}

 