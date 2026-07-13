/**
 * Hybrid storage — localStorage is source of truth; cloud is a mirror.
 *
 * Phase 2 rewrite (handoff §7):
 * - Whole CharacterData as JSONB (`data`), never column-decomposed
 * - Merge by nft_id (never device-local id)
 * - LWW via client-clock updated_at / lastUpdated
 * - Tombstones via deleted_at (no resurrection)
 * - Dirty-set persisted in localStorage (survives tab close)
 * - Flush on write + visibilitychange (no interval-only sync)
 * - Sample / demo wallet NEVER syncs
 *
 * Requires migration: supabase/migrations/20260712_phase2_souls_jsonb.sql
 * and a NEW Supabase project with Auth (auth.uid()). Until env is configured,
 * this module degrades to pure localStorage.
 */
import type { CharacterData } from "./types"
import { supabase } from "./supabase"
import { isDemoWallet } from "./dev-mode"
import { isSampleToken, SAMPLE_TOKEN_ID } from "./sample-token"
import * as local from "./storage"
import type { StoredSoul } from "./storage"

export type { StoredSoul }

const DIRTY_KEY = "oni-souls-dirty"
const TOMBSTONE_KEY = "oni-souls-tombstones"
const SYNC_KEY = "oni-souls-last-sync"
const SYNC_STATUS_KEY = "oni-souls-sync-status"

let currentUserId: string | null = null
let currentWalletAddress: string | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null
let syncStatus: "idle" | "syncing" | "error" | "offline" | "local-only" = "local-only"

export function setCurrentWalletAddress(address: string | null) {
  currentWalletAddress = address
}

export function setCurrentUserId(userId: string | null) {
  currentUserId = userId
}

export function getSyncStatus() {
  return syncStatus
}

function setStatus(s: typeof syncStatus) {
  syncStatus = s
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SYNC_STATUS_KEY, s)
  }
}

function cloudEnabled(): boolean {
  return (
    supabase !== null &&
    currentUserId !== null &&
    !isDemoWallet(currentWalletAddress)
  )
}

function readDirty(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = JSON.parse(window.localStorage.getItem(DIRTY_KEY) || "[]")
    return new Set(Array.isArray(raw) ? raw.map(String) : [])
  } catch {
    return new Set()
  }
}

function writeDirty(set: Set<string>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DIRTY_KEY, JSON.stringify([...set]))
}

function markDirty(nftId: string) {
  const d = readDirty()
  d.add(String(nftId))
  writeDirty(d)
  scheduleFlush()
}

function readTombstones(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(window.localStorage.getItem(TOMBSTONE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeTombstones(map: Record<string, string>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOMBSTONE_KEY, JSON.stringify(map))
}

function shouldSkipSoul(soul: StoredSoul): boolean {
  const nftId = String(soul.data?.pfpId || "")
  if (isSampleToken(nftId) || nftId === SAMPLE_TOKEN_ID) return true
  return false
}

function scheduleFlush() {
  if (!cloudEnabled()) return
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushDirty().catch(console.error)
  }, 1500)
}

async function upsertSoul(soul: StoredSoul): Promise<boolean> {
  if (!cloudEnabled() || !supabase || !currentUserId) return false
  if (shouldSkipSoul(soul)) return true

  const nftId = String(soul.data.pfpId)
  const { error } = await supabase.from("souls").upsert(
    {
      user_id: currentUserId,
      nft_id: nftId,
      local_id: soul.id,
      data: soul.data,
      created_at: soul.createdAt,
      updated_at: soul.lastUpdated,
      deleted_at: null,
    },
    { onConflict: "user_id,nft_id" },
  )

  if (error) {
    console.error("souls upsert failed", error)
    setStatus("error")
    return false
  }
  return true
}

async function tombstoneRemote(nftId: string, deletedAt: string): Promise<boolean> {
  if (!cloudEnabled() || !supabase || !currentUserId) return false
  const { error } = await supabase
    .from("souls")
    .upsert(
      {
        user_id: currentUserId,
        nft_id: nftId,
        local_id: `tombstone-${nftId}`,
        data: {},
        updated_at: deletedAt,
        deleted_at: deletedAt,
      },
      { onConflict: "user_id,nft_id" },
    )
  if (error) {
    console.error("tombstone failed", error)
    return false
  }
  return true
}

export async function flushDirty(): Promise<void> {
  if (!cloudEnabled()) {
    setStatus("local-only")
    return
  }
  setStatus("syncing")
  const dirty = readDirty()
  const tombs = readTombstones()

  for (const nftId of Object.keys(tombs)) {
    await tombstoneRemote(nftId, tombs[nftId])
  }

  for (const nftId of dirty) {
    if (tombs[nftId]) {
      dirty.delete(nftId)
      continue
    }
    const soul = local.getSoulByNftId(nftId)
    if (!soul || shouldSkipSoul(soul)) {
      dirty.delete(nftId)
      continue
    }
    const ok = await upsertSoul(soul)
    if (ok) dirty.delete(nftId)
  }

  writeDirty(dirty)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SYNC_KEY, String(Date.now()))
  }
  setStatus(dirty.size === 0 ? "idle" : "error")
}

/**
 * Merge remote rows by nft_id. Newest updated_at wins.
 * Tombstones beat live rows both directions.
 */
export async function mergeFromRemote(): Promise<void> {
  if (!cloudEnabled() || !supabase || !currentUserId) return

  const { data, error } = await supabase
    .from("souls")
    .select("*")
    .eq("user_id", currentUserId)

  if (error) {
    console.error("pull souls failed", error)
    setStatus("error")
    return
  }

  const tombs = readTombstones()
  const localSouls = local.getStoredSouls()
  const byNft = new Map(localSouls.map((s) => [String(s.data.pfpId), s]))

  for (const row of data || []) {
    const nftId = String(row.nft_id)
    if (nftId === SAMPLE_TOKEN_ID) continue

    if (row.deleted_at) {
      tombs[nftId] = row.deleted_at
      const existing = byNft.get(nftId)
      if (existing) {
        local.deleteSoul(existing.id)
        byNft.delete(nftId)
      }
      continue
    }

    if (tombs[nftId]) {
      // Local tombstone wins until flushed
      continue
    }

    const remoteUpdated = Date.parse(row.updated_at) || 0
    const localSoul = byNft.get(nftId)
    const localUpdated = localSoul ? Date.parse(localSoul.lastUpdated) || 0 : 0

    if (!localSoul || remoteUpdated > localUpdated) {
      const characterData = row.data as CharacterData
      if (localSoul) {
        local.updateSoul(localSoul.id, characterData)
      } else {
        // storeSoul generates new id — acceptable; merge key is nft_id
        local.storeSoul(characterData)
      }
    } else if (localUpdated > remoteUpdated) {
      markDirty(nftId)
    }
  }

  writeTombstones(tombs)

  // First login: upload local souls not on remote (excluding sample)
  const remoteNfts = new Set((data || []).map((r: any) => String(r.nft_id)))
  for (const soul of local.getStoredSouls()) {
    if (shouldSkipSoul(soul)) continue
    if (!remoteNfts.has(String(soul.data.pfpId)) && !tombs[String(soul.data.pfpId)]) {
      markDirty(String(soul.data.pfpId))
    }
  }

  await flushDirty()
}

export async function initializeHybridStorage(walletAddress: string, userId?: string | null) {
  setCurrentWalletAddress(walletAddress)
  if (userId) setCurrentUserId(userId)

  // Auto-detect supabase auth session when available
  if (supabase && !currentUserId) {
    try {
      const { data } = await supabase.auth.getUser()
      if (data.user?.id) setCurrentUserId(data.user.id)
    } catch {
      // no session yet
    }
  }

  if (!cloudEnabled()) {
    setStatus("local-only")
    return
  }

  await mergeFromRemote()
}

export function getStoredSouls(): StoredSoul[] {
  return local.getStoredSouls()
}

export function soulExistsForNft(pfpId: string): boolean {
  return local.soulExistsForNft(pfpId)
}

export function getSoulByNftId(pfpId: string): StoredSoul | null {
  return local.getSoulByNftId(pfpId)
}

export function getSoulById(id: string): StoredSoul | null {
  return local.getSoulById(id)
}

export function storeSoul(characterData: CharacterData): string {
  const soulId = local.storeSoul(characterData)
  const nftId = String(characterData.pfpId)
  if (!shouldSkipSoul({ id: soulId, createdAt: "", lastUpdated: "", data: characterData })) {
    markDirty(nftId)
  }
  return soulId
}

export function updateSoul(id: string, characterData: CharacterData): boolean {
  const success = local.updateSoul(id, characterData)
  if (success) markDirty(String(characterData.pfpId))
  return success
}

export function deleteSoul(id: string): boolean {
  const soul = local.getSoulById(id)
  const success = local.deleteSoul(id)
  if (success && soul) {
    const nftId = String(soul.data.pfpId)
    if (!shouldSkipSoul(soul)) {
      const deletedAt = new Date().toISOString()
      const tombs = readTombstones()
      tombs[nftId] = deletedAt
      writeTombstones(tombs)
      const dirty = readDirty()
      dirty.delete(nftId)
      writeDirty(dirty)
      scheduleFlush()
    }
  }
  return success
}

export async function manualSync(): Promise<{
  success: boolean
  synced: number
  errors: string[]
}> {
  if (!cloudEnabled()) {
    return {
      success: false,
      synced: 0,
      errors: [
        "Cloud sync requires Supabase Auth session (Phase 2). Sample mode stays local-only.",
      ],
    }
  }
  try {
    await mergeFromRemote()
    const dirty = readDirty()
    return { success: dirty.size === 0, synced: dirty.size === 0 ? 1 : 0, errors: dirty.size ? ["Some souls still dirty"] : [] }
  } catch (e) {
    return { success: false, synced: 0, errors: [`Sync failed: ${e}`] }
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushDirty().catch(console.error)
    }
  })
  window.addEventListener("online", () => {
    setStatus(cloudEnabled() ? "idle" : "local-only")
    flushDirty().catch(console.error)
  })
  window.addEventListener("offline", () => setStatus("offline"))
}
