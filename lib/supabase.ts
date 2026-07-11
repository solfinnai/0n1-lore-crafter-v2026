import { createClient } from '@supabase/supabase-js'

// Client-side environment variables (available in browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Server-side only environment variables
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if the URL is valid (not a placeholder)
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return !url.includes('placeholder')
  } catch {
    return false
  }
}

// Validate required environment variables
const hasValidSupabaseConfig = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'placeholder'

if (!hasValidSupabaseConfig) {
  console.warn('Supabase environment variables not found or are placeholders. Supabase functionality will be disabled.')
}

// Regular client for client-side operations (safe to use in browser)
export const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Admin client for server-side operations that need elevated permissions
// This should only be used on the server side
export const supabaseAdmin = typeof window === 'undefined' && hasValidSupabaseConfig && supabaseServiceRoleKey && supabaseServiceRoleKey !== 'placeholder'
  ? createClient(supabaseUrl!, supabaseServiceRoleKey)
  : null

// Database types for TypeScript support
export interface Database {
  public: {
    Tables: {
      character_souls: {
        Row: {
          id: string
          nft_id: string
          wallet_address: string
          character_name: string | null
          archetype: string | null
          background: string | null
          personality_data: any
          traits: any
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nft_id: string
          wallet_address: string
          character_name?: string | null
          archetype?: string | null
          background?: string | null
          personality_data: any
          traits: any
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nft_id?: string
          wallet_address?: string
          character_name?: string | null
          archetype?: string | null
          background?: string | null
          personality_data?: any
          traits?: any
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_memory: {
        Row: {
          id: string
          nft_id: string
          wallet_address: string
          character_name: string | null
          messages: any
          key_memories: any
          user_profile: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nft_id: string
          wallet_address: string
          character_name?: string | null
          messages?: any
          key_memories?: any
          user_profile?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nft_id?: string
          wallet_address?: string
          character_name?: string | null
          messages?: any
          key_memories?: any
          user_profile?: any
          created_at?: string
          updated_at?: string
        }
      }
      memory_segments: {
        Row: {
          id: string
          nft_id: string
          wallet_address: string
          message_id: string | null
          text_content: string
          start_index: number | null
          end_index: number | null
          tags: any
          importance: number | null
          created_at: string
        }
        Insert: {
          id?: string
          nft_id: string
          wallet_address: string
          message_id?: string | null
          text_content: string
          start_index?: number | null
          end_index?: number | null
          tags?: any
          importance?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          nft_id?: string
          wallet_address?: string
          message_id?: string | null
          text_content?: string
          start_index?: number | null
          end_index?: number | null
          tags?: any
          importance?: number | null
          created_at?: string
        }
      }
      chat_archives: {
        Row: {
          id: string
          character_id: string
          wallet_address: string
          character_name: string | null
          title: string | null
          summary: string | null
          messages: any
          memory_segments: any
          metadata: any
          session_start: string | null
          session_end: string | null
          message_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          character_id: string
          wallet_address: string
          character_name?: string | null
          title?: string | null
          summary?: string | null
          messages: any
          memory_segments?: any
          metadata?: any
          session_start?: string | null
          session_end?: string | null
          message_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          wallet_address?: string
          character_name?: string | null
          title?: string | null
          summary?: string | null
          messages?: any
          memory_segments?: any
          metadata?: any
          session_start?: string | null
          session_end?: string | null
          message_count?: number | null
          created_at?: string
        }
      }
      memory_profiles: {
        Row: {
          id: string
          nft_id: string
          wallet_address: string
          context_entries: any
          tag_management: any
          character_evolution: any
          overview_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nft_id: string
          wallet_address: string
          context_entries?: any
          tag_management?: any
          character_evolution?: any
          overview_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nft_id?: string
          wallet_address?: string
          context_entries?: any
          tag_management?: any
          character_evolution?: any
          overview_data?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 