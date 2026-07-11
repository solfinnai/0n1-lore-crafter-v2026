// Privacy filters for sensitive information in exports
export interface PrivacyPattern {
  id: string
  name: string
  pattern: RegExp
  replacement: string
  enabled: boolean
  isCustom: boolean
}

// Default privacy patterns for personal identifiers
export const DEFAULT_PRIVACY_PATTERNS: PrivacyPattern[] = [
  {
    id: 'email',
    name: 'Email Addresses',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL_REDACTED]',
    enabled: true,
    isCustom: false
  },
  {
    id: 'phone',
    name: 'Phone Numbers',
    pattern: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    replacement: '[PHONE_REDACTED]',
    enabled: true,
    isCustom: false
  },
  {
    id: 'ssn',
    name: 'Social Security Numbers',
    pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    replacement: '[SSN_REDACTED]',
    enabled: true,
    isCustom: false
  },
  {
    id: 'credit_card',
    name: 'Credit Card Numbers',
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    replacement: '[CARD_REDACTED]',
    enabled: true,
    isCustom: false
  },
  {
    id: 'address',
    name: 'Street Addresses',
    pattern: /\b\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
    replacement: '[ADDRESS_REDACTED]',
    enabled: true,
    isCustom: false
  },
  {
    id: 'ip_address',
    name: 'IP Addresses',
    pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    replacement: '[IP_REDACTED]',
    enabled: true,
    isCustom: false
  },
  {
    id: 'wallet_address',
    name: 'Crypto Wallet Addresses',
    pattern: /\b0x[a-fA-F0-9]{40}\b/g,
    replacement: '[WALLET_REDACTED]',
    enabled: true,
    isCustom: false
  }
]

export interface PrivacySettings {
  enabled: boolean
  patterns: PrivacyPattern[]
}

// Load privacy settings from localStorage
export function loadPrivacySettings(nftId: string): PrivacySettings {
  try {
    const saved = localStorage.getItem(`privacy-settings-${nftId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        enabled: parsed.enabled || false,
        patterns: parsed.patterns || DEFAULT_PRIVACY_PATTERNS
      }
    }
  } catch (error) {
    console.error('Error loading privacy settings:', error)
  }
  
  return {
    enabled: false,
    patterns: DEFAULT_PRIVACY_PATTERNS
  }
}

// Save privacy settings to localStorage
export function savePrivacySettings(nftId: string, settings: PrivacySettings): void {
  try {
    localStorage.setItem(`privacy-settings-${nftId}`, JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving privacy settings:', error)
  }
}

// Apply privacy filters to text
export function applyPrivacyFilters(text: string, settings: PrivacySettings): string {
  if (!settings.enabled) {
    return text
  }

  let filteredText = text
  
  // Apply each enabled pattern
  settings.patterns.forEach(pattern => {
    if (pattern.enabled) {
      filteredText = filteredText.replace(pattern.pattern, pattern.replacement)
    }
  })

  return filteredText
}

// Create a new custom privacy pattern
export function createCustomPattern(
  name: string,
  patternString: string,
  replacement: string,
  flags: string = 'g'
): PrivacyPattern | null {
  try {
    const pattern = new RegExp(patternString, flags)
    return {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      pattern,
      replacement,
      enabled: true,
      isCustom: true
    }
  } catch (error) {
    console.error('Invalid regex pattern:', error)
    return null
  }
}

// Validate a regex pattern
export function validateRegexPattern(patternString: string, flags: string = 'g'): boolean {
  try {
    new RegExp(patternString, flags)
    return true
  } catch (error) {
    return false
  }
}

// Get pattern statistics (how many matches found)
export function getPatternStats(text: string, pattern: PrivacyPattern): number {
  if (!pattern.enabled) return 0
  
  const matches = text.match(pattern.pattern)
  return matches ? matches.length : 0
}

// Preview what would be filtered
export function previewPrivacyFilters(text: string, settings: PrivacySettings): {
  originalText: string
  filteredText: string
  matchCount: number
  patternMatches: { pattern: PrivacyPattern; count: number }[]
} {
  const patternMatches = settings.patterns
    .filter(p => p.enabled)
    .map(pattern => ({
      pattern,
      count: getPatternStats(text, pattern)
    }))

  const filteredText = applyPrivacyFilters(text, settings)
  const totalMatches = patternMatches.reduce((sum, pm) => sum + pm.count, 0)

  return {
    originalText: text,
    filteredText,
    matchCount: totalMatches,
    patternMatches
  }
} 