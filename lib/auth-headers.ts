/**
 * Auth headers for client fetches to API routes (Phase 2 accounts).
 *
 * Server routes resolve identity from `Authorization: Bearer <jwt>` via
 * lib/supabase-server.ts getRequestUser(). This helper produces that header
 * from the current Supabase session so client callers can spread it into
 * their fetch options. Returns {} when Supabase is not configured or the
 * user is signed out — callers work identically logged-out.
 */

import { supabase } from '@/lib/supabase'

export async function authHeaders(): Promise<Record<string, string>> {
  if (!supabase) return {}
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}
