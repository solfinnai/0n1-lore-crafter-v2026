import type { CharacterMemoryProfile } from './memory-types'

export interface ExportData {
  version: string
  exportDate: Date
  profiles: CharacterMemoryProfile[]
}

export function exportMemoryProfiles(profiles: CharacterMemoryProfile[]): string {
  const exportData: ExportData = {
    version: "1.0.0",
    exportDate: new Date(),
    profiles
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function exportSingleProfile(profile: CharacterMemoryProfile): string {
  const exportData: ExportData = {
    version: "1.0.0",
    exportDate: new Date(),
    profiles: [profile]
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function parseImportData(jsonString: string): ExportData {
  try {
    const data = JSON.parse(jsonString)
    
    // Validate structure
    if (!data.version || !data.exportDate || !Array.isArray(data.profiles)) {
      throw new Error('Invalid export file format')
    }
    
    // Parse dates back to Date objects
    data.exportDate = new Date(data.exportDate)
    
    data.profiles = data.profiles.map((profile: any) => {
      // Parse all date fields
      profile.metadata.createdAt = new Date(profile.metadata.createdAt)
      profile.metadata.lastUpdated = new Date(profile.metadata.lastUpdated)
      profile.overview.lastActivity = new Date(profile.overview.lastActivity)
      
      profile.overview.keyMilestones = profile.overview.keyMilestones.map((m: any) => ({
        ...m,
        date: new Date(m.date)
      }))
      
      profile.characterEvolution.personalityChanges = profile.characterEvolution.personalityChanges.map((c: any) => ({
        ...c,
        date: new Date(c.date)
      }))
      
      profile.characterEvolution.newTraits = profile.characterEvolution.newTraits.map((t: any) => ({
        ...t,
        dateAcquired: new Date(t.dateAcquired)
      }))
      
      profile.characterEvolution.relationships = profile.characterEvolution.relationships.map((r: any) => ({
        ...r,
        dateEstablished: new Date(r.dateEstablished)
      }))
      
      profile.contextNotes.sessionNotes = profile.contextNotes.sessionNotes.map((n: any) => ({
        ...n,
        date: new Date(n.date)
      }))
      
      profile.contextNotes.plotHooks = profile.contextNotes.plotHooks.map((p: any) => ({
        ...p,
        dateCreated: new Date(p.dateCreated)
      }))
      
      profile.contextNotes.freeformNotes = profile.contextNotes.freeformNotes.map((n: any) => ({
        ...n,
        date: new Date(n.date)
      }))
      
      profile.contextNotes.worldBuilding = profile.contextNotes.worldBuilding.map((w: any) => ({
        ...w,
        dateAdded: new Date(w.dateAdded)
      }))
      
      return profile
    })
    
    return data as ExportData
  } catch (error) {
    throw new Error(`Failed to parse import file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateProfile(profile: any): boolean {
  try {
    // Basic structure validation
    return !!(
      profile.id &&
      profile.nftId &&
      profile.characterData &&
      profile.conversationMemory &&
      profile.enhancedMemory &&
      profile.overview &&
      profile.characterEvolution &&
      profile.contextNotes &&
      profile.metadata
    )
  } catch {
    return false
  }
}

export function mergeProfiles(existing: CharacterMemoryProfile[], imported: CharacterMemoryProfile[]): {
  merged: CharacterMemoryProfile[]
  conflicts: string[]
  newProfiles: CharacterMemoryProfile[]
} {
  const conflicts: string[] = []
  const newProfiles: CharacterMemoryProfile[] = []
  const merged = [...existing]
  
  imported.forEach(importedProfile => {
    const existingIndex = existing.findIndex(p => p.nftId === importedProfile.nftId)
    
    if (existingIndex >= 0) {
      // Conflict detected
      conflicts.push(`NFT #${importedProfile.nftId} (${importedProfile.characterData.soulName})`)
    } else {
      // New profile
      newProfiles.push(importedProfile)
      merged.push(importedProfile)
    }
  })
  
  return { merged, conflicts, newProfiles }
}

export function generateExportFilename(profile?: CharacterMemoryProfile): string {
  const timestamp = new Date().toISOString().split('T')[0]
  
  if (profile) {
    const safeName = profile.characterData.soulName.replace(/[^a-zA-Z0-9]/g, '_')
    return `oni_memory_${safeName}_${profile.nftId}_${timestamp}.json`
  }
  
  return `oni_memory_export_${timestamp}.json`
} 