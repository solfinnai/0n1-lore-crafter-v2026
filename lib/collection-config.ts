// Collection configuration for 0N1 Force and Frame NFTs
export type CollectionKey = 'force' | 'frame'

export interface CollectionConfig {
  contractAddress: string
  openSeaSlug: string
  displayName: string
  badgeColor: 'purple' | 'blue'
  isPrimary: boolean
}

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
  force: {
    contractAddress: "0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d",
    openSeaSlug: "0n1-force",
    displayName: "0N1 Force",
    badgeColor: "purple",
    isPrimary: true
  },
  frame: {
    contractAddress: "0x6cfc9ca8da1d69719161ccc0ba4cfa95d336f11d",
    openSeaSlug: "0n1-frame", 
    displayName: "0N1 Frame",
    badgeColor: "blue",
    isPrimary: false
  }
}

// Helper functions
export function getCollectionConfig(collection: CollectionKey): CollectionConfig {
  return COLLECTIONS[collection]
}

export function getPrimaryCollection(): CollectionKey {
  return 'force'
}

export function getCollectionByContract(contractAddress: string): CollectionKey | null {
  for (const [key, config] of Object.entries(COLLECTIONS)) {
    if (config.contractAddress.toLowerCase() === contractAddress.toLowerCase()) {
      return key as CollectionKey
    }
  }
  return null
}

export function getAllCollectionKeys(): CollectionKey[] {
  return Object.keys(COLLECTIONS) as CollectionKey[]
} 