// Storage wrapper - single point to switch between storage implementations
// This allows us to easily migrate all components by changing one line

// Use hybrid storage (localStorage + Supabase)
export * from './storage-hybrid'

// To revert to localStorage only, uncomment this line and comment the above:
// export * from './storage' 