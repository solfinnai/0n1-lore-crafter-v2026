// Enhanced storage layer with Supabase integration and localStorage fallback
import type { CharacterData } from "./types"
import { supabase, supabaseAdmin } from "./supabase"
import { getStoredSouls as getLocalStoredSouls, storeSoul as storeLocalSoul, getSoulByNftId as getLocalSoulByNftId } from "./storage"

export interface StoredSoul {
  id: string
  createdAt: string
  lastUpdated: string
  data: CharacterData
  wallet_address?: string // Added for Supabase
}

// Configuration to enable/disable Supabase
const USE_SUPABASE = supabase !== null

// Get current wallet address (you'll need to pass this from your components)
let currentWalletAddress: string | null = null

export function setCurrentWalletAddress(address: string | null) {
  currentWalletAddress = address
}

export function getCurrentWalletAddress(): string | null {
  return currentWalletAddress
}

// Get all stored souls for the current wallet
export async function getStoredSouls(): Promise<StoredSoul[]> {
  if (!USE_SUPABASE || !currentWalletAddress || !supabase) {
    // Fallback to localStorage
    const localSouls = getLocalStoredSouls()
    return localSouls.map(soul => ({
      ...soul,
      wallet_address: currentWalletAddress || undefined
    }))
  }

  try {
    const { data, error } = await supabase
      .from('character_souls')
      .select('*')
      .eq('wallet_address', currentWalletAddress)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching souls from Supabase:', error)
      // Fallback to localStorage on error
      const localSouls = getLocalStoredSouls()
      return localSouls.map(soul => ({
        ...soul,
        wallet_address: currentWalletAddress || undefined
      }))
    }

    // Transform Supabase data to match our interface
    return data.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      lastUpdated: row.updated_at,
      wallet_address: row.wallet_address,
      data: {
        pfpId: row.nft_id,
        soulName: row.character_name || '',
        archetype: row.archetype || '',
        background: row.background || '',
        traits: row.traits || [],
        imageUrl: row.image_url || undefined,
        ...row.personality_data,
      }
    }))
  } catch (error) {
    console.error('Error in getStoredSouls:', error)
    // Fallback to localStorage
    const localSouls = getLocalStoredSouls()
    return localSouls.map(soul => ({
      ...soul,
      wallet_address: currentWalletAddress || undefined
    }))
  }
}

// Check if a soul exists for a specific NFT
export async function soulExistsForNft(pfpId: string): Promise<boolean> {
  if (!USE_SUPABASE || !currentWalletAddress || !supabase) {
    // Fallback to localStorage
    return getLocalSoulByNftId(pfpId) !== null
  }

  try {
    const { data, error } = await supabase
      .from('character_souls')
      .select('id')
      .eq('nft_id', pfpId)
      .eq('wallet_address', currentWalletAddress)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking soul existence:', error)
      return getLocalSoulByNftId(pfpId) !== null
    }

    return data !== null
  } catch (error) {
    console.error('Error in soulExistsForNft:', error)
    return getLocalSoulByNftId(pfpId) !== null
  }
}

// Get a specific soul by NFT ID
export async function getSoulByNftId(pfpId: string): Promise<StoredSoul | null> {
  if (!USE_SUPABASE || !currentWalletAddress || !supabase) {
    // Fallback to localStorage
    const localSoul = getLocalSoulByNftId(pfpId)
    return localSoul ? {
      ...localSoul,
      wallet_address: currentWalletAddress || undefined
    } : null
  }

  try {
    const { data, error } = await supabase
      .from('character_souls')
      .select('*')
      .eq('nft_id', pfpId)
      .eq('wallet_address', currentWalletAddress)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      console.error('Error fetching soul by NFT ID:', error)
      // Fallback to localStorage
      const localSoul = getLocalSoulByNftId(pfpId)
      return localSoul ? {
        ...localSoul,
        wallet_address: currentWalletAddress || undefined
      } : null
    }

    // Transform Supabase data to match our interface
    return {
      id: data.id,
      createdAt: data.created_at,
      lastUpdated: data.updated_at,
      wallet_address: data.wallet_address,
      data: {
        pfpId: data.nft_id,
        soulName: data.character_name || '',
        archetype: data.archetype || '',
        background: data.background || '',
        traits: data.traits || [],
        imageUrl: data.image_url || undefined,
        ...data.personality_data,
      }
    }
  } catch (error) {
    console.error('Error in getSoulByNftId:', error)
    // Fallback to localStorage
    const localSoul = getLocalSoulByNftId(pfpId)
    return localSoul ? {
      ...localSoul,
      wallet_address: currentWalletAddress || undefined
    } : null
  }
}

// Store a new soul or update an existing one
export async function storeSoul(characterData: CharacterData): Promise<string> {
  const walletAddress = currentWalletAddress

  if (!USE_SUPABASE || !walletAddress || !supabase) {
    // Fallback to localStorage
    return storeLocalSoul(characterData)
  }

  try {
    // Check if soul already exists
    const existingSoul = await getSoulByNftId(characterData.pfpId)
    
    if (existingSoul) {
      // Update existing soul
      const { data, error } = await supabase
        .from('character_souls')
        .update({
          character_name: characterData.soulName,
          archetype: characterData.archetype,
          background: characterData.background,
          personality_data: {
            hopesFears: characterData.hopesFears,
            personalityProfile: characterData.personalityProfile,
            motivations: characterData.motivations,
            relationships: characterData.relationships,
            worldPosition: characterData.worldPosition,
            voice: characterData.voice,
            symbolism: characterData.symbolism,
            powersAbilities: characterData.powersAbilities,
          },
          traits: characterData.traits,
          image_url: characterData.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('nft_id', characterData.pfpId)
        .eq('wallet_address', walletAddress)
        .select('id')
        .single()

      if (error) {
        console.error('Error updating soul in Supabase:', error)
        // Fallback to localStorage
        return storeLocalSoul(characterData)
      }

      // Also store in localStorage for offline access
      storeLocalSoul(characterData)
      return data.id
    } else {
      // Insert new soul
      const { data, error } = await supabase
        .from('character_souls')
        .insert({
          nft_id: characterData.pfpId,
          wallet_address: walletAddress,
          character_name: characterData.soulName,
          archetype: characterData.archetype,
          background: characterData.background,
          personality_data: {
            hopesFears: characterData.hopesFears,
            personalityProfile: characterData.personalityProfile,
            motivations: characterData.motivations,
            relationships: characterData.relationships,
            worldPosition: characterData.worldPosition,
            voice: characterData.voice,
            symbolism: characterData.symbolism,
            powersAbilities: characterData.powersAbilities,
          },
          traits: characterData.traits,
          image_url: characterData.imageUrl,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error inserting soul into Supabase:', error)
        // Fallback to localStorage
        return storeLocalSoul(characterData)
      }

      // Also store in localStorage for offline access
      storeLocalSoul(characterData)
      return data.id
    }
  } catch (error) {
    console.error('Error in storeSoul:', error)
    // Fallback to localStorage
    return storeLocalSoul(characterData)
  }
}

// Migration function to move localStorage data to Supabase
export async function migrateLocalStorageToSupabase(walletAddress: string): Promise<{
  success: boolean
  migratedCount: number
  errors: string[]
}> {
  if (!USE_SUPABASE || !supabase) {
    return { success: false, migratedCount: 0, errors: ['Supabase not configured'] }
  }

  const errors: string[] = []
  let migratedCount = 0

  try {
    // Set wallet address for migration
    setCurrentWalletAddress(walletAddress)

    // Get all local souls
    const localSouls = getLocalStoredSouls()
    
    for (const localSoul of localSouls) {
      try {
        // Check if already exists in Supabase
        const exists = await soulExistsForNft(localSoul.data.pfpId)
        
        if (!exists) {
          // Migrate to Supabase
          await storeSoul(localSoul.data)
          migratedCount++
          console.log(`Migrated soul for NFT ${localSoul.data.pfpId}`)
        } else {
          console.log(`Soul for NFT ${localSoul.data.pfpId} already exists in Supabase`)
        }
      } catch (error) {
        const errorMsg = `Failed to migrate NFT ${localSoul.data.pfpId}: ${error}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    }
  } catch (error) {
    const errorMsg = `Migration failed: ${error}`
    errors.push(errorMsg)
    return {
      success: false,
      migratedCount,
      errors
    }
  }
}

// Function to backup Supabase data to localStorage
export async function backupSupabaseToLocalStorage(): Promise<boolean> {
  if (!USE_SUPABASE || !currentWalletAddress || !supabase) {
    return false
  }

  try {
    const supabaseSouls = await getStoredSouls()
    
    // Store each soul in localStorage
    for (const soul of supabaseSouls) {
      storeLocalSoul(soul.data)
    }

    console.log(`Backed up ${supabaseSouls.length} souls to localStorage`)
    return true
  } catch (error) {
    console.error('Error backing up to localStorage:', error)
    return false
  }
}

// Export localStorage functions for comparison/migration
export { getStoredSouls as getLocalStoredSoulsSync } from "./storage" 