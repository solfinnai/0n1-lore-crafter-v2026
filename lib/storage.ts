// Utility functions for storing and retrieving soul data from localStorage

import type { CharacterData } from "./types"

const STORAGE_KEY = "oni-souls"

export interface StoredSoul {
  id: string // Unique ID for the soul (timestamp + pfpId)
  createdAt: string // ISO date string
  lastUpdated: string // ISO date string
  data: CharacterData
}

// Get all stored souls
export function getStoredSouls(): StoredSoul[] {
  if (typeof window === "undefined") return []

  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) return []
    return JSON.parse(storedData)
  } catch (error) {
    console.error("Error retrieving stored souls:", error)
    return []
  }
}

// Check if a soul exists for a specific NFT
export function soulExistsForNft(pfpId: string): boolean {
  const souls = getStoredSouls()
  return souls.some((soul) => soul.data.pfpId === pfpId)
}

// Get a specific soul by NFT ID
export function getSoulByNftId(pfpId: string): StoredSoul | null {
  const souls = getStoredSouls()
  return souls.find((soul) => soul.data.pfpId === pfpId) || null
}

// Get a specific soul by ID
export function getSoulById(id: string): StoredSoul | null {
  const souls = getStoredSouls()
  return souls.find((soul) => soul.id === id) || null
}

// Store a new soul or update an existing one
export function storeSoul(characterData: CharacterData): string {
  console.log("🟣 STORAGE.TS - storeSoul called")
  console.log("- pfpId:", characterData.pfpId)
  console.log("- soulName:", characterData.soulName)
  
  const souls = getStoredSouls()
  console.log("- Current souls count:", souls.length)

  // Check if a soul already exists for this NFT
  const existingIndex = souls.findIndex((soul) => soul.data.pfpId === characterData.pfpId)
  const timestamp = new Date().toISOString()
  
  if (existingIndex >= 0) {
    console.log("- Updating existing soul at index:", existingIndex)
    // Update existing soul
    const existingSoul = souls[existingIndex]
    const updatedSoul: StoredSoul = {
      ...existingSoul,
      lastUpdated: timestamp,
      data: characterData,
    }
    souls[existingIndex] = updatedSoul
    localStorage.setItem(STORAGE_KEY, JSON.stringify(souls))
    
    console.log("✅ Soul updated in localStorage")
    
    // Dispatch a storage event to notify other tabs/components
    window.dispatchEvent(new Event("storage"))
    
    return existingSoul.id
  } else {
    console.log("- Creating new soul")
    // Add new soul
    const id = `${timestamp}-${characterData.pfpId}`
    const newSoul: StoredSoul = {
      id,
      createdAt: timestamp,
      lastUpdated: timestamp,
      data: characterData,
    }
    souls.push(newSoul)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(souls))
    
    console.log("✅ New soul created with ID:", id)
    console.log("- Total souls after save:", souls.length)
    
    // Dispatch a storage event to notify other tabs/components
    window.dispatchEvent(new Event("storage"))
    
    return id
  }
}

// Update an existing soul by ID
export function updateSoul(id: string, characterData: CharacterData): boolean {
  const souls = getStoredSouls()
  const existingIndex = souls.findIndex((soul) => soul.id === id)
  
  if (existingIndex >= 0) {
    souls[existingIndex] = {
      ...souls[existingIndex],
      lastUpdated: new Date().toISOString(),
      data: characterData,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(souls))
    
    // Dispatch a storage event to notify other tabs/components
    window.dispatchEvent(new Event("storage"))
    
    return true
  }
  
  return false
}

// Delete a soul
export function deleteSoul(id: string): boolean {
  const souls = getStoredSouls()
  const filteredSouls = souls.filter((soul) => soul.id !== id)

  if (filteredSouls.length === souls.length) {
    return false // Nothing was deleted
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSouls))
  
  // Dispatch a storage event to notify other tabs/components
  window.dispatchEvent(new Event("storage"))
  
  return true
}
