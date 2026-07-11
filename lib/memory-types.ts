import type { CharacterData } from "./types"
import type { ConversationMemory } from "./memory"
import type { EnhancedMemory } from "./memory-enhanced"

// Context entry type for unified tagging system
export interface ContextEntry {
  id: string
  type: "session" | "plot" | "note" | "world" | "context" // added "context" for entries from ContextProvider
  title?: string
  content: string
  tags: string[]
  customTags: string[] // user-created tags
  importance?: number
  date: Date
  
  // Type-specific properties
  sessionData?: {
    importance: number
  }
  plotData?: {
    status: "active" | "completed" | "shelved"
    priority: number
  }
  noteData?: {
    category: "general" | "reminder" | "insight" | "plan" | "observation"
  }
  worldData?: {
    type: "location" | "organization" | "event" | "custom"
    name: string
    connections: string[]
  }
}

// Tag management
export interface TagManagement {
  pinnedTags: string[] // user's favorite tags for quick access
  customTags: Array<{
    name: string
    color?: string
    description?: string
    createdDate: Date
    usageCount: number
  }>
  tagCategories: Array<{
    name: string
    tags: string[]
    isPinned: boolean
  }>
}

// Enhanced memory management data structure
export interface CharacterMemoryProfile {
  id: string
  nftId: string
  characterData: CharacterData
  conversationMemory: ConversationMemory
  enhancedMemory: EnhancedMemory
  
  // Overview data
  overview: {
    lastActivity: Date
    totalInteractions: number
    relationshipLevel: "new" | "acquaintance" | "friend" | "close" | "intimate"
    personalityGrowth: string[]
    keyMilestones: Array<{
      id: string
      title: string
      description: string
      date: Date
      significance: number
    }>
  }
  
  // Character profile updates/evolution
  characterEvolution: {
    personalityChanges: Array<{
      id: string
      aspect: string
      oldValue: string
      newValue: string
      reason: string
      date: Date
    }>
    newTraits: Array<{
      id: string
      traitName: string
      description: string
      dateAcquired: Date
      context: string
    }>
    relationships: Array<{
      id: string
      type: "person" | "place" | "concept" | "entity"
      name: string
      description: string
      relationshipType: string
      significance: number
      history: string[]
      dateEstablished: Date
    }>
  }
  
  // Context & Notes - UPDATED with unified entries
  contextNotes: {
    // Unified context entries with tagging support
    contextEntries: ContextEntry[]
    
    // Tag management
    tagManagement: TagManagement
    
    // Legacy arrays (kept for backwards compatibility)
    sessionNotes: Array<{
      id: string
      title: string
      content: string
      date: Date
      tags: string[]
      importance: number
    }>
    plotHooks: Array<{
      id: string
      title: string
      description: string
      status: "active" | "completed" | "shelved"
      priority: number
      dateCreated: Date
      tags?: string[]
    }>
    freeformNotes: Array<{
      id: string
      content: string
      category: "general" | "reminder" | "insight" | "plan" | "observation"
      date: Date
      tags: string[]
    }>
    worldBuilding: Array<{
      id: string
      type: "location" | "organization" | "event" | "custom"
      name: string
      description: string
      connections: string[]
      dateAdded: Date
      tags?: string[]
    }>
  }
  
  // Metadata
  metadata: {
    createdAt: Date
    lastUpdated: Date
    version: string
    walletAddress?: string
  }
}

// Helper types for the memory tabs
export interface MemoryTab {
  id: string
  name: string
  icon: React.ComponentType
  component: React.ComponentType<MemoryTabProps>
}

export interface MemoryTabProps {
  memoryProfile: CharacterMemoryProfile
  onUpdate: (updates: Partial<CharacterMemoryProfile>) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
}

// Memory entry creation helpers
export interface NewMemoryEntry {
  type: "note" | "milestone" | "relationship" | "trait" | "plothook" | "worldbuilding"
  title?: string
  content: string
  tags?: string[]
  importance?: number
  category?: string
}

// Storage functions for the new memory system
const MEMORY_PROFILES_KEY = "oni-memory-profiles"

export function getMemoryProfile(nftId: string): CharacterMemoryProfile | null {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const stored = localStorage.getItem(MEMORY_PROFILES_KEY)
    if (!stored) return null
    
    const profiles: Record<string, CharacterMemoryProfile> = JSON.parse(stored)
    const profile = profiles[nftId]
    
    if (profile) {
      // Ensure contextNotes structure exists with required properties
      if (!profile.contextNotes) {
        profile.contextNotes = {
          sessionNotes: [],
          plotHooks: [],
          freeformNotes: [],
          worldBuilding: [],
          contextEntries: [],
          tagManagement: {
            pinnedTags: [],
            customTags: [],
            tagCategories: []
          }
        }
      }
      
      // Ensure contextEntries exists (for backwards compatibility)
      if (!profile.contextNotes.contextEntries) {
        profile.contextNotes.contextEntries = []
      }
      
      // Ensure tagManagement exists (for backwards compatibility)
      if (!profile.contextNotes.tagManagement) {
        profile.contextNotes.tagManagement = {
          pinnedTags: [],
          customTags: [],
          tagCategories: []
        }
      }
      
      // Parse dates
      profile.metadata.createdAt = new Date(profile.metadata.createdAt)
      profile.metadata.lastUpdated = new Date(profile.metadata.lastUpdated)
      profile.overview.lastActivity = new Date(profile.overview.lastActivity)
      
      // Parse other date fields (with safety checks)
      profile.overview.keyMilestones = (profile.overview.keyMilestones || []).map(m => ({
        ...m,
        date: new Date(m.date)
      }))
      
      profile.characterEvolution.personalityChanges = (profile.characterEvolution.personalityChanges || []).map(c => ({
        ...c,
        date: new Date(c.date)
      }))
      
      profile.characterEvolution.newTraits = (profile.characterEvolution.newTraits || []).map(t => ({
        ...t,
        dateAcquired: new Date(t.dateAcquired)
      }))
      
      profile.characterEvolution.relationships = (profile.characterEvolution.relationships || []).map(r => ({
        ...r,
        dateEstablished: new Date(r.dateEstablished)
      }))
      
      profile.contextNotes.sessionNotes = (profile.contextNotes.sessionNotes || []).map(n => ({
        ...n,
        date: new Date(n.date)
      }))
      
      profile.contextNotes.plotHooks = (profile.contextNotes.plotHooks || []).map(p => ({
        ...p,
        dateCreated: new Date(p.dateCreated)
      }))
      
      profile.contextNotes.freeformNotes = (profile.contextNotes.freeformNotes || []).map(n => ({
        ...n,
        date: new Date(n.date)
      }))
      
      profile.contextNotes.worldBuilding = (profile.contextNotes.worldBuilding || []).map(w => ({
        ...w,
        dateAdded: new Date(w.dateAdded)
      }))
      
      // Parse context entries if they exist
      if (profile.contextNotes.contextEntries && profile.contextNotes.contextEntries.length > 0) {
        profile.contextNotes.contextEntries = profile.contextNotes.contextEntries.map(entry => ({
          ...entry,
          date: new Date(entry.date)
        }))
      }
      
      // Parse tag management dates if they exist
      if (profile.contextNotes.tagManagement?.customTags) {
        profile.contextNotes.tagManagement.customTags = profile.contextNotes.tagManagement.customTags.map(tag => ({
          ...tag,
          createdDate: new Date(tag.createdDate)
        }))
      }
    }
    
    return profile || null
  } catch (error) {
    console.error("Error loading memory profile:", error)
    return null
  }
}

export function saveMemoryProfile(profile: CharacterMemoryProfile): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const stored = localStorage.getItem(MEMORY_PROFILES_KEY)
    const profiles: Record<string, CharacterMemoryProfile> = stored ? JSON.parse(stored) : {}
    
    profiles[profile.nftId] = {
      ...profile,
      metadata: {
        ...profile.metadata,
        lastUpdated: new Date(),
      }
    }
    
    localStorage.setItem(MEMORY_PROFILES_KEY, JSON.stringify(profiles))
    
    // Dispatch storage event for other tabs
    window.dispatchEvent(new Event("storage"))
  } catch (error) {
    console.error("Error saving memory profile:", error)
  }
}

export function createDefaultMemoryProfile(nftId: string, characterData: CharacterData, conversationMemory: ConversationMemory, enhancedMemory: EnhancedMemory): CharacterMemoryProfile {
  return {
    id: `memory-profile-${nftId}-${Date.now()}`,
    nftId,
    characterData,
    conversationMemory,
    enhancedMemory,
    
    overview: {
      lastActivity: new Date(),
      totalInteractions: conversationMemory.messages.length,
      relationshipLevel: "new",
      personalityGrowth: [],
      keyMilestones: []
    },
    
    characterEvolution: {
      personalityChanges: [],
      newTraits: [],
      relationships: []
    },
    
    contextNotes: {
      sessionNotes: [],
      plotHooks: [],
      freeformNotes: [],
      worldBuilding: [],
      contextEntries: [],
      tagManagement: {
        pinnedTags: [],
        customTags: [],
        tagCategories: []
      }
    },
    
    metadata: {
      createdAt: new Date(),
      lastUpdated: new Date(),
      version: "1.0.0"
    }
  }
}

// Utility functions for tag management
export function addContextEntry(profile: CharacterMemoryProfile, entry: Omit<ContextEntry, 'id' | 'date'>): CharacterMemoryProfile {
  const newEntry: ContextEntry = {
    ...entry,
    id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date()
  }
  
  // Update tag management for any new custom tags
  const updatedProfile = updateTagManagement(profile, entry.customTags)
  
  return {
    ...updatedProfile,
    contextNotes: {
      ...updatedProfile.contextNotes,
      contextEntries: [...updatedProfile.contextNotes.contextEntries, newEntry]
    },
    metadata: {
      ...updatedProfile.metadata,
      lastUpdated: new Date()
    }
  }
}

function updateTagManagement(profile: CharacterMemoryProfile, newTags: string[]): CharacterMemoryProfile {
  const { tagManagement } = profile.contextNotes
  const updatedCustomTags = [...tagManagement.customTags]
  
  // Add new custom tags that don't already exist
  newTags.forEach(tagName => {
    const existingTag = updatedCustomTags.find(t => t.name.toLowerCase() === tagName.toLowerCase())
    if (existingTag) {
      existingTag.usageCount++
    } else if (tagName.trim()) {
      updatedCustomTags.push({
        name: tagName.trim(),
        createdDate: new Date(),
        usageCount: 1
      })
    }
  })
  
  return {
    ...profile,
    contextNotes: {
      ...profile.contextNotes,
      tagManagement: {
        ...tagManagement,
        customTags: updatedCustomTags
      }
    }
  }
}

export function pinTag(profile: CharacterMemoryProfile, tagName: string): CharacterMemoryProfile {
  const { tagManagement } = profile.contextNotes
  const pinnedTags = [...tagManagement.pinnedTags]
  
  if (!pinnedTags.includes(tagName)) {
    pinnedTags.push(tagName)
  }
  
  return {
    ...profile,
    contextNotes: {
      ...profile.contextNotes,
      tagManagement: {
        ...tagManagement,
        pinnedTags
      }
    }
  }
}

export function unpinTag(profile: CharacterMemoryProfile, tagName: string): CharacterMemoryProfile {
  const { tagManagement } = profile.contextNotes
  
  return {
    ...profile,
    contextNotes: {
      ...profile.contextNotes,
      tagManagement: {
        ...tagManagement,
        pinnedTags: tagManagement.pinnedTags.filter(t => t !== tagName)
      }
    }
  }
}

export function getAllTags(profile: CharacterMemoryProfile): string[] {
  const { contextEntries, tagManagement } = profile.contextNotes
  
  // Get all tags from context entries
  const allTags = new Set<string>()
  
  contextEntries.forEach(entry => {
    entry.tags.forEach(tag => allTags.add(tag))
    entry.customTags.forEach(tag => allTags.add(tag))
  })
  
  // Add custom tags from tag management
  tagManagement.customTags.forEach(tag => allTags.add(tag.name))
  
  return Array.from(allTags).sort()
}

export function getEntriesByTag(profile: CharacterMemoryProfile, tagName: string): ContextEntry[] {
  return profile.contextNotes.contextEntries.filter(entry => 
    entry.tags.includes(tagName) || entry.customTags.includes(tagName)
  )
}

export function getEntriesByType(profile: CharacterMemoryProfile, type: ContextEntry['type']): ContextEntry[] {
  return profile.contextNotes.contextEntries.filter(entry => entry.type === type)
}

// Migration function to convert legacy entries to new format
export function migrateLegacyEntries(profile: CharacterMemoryProfile): CharacterMemoryProfile {
  const contextEntries: ContextEntry[] = [...profile.contextNotes.contextEntries]
  
  // Migrate session notes
  profile.contextNotes.sessionNotes.forEach(note => {
    if (!contextEntries.find(e => e.id === note.id)) {
      contextEntries.push({
        id: note.id,
        type: "session",
        title: note.title,
        content: note.content,
        tags: note.tags,
        customTags: [],
        importance: note.importance,
        date: note.date,
        sessionData: {
          importance: note.importance
        }
      })
    }
  })
  
  // Migrate plot hooks
  profile.contextNotes.plotHooks.forEach(plot => {
    if (!contextEntries.find(e => e.id === plot.id)) {
      contextEntries.push({
        id: plot.id,
        type: "plot",
        title: plot.title,
        content: plot.description,
        tags: plot.tags || [],
        customTags: [],
        date: plot.dateCreated,
        plotData: {
          status: plot.status,
          priority: plot.priority
        }
      })
    }
  })
  
  // Migrate freeform notes
  profile.contextNotes.freeformNotes.forEach(note => {
    if (!contextEntries.find(e => e.id === note.id)) {
      contextEntries.push({
        id: note.id,
        type: "note",
        content: note.content,
        tags: note.tags,
        customTags: [],
        date: note.date,
        noteData: {
          category: note.category
        }
      })
    }
  })
  
  // Migrate world building
  profile.contextNotes.worldBuilding.forEach(world => {
    if (!contextEntries.find(e => e.id === world.id)) {
      contextEntries.push({
        id: world.id,
        type: "world",
        title: world.name,
        content: world.description,
        tags: world.tags || [],
        customTags: [],
        date: world.dateAdded,
        worldData: {
          type: world.type,
          name: world.name,
          connections: world.connections
        }
      })
    }
  })
  
  return {
    ...profile,
    contextNotes: {
      ...profile.contextNotes,
      contextEntries
    }
  }
} 