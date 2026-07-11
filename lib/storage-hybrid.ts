// Hybrid storage implementation: localStorage (fast cache) + Supabase (persistence)
import type { CharacterData } from "./types"
import { supabase } from "./supabase"
import * as localStorage from "./storage"
import type { StoredSoul } from "./storage"

// Re-export the StoredSoul type
export type { StoredSoul }

// Configuration
const SYNC_INTERVAL = 5 * 60 * 1000 // Sync every 5 minutes
const SYNC_KEY = "oni-souls-last-sync"

// Track pending syncs
const pendingSyncs = new Set<string>()
let syncTimeout: NodeJS.Timeout | null = null

// Current wallet address (set by components)
let currentWalletAddress: string | null = null

export function setCurrentWalletAddress(address: string | null) {
  currentWalletAddress = address
}

// Check if Supabase is available
function isSupabaseAvailable(): boolean {
  return supabase !== null && currentWalletAddress !== null
}

// Get the last sync timestamp
function getLastSyncTime(): number {
  if (typeof window === "undefined") return 0
  const lastSync = window.localStorage.getItem(SYNC_KEY)
  return lastSync ? parseInt(lastSync, 10) : 0
}

// Set the last sync timestamp
function setLastSyncTime(time: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SYNC_KEY, time.toString())
}

// Transform Supabase data to StoredSoul format
function transformSupabaseToLocal(row: any): StoredSoul {
  return {
    id: row.id,
    createdAt: row.created_at,
    lastUpdated: row.updated_at,
    data: {
      pfpId: row.nft_id,
      soulName: row.character_name || '',
      archetype: row.archetype || '',
      background: row.background || '',
      traits: row.traits || [],
      imageUrl: row.image_url || undefined,
      ...row.personality_data,
    }
  }
}

// Sync a single soul to Supabase
async function syncSoulToSupabase(soul: StoredSoul): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false

  try {
    const { error } = await supabase
      .from('character_souls')
      .upsert({
        id: soul.id,
        nft_id: soul.data.pfpId,
        wallet_address: currentWalletAddress!,
        character_name: soul.data.soulName,
        archetype: soul.data.archetype,
        background: soul.data.background,
        personality_data: {
          hopesFears: soul.data.hopesFears,
          personalityProfile: soul.data.personalityProfile,
          motivations: soul.data.motivations,
          relationships: soul.data.relationships,
          worldPosition: soul.data.worldPosition,
          voice: soul.data.voice,
          symbolism: soul.data.symbolism,
          powersAbilities: soul.data.powersAbilities,
        },
        traits: soul.data.traits,
        image_url: soul.data.imageUrl,
        created_at: soul.createdAt,
        updated_at: soul.lastUpdated,
      })

    if (error) {
      console.error('Error syncing soul to Supabase:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in syncSoulToSupabase:', error)
    return false
  }
}

// Sync all pending souls to Supabase
async function syncPendingToSupabase() {
  if (!isSupabaseAvailable() || pendingSyncs.size === 0) return

  console.log(`🔄 Syncing ${pendingSyncs.size} souls to Supabase...`)

  for (const soulId of pendingSyncs) {
    const soul = localStorage.getSoulById(soulId)
    if (soul) {
      const success = await syncSoulToSupabase(soul)
      if (success) {
        pendingSyncs.delete(soulId)
      }
    }
  }

  setLastSyncTime(Date.now())
  console.log(`✅ Sync complete. ${pendingSyncs.size} souls remaining in queue.`)
}

// Schedule a sync with debouncing
function scheduleSyncToSupabase(soulId: string) {
  pendingSyncs.add(soulId)

  // Clear existing timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // Schedule new sync after 2 seconds of inactivity
  syncTimeout = setTimeout(() => {
    syncPendingToSupabase()
  }, 2000)
}

// Pull latest data from Supabase
async function pullFromSupabase(): Promise<StoredSoul[]> {
  if (!isSupabaseAvailable() || !supabase) return []

  try {
    const { data, error } = await supabase
      .from('character_souls')
      .select('*')
      .eq('wallet_address', currentWalletAddress!)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error pulling from Supabase:', error)
      return []
    }

    return data.map(transformSupabaseToLocal)
  } catch (error) {
    console.error('Error in pullFromSupabase:', error)
    return []
  }
}

// Merge Supabase data with local data (Supabase wins on conflicts)
async function mergeWithSupabase() {
  if (!isSupabaseAvailable()) return

  const localSouls = localStorage.getStoredSouls()
  const remoteSouls = await pullFromSupabase()

  // Create a map of remote souls by ID for quick lookup
  const remoteMap = new Map(remoteSouls.map(soul => [soul.id, soul]))

  // Update local souls with remote data if remote is newer
  for (const remoteSoul of remoteSouls) {
    const localSoul = localStorage.getSoulById(remoteSoul.id)
    
    if (!localSoul || new Date(remoteSoul.lastUpdated) > new Date(localSoul.lastUpdated)) {
      // Remote is newer or doesn't exist locally - update local
      localStorage.updateSoul(remoteSoul.id, remoteSoul.data)
    }
  }

  // Sync local souls that don't exist in remote
  for (const localSoul of localSouls) {
    if (!remoteMap.has(localSoul.id)) {
      await syncSoulToSupabase(localSoul)
    }
  }

  setLastSyncTime(Date.now())
  console.log('✅ Merge with Supabase complete')
}

// Initialize: merge with Supabase on load
export async function initializeHybridStorage(walletAddress: string) {
  setCurrentWalletAddress(walletAddress)
  
  if (isSupabaseAvailable()) {
    // Check if we need to sync
    const lastSync = getLastSyncTime()
    const timeSinceSync = Date.now() - lastSync
    
    if (timeSinceSync > SYNC_INTERVAL) {
      await mergeWithSupabase()
    }
  }
}

// Public API (wraps localStorage with Supabase sync)

export function getStoredSouls(): StoredSoul[] {
  return localStorage.getStoredSouls()
}

export function soulExistsForNft(pfpId: string): boolean {
  return localStorage.soulExistsForNft(pfpId)
}

export function getSoulByNftId(pfpId: string): StoredSoul | null {
  return localStorage.getSoulByNftId(pfpId)
}

export function getSoulById(id: string): StoredSoul | null {
  return localStorage.getSoulById(id)
}

export function storeSoul(characterData: CharacterData): string {
  // Save to localStorage first (immediate)
  const soulId = localStorage.storeSoul(characterData)
  
  // Schedule sync to Supabase
  if (isSupabaseAvailable()) {
    scheduleSyncToSupabase(soulId)
  }
  
  return soulId
}

export function updateSoul(id: string, characterData: CharacterData): boolean {
  // Update localStorage first
  const success = localStorage.updateSoul(id, characterData)
  
  if (success && isSupabaseAvailable()) {
    scheduleSyncToSupabase(id)
  }
  
  return success
}

export function deleteSoul(id: string): boolean {
  // Delete from localStorage
  const success = localStorage.deleteSoul(id)
  
  if (success && isSupabaseAvailable() && supabase) {
    // Delete from Supabase
    supabase
      .from('character_souls')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting from Supabase:', error)
        }
      })
  }
  
  return success
}

// Manual sync function (can be called from UI)
export async function manualSync(): Promise<{
  success: boolean
  synced: number
  errors: string[]
}> {
  if (!isSupabaseAvailable()) {
    return { success: false, synced: 0, errors: ['Supabase not available'] }
  }

  const errors: string[] = []
  let synced = 0

  try {
    // First pull from Supabase
    await mergeWithSupabase()

    // Then push any pending changes
    const localSouls = localStorage.getStoredSouls()
    for (const soul of localSouls) {
      const success = await syncSoulToSupabase(soul)
      if (success) {
        synced++
      } else {
        errors.push(`Failed to sync soul ${soul.id}`)
      }
    }

    return { success: errors.length === 0, synced, errors }
  } catch (error) {
    return { success: false, synced, errors: [`Sync failed: ${error}`] }
  }
}

// Auto-sync every 5 minutes if the tab is active
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (document.visibilityState === 'visible' && isSupabaseAvailable()) {
      syncPendingToSupabase()
    }
  }, SYNC_INTERVAL)
} 