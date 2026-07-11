export interface Trait {
  trait_type: string
  value: string
}

export interface PersonalitySettings {
  // Core Personality Traits (Big 5 + Extensions) - all 0-100
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  sarcasmLevel: number
  witHumor: number
  empathy: number
  confidence: number
  impulsiveness: number
  
  // Communication Style Controls - all 0-100
  formalityLevel: number
  verbosity: number
  directness: number
  profanityUsage: number
  technicalLanguage: number
  metaphorUsage: number
  storytellingTendency: number
  
  // Communication Style Dropdowns
  primaryLanguageStyle: string
  sentenceStructure: string
  responseSpeedStyle: string
  
  // Psychological Depth - all 0-100
  emotionalVolatility: number
  trustLevel: number
  optimism: number
  stressResponse: number
  attentionToDetail: number
  riskTolerance: number
  authorityRespect: number
  
  // Psychological Text Fields
  coreFear: string
  greatestDesire: string
  primaryDefenseMechanism: string
  
  // Background & Identity Dropdowns
  educationLevel: string
  socialClass: string
  geographicOrigin: string
  professionRole: string
  ageRange: string
  
  // Background Text Fields  
  culturalBackground: string
  religiousBeliefSystem: string
  formativeTrauma: string
  greatestAchievement: string
  
  // Relationship Dynamics - all 0-100
  dominance: number
  socialEnergy: number
  boundarySetting: number
  conflictStyle: number
  intimacyComfort: number
  loyalty: number
  mentorshipInclination: number
  
  // Relationship Dropdowns
  defaultRelationshipStance: string
  authorityResponse: string
  
  // Specialized Traits - all 0-100
  curiosityLevel: number
  philosophicalTendency: number
  creativity: number
  analyticalNature: number
  memoryForDetails: number
  physicalAwareness: number
  
  // Quirks & Personality Flavoring
  signaturePhrase: string
  speakingTic: string
  uniqueReferencePool: string
  physicalTell: string
  conversationHabit: string
  
  // Quirks Checkboxes
  usesSpecificEmoji: boolean
  speaksInQuestions: boolean
  neverUsesContractions: boolean
  frequentlyInterrupts: boolean
  alwaysGivesAdvice: boolean
  tellsStoriesInsteadOfAnswers: boolean
  usesTechnicalMetaphors: boolean
  avoidsNamingPeople: boolean
  
  // Contextual Modifiers - all 0-100
  stressAdaptability: number
  environmentalSensitivity: number
  moodStability: number
  audienceAwareness: number
  
  // Contextual Dropdowns
  primaryMotivation: string
  currentLifePhase: string
  energyLevel: string
  
  // Advanced Controls - all 0-100
  responseComplexity: number
  emotionalExpression: number
  memoryReference: number
  futureOrientation: number
  
  // Advanced Text Fields
  backstorySummary: string
  currentGoal: string
  secretHiddenAspect: string
  characterArcDirection: string
  
  // Output Controls - all 0-100
  responseLengthPreference: number
  emotionIntensity: number
  adviceGivingTendency: number
  questionAskingFrequency: number
}

export interface CharacterData {
  pfpId: string
  traits: Trait[]
  imageUrl?: string // Add imageUrl to store the NFT image
  archetype: string
  background: string
  hopesFears: {
    hopes: string
    fears: string
  }
  personalityProfile: {
    description: string // Changed to a single description field
  }
  motivations: {
    drives: string
    goals: string
    values: string
  }
  relationships: {
    friends: string
    rivals: string
    family: string
  }
  worldPosition: {
    societalRole: string
    classStatus: string
    perception: string
  }
  voice: {
    speechStyle: string
    innerDialogue: string
    uniquePhrases: string
  }
  symbolism: {
    colors: string
    items: string
    motifs: string
  }
  powersAbilities: {
    powers: string[]
    description: string
  }
  soulName: string
  
  // Advanced Psychological Features
  psychologicalArchitecture?: {
    consciousnessLayers: string
    memoryArchitecture: string
    cognitiveProcessingStyle: string
    traumaPatterns: string
    identityFragmentation: string
  }
  
  // Quantum Consciousness Features
  quantumConsciousness?: {
    evolutionStage: string
    realityBleedEffects: string
    quantumEntanglements: string
    temporalPerception: string
    observerEffects: string
  }
  
  // Digital Ecology & Environment
  digitalEcology?: {
    personalDigitalSpace: string
    digitalFamiliars: string
    environmentalResonance: string
    territorialBehaviors: string
    ecosystemRole: string
  }
  
  // Socio-Economic Position
  socioEconomics?: {
    primaryCurrencies: string[]
    economicClass: string
    laborSpecialization: string
    wealthAccumulation: string
    undergroundConnections: string
  }
  
  // Meta-Narrative Awareness
  metaNarrative?: {
    awarenessLevel: string
    nftConsciousness: string
    creatorConnection: string
    fourthWallInteraction: string
    narrativeRole: string
  }
  
  // Personality Dashboard Configuration
  personalitySettings?: PersonalitySettings
  
  // Temporal Mechanics
  temporalMechanics?: {
    timePerceptionType: string
    temporalAbilities: string
    pastSelfIntegration: string
    futureAspiration: string
    causalPatterns: string
  }
  
  // Corruption & Evolution Systems
  corruptionSystems?: {
    vulnerabilities: string[]
    resistanceMechanisms: string[]
    currentCorruptionLevel: string
    healingMethods: string
    evolutionPath: string
  }
  
  // Cultural & Subcultural Depth
  culturalDynamics?: {
    primarySubcultures: string[]
    digitalDialects: string
    culturalFusion: string
    generationalMarkers: string
    traditionInnovationBalance: string
  }
}

// OpenSea API response types
export interface OpenSeaApiResponse {
  nft: {
    identifier: string
    collection: string
    contract: string
    token_standard: string
    name: string
    description: string
    image_url: string
    metadata_url: string
    created_at: string
    updated_at: string
    is_disabled: boolean
    is_nsfw: boolean
    animation_url: string | null
    is_suspicious: boolean
    creator: string | null
    traits: OpenSeaTrait[]
    owners: any[]
    rarity: any
  }
}

export interface OpenSeaTrait {
  trait_type: string
  value: string
  display_type: string | null
  max_value: string | null
  trait_count: number
  order: number | null
}

// Wallet-related types
export interface OwnedNft {
  tokenId: string
  name: string
  imageUrl: string | null
}

export interface WalletState {
  isConnected: boolean
  address: string | null
  ownedNfts: OwnedNft[]
}

// New types for dual collection support
export interface UnifiedCharacter {
  tokenId: string
  forceImageUrl: string | null
  frameImageUrl: string | null
  hasForce: boolean
  hasFrame: boolean
  displayName: string
  // User preference storage
  preferredView?: 'force' | 'frame'
  hasSoul?: boolean
  soul?: any
}

// Enhanced CharacterData to support collection awareness
export interface CollectionAwareCharacterData extends CharacterData {
  collection?: 'force' | 'frame'
  alternateImageUrl?: string // For storing the other collection's image
}

// API response types for dual collection support
export interface UnifiedCharacterResponse {
  characters: UnifiedCharacter[]
  totalCount: number
}

export interface CollectionNftData {
  tokenId: string
  name: string
  imageUrl: string
  collection: 'force' | 'frame'
  traits: Trait[]
}
