// Server-side Supabase identity resolution for API routes (Phase 2).
//
// Replaces the deleted custom JWT stack (the old in-memory session store,
// auth middleware, and app/api/auth/* routes). Identity now comes from a
// Supabase Auth session forwarded by
// the client as `Authorization: Bearer <supabase access token>`. A per-request
// client is built with the anon key + that header so every query it runs is
// RLS-enforced as the calling user — the service role is never used for
// user-facing reads/writes.
//
// When Supabase env vars are unset/placeholders (logged-out deployments, local
// dev without a project) everything here degrades to null and routes fall back
// to their logged-out behavior.

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey || anonKey === 'placeholder' || url.includes('placeholder')) return null
  try {
    new URL(url)
  } catch {
    return null
  }
  return { url, anonKey }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null
}

/**
 * Per-request Supabase client that forwards the caller's Authorization header,
 * so RLS applies as that user. Returns null when Supabase isn't configured.
 */
export function createUserScopedClient(authHeader: string): SupabaseClient | null {
  const env = getSupabaseEnv()
  if (!env) return null
  return createClient(env.url, env.anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Anonymous (no-session) client for routes serving logged-out callers — only
 * anon-executable RPCs and anon-visible rows are reachable through it.
 */
export function createAnonClient(): SupabaseClient | null {
  const env = getSupabaseEnv()
  if (!env) return null
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export interface RequestUser {
  user: User
  /** RLS-enforced client scoped to this user's JWT. */
  client: SupabaseClient
}

/**
 * Resolve the authenticated Supabase user from `Authorization: Bearer <jwt>`.
 * Returns null when the header is absent, the token is invalid/expired, or
 * Supabase isn't configured — callers treat null as "logged out".
 */
export async function getRequestUser(request: NextRequest): Promise<RequestUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !/^Bearer\s+\S+/i.test(authHeader)) return null

  const client = createUserScopedClient(authHeader)
  if (!client) return null

  try {
    const { data, error } = await client.auth.getUser()
    if (error || !data?.user) return null
    return { user: data.user, client }
  } catch {
    return null
  }
}
