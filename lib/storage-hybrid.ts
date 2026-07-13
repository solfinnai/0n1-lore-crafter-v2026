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
import { DEMO_TOKEN_IDS, isDemoWallet } from "./dev-mode"
import { isSampleToken, SAMPLE_TOKEN_ID } from "./sample-token"
import * as local from "./storage"
import type { StoredSoul } from "./storage"

export type { StoredSoul }

const DIRTY_KEY = "oni-souls-dirty"
const TOMBSTONE_KEY = "oni-souls-tombstones"
const SYNC_KEY = "oni-souls-last-sync"
const SYNC_STATUS_KEY = "oni-souls-sync-status"

// Owner of the content currently sitting in this browser's localStorage.
// Holds the Supabase user id of the authenticated owner, or is ABSENT when the
// content is anonymous (created logged-out) or the browser is empty. Absent is
// the "adoptable" state: the first user to sign in legitimately inherits an
// anonymous library (intended first-login migration). A DIFFERENT authenticated
// id means someone else's data is present and must be wiped before the next
// account touches it (cross-user leak — audit findings 8 & 11).
const OWNER_KEY = "oni-content-owner"

// Every localStorage key that holds user-created content or sync bookkeeping.
// Mirrors the content set in lib/backup.ts (EXACT_KEYS + PREFIX_KEYS) and adds
// the four soul-sync keys. On an authenticated-owner change we wipe all of
// these so one account's souls/chats can never bleed into another's session.
const CONTENT_KEYS = [
  "oni-souls",
  DIRTY_KEY,
  TOMBSTONE_KEY,
  SYNC_KEY,
  SYNC_STATUS_KEY,
  "ai_agent_memories",
  "ai_agent_conversations",
  "oni-memory-profiles",
  "oni-chat-archives",
  "oni-user-metrics",
  "oni-character-insights",
  "oni-canon-exports",
] as const
const CONTENT_KEY_PREFIXES = ["chat-settings-", "memory-segments-", "privacy-settings-"] as const

let currentUserId: string | null = null
let currentWalletAddress: string | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

export type SyncStatus = "idle" | "syncing" | "error" | "offline" | "local-only"

let syncStatus: SyncStatus = "local-only"
const statusListeners = new Set<(status: SyncStatus) => void>()

export function setCurrentWalletAddress(address: string | null) {
  currentWalletAddress = address
  refreshBaseStatus()
}

export function setCurrentUserId(userId: string | null) {
  currentUserId = userId
  // Reconcile only for a real authenticated identity. A null id (no active
  // session / passive cold-load) is handled conservatively: we never wipe here,
  // so a returning user keeps their local souls and unsynced edits. Deliberate
  // sign-out clearing goes through clearAuthenticatedContentOnSignOut().
  if (userId) reconcileContentOwner(userId)
  refreshBaseStatus()
}

/** localStorage id of the authenticated owner of the local content, or null. */
function readContentOwner(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(OWNER_KEY)
}

function writeContentOwner(id: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(OWNER_KEY, id)
}

function clearContentOwner() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(OWNER_KEY)
}

/**
 * Wipe every content + sync key from localStorage. Used when the authenticated
 * owner of the browser changes, so no account's souls/chats survive into a
 * different account's (or another person's) session. Does NOT touch the owner
 * key itself (managed by the caller) or non-content prefs (e.g. onboarding).
 */
function clearLocalContent() {
  if (typeof window === "undefined") return
  const ls = window.localStorage
  const toRemove: string[] = []
  for (let i = 0; i < ls.length; i++) {
    const key = ls.key(i)
    if (!key) continue
    if (
      (CONTENT_KEYS as readonly string[]).includes(key) ||
      CONTENT_KEY_PREFIXES.some((p) => key.startsWith(p))
    ) {
      toRemove.push(key)
    }
  }
  for (const key of toRemove) ls.removeItem(key)
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}

/**
 * Decide whether the current local content may pass to `userId` (audit §8).
 * Decision table (prev = persisted owner):
 *   prev absent (anon/empty)  -> adopt: keep content, this user now owns it
 *                                (the intended first-login anon migration)
 *   prev === userId           -> no-op: same owner, e.g. TOKEN_REFRESHED
 *   prev = a DIFFERENT auth id -> wipe prev owner's content, THEN adopt
 *                                (shared-browser cross-user isolation)
 */
function reconcileContentOwner(userId: string) {
  const prev = readContentOwner()
  if (prev === userId) return
  if (prev !== null) {
    // A different authenticated user owned this browser's content. Their souls,
    // chats and dirty/tombstone queues must not merge into, upload to, or be
    // visible under the new account. Wipe before mergeFromRemote pulls/uploads.
    clearLocalContent()
  }
  writeContentOwner(userId)
}

/**
 * Deliberate sign-out: leave the browser a clean anonymous slate for whoever
 * uses it next. Clears the authenticated owner's content (their data is safe in
 * the cloud and re-merges on next login) and drops the owner marker. Anonymous
 * content (no owner recorded) is left untouched — logged-out souls belong to
 * the browser and must survive per the app's logged-out invariant.
 */
export function clearAuthenticatedContentOnSignOut() {
  const prev = readContentOwner()
  currentUserId = null
  if (prev !== null) {
    clearLocalContent()
    clearContentOwner()
  }
  refreshBaseStatus()
}

export function getSyncStatus(): SyncStatus {
  return syncStatus
}

/** Subscribe to sync-status changes. Returns an unsubscribe function. */
export function subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
  statusListeners.add(listener)
  return () => {
    statusListeners.delete(listener)
  }
}

/** Epoch ms of the last successful flush, or null if never synced. */
export function getLastSyncTime(): number | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(SYNC_KEY)
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  return Number.isFinite(parsed) ? parsed : null
}

function setStatus(s: SyncStatus) {
  syncStatus = s
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SYNC_STATUS_KEY, s)
  }
  statusListeners.forEach((listener) => {
    try {
      listener(s)
    } catch (e) {
      console.error("sync status listener failed", e)
    }
  })
}

/** Re-derive the resting status after identity (user/wallet) changes. */
function refreshBaseStatus() {
  if (!cloudEnabled()) {
    setStatus("local-only")
  } else if (syncStatus === "local-only") {
    const offline = typeof navigator !== "undefined" && !navigator.onLine
    setStatus(offline ? "offline" : "idle")
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
  const id = String(nftId)
  // A live local write supersedes any pending tombstone for this NFT (LWW):
  // the upsert sends deleted_at: null, reviving the remote row. Without this,
  // a re-created soul stays shadowed by its old tombstone and never syncs.
  const tombs = readTombstones()
  if (tombs[id]) {
    delete tombs[id]
    writeTombstones(tombs)
  }
  const d = readDirty()
  d.add(id)
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
  // Sample #922 AND the dev-mode demo tokens: shared demo artifacts must never
  // reach a real user's cloud account — the first-login upload path included.
  if (isSampleToken(nftId) || DEMO_TOKEN_IDS.includes(nftId)) return true
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

let flushInFlight: Promise<void> | null = null

export function flushDirty(): Promise<void> {
  // Serialize flushes: the debounce timer, visibilitychange, the online
  // handler, and merge-on-login can all overlap; concurrent runs would write
  // back stale dirty-set snapshots, erasing flags added mid-flight.
  if (flushInFlight) return flushInFlight
  flushInFlight = doFlush().finally(() => {
    flushInFlight = null
  })
  return flushInFlight
}

async function doFlush(): Promise<void> {
  if (!cloudEnabled()) {
    setStatus("local-only")
    return
  }
  setStatus("syncing")
  const dirty = readDirty()
  const tombs = readTombstones()
  const flushed: string[] = []
  let tombstoneFailures = 0

  for (const nftId of Object.keys(tombs)) {
    if (await tombstoneRemote(nftId, tombs[nftId])) {
      // Pushed: drop the map entry so it isn't re-sent on every flush forever.
      // A later pull re-adopts it from the remote row while it still matters.
      // Guarded re-read: a delete recorded mid-flight (newer timestamp) stays.
      const current = readTombstones()
      if (current[nftId] === tombs[nftId]) {
        delete current[nftId]
        writeTombstones(current)
      }
    } else {
      tombstoneFailures++
    }
  }

  for (const nftId of dirty) {
    if (tombs[nftId]) {
      flushed.push(nftId)
      continue
    }
    const soul = local.getSoulByNftId(nftId)
    if (!soul || shouldSkipSoul(soul)) {
      flushed.push(nftId)
      continue
    }
    if (await upsertSoul(soul)) flushed.push(nftId)
  }

  // Re-read at write-back and only remove what THIS run flushed — flags added
  // while the network calls were in flight must survive.
  const remaining = readDirty()
  for (const nftId of flushed) remaining.delete(nftId)
  writeDirty(remaining)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SYNC_KEY, String(Date.now()))
  }
  // A failed tombstone push is unsynced work too — never show "Synced" for it.
  setStatus(remaining.size === 0 && tombstoneFailures === 0 ? "idle" : "error")
}

export interface MergeSummary {
  /** True when the remote had no rows for this user (first login). */
  firstLogin: boolean
  /** Local souls queued for upload because the remote didn't have them. */
  queued: number
  /** Of those, how many actually reached the cloud in this merge's flush. */
  uploaded: number
}

/**
 * Merge remote rows by nft_id. Newest updated_at wins.
 * Tombstones beat live rows both directions.
 */
export async function mergeFromRemote(): Promise<MergeSummary> {
  const summary: MergeSummary = { firstLogin: false, queued: 0, uploaded: 0 }
  if (!cloudEnabled() || !supabase || !currentUserId) return summary

  const { data, error } = await supabase
    .from("souls")
    .select("*")
    .eq("user_id", currentUserId)

  if (error) {
    console.error("pull souls failed", error)
    setStatus("error")
    return summary
  }

  const tombs = readTombstones()
  const localSouls = local.getStoredSouls()
  const byNft = new Map(localSouls.map((s) => [String(s.data.pfpId), s]))

  for (const row of data || []) {
    const nftId = String(row.nft_id)
    if (nftId === SAMPLE_TOKEN_ID) continue

    if (row.deleted_at) {
      const existing = byNft.get(nftId)
      const tombstoneAt = Date.parse(row.deleted_at) || 0
      const localUpdated = existing ? Date.parse(existing.lastUpdated) || 0 : 0
      if (existing && localUpdated > tombstoneAt) {
        // Local live write is newer than the remote tombstone — the soul was
        // re-created after the delete. LWW: keep it and push the revival.
        markDirty(nftId)
        continue
      }
      // Honor the remote tombstone locally. It is NOT copied into the local
      // map: that map holds only unpushed LOCAL deletes (the remote already
      // has this one, and the souls_lww_guard trigger stops any stale live
      // row from ever overwriting it server-side).
      if (existing) {
        local.deleteSoul(existing.id)
        byNft.delete(nftId)
      }
      continue
    }

    if (tombs[nftId]) {
      const tombAt = Date.parse(tombs[nftId]) || 0
      const liveAt = Date.parse(row.updated_at) || 0
      if (liveAt <= tombAt) {
        // Local tombstone is newer — it wins until flushed
        continue
      }
      // The soul was re-created on another device after our delete (LWW):
      // drop the stale tombstone and fall through to apply the live row.
      delete tombs[nftId]
    }

    const remoteUpdated = Date.parse(row.updated_at) || 0
    const localSoul = byNft.get(nftId)
    const localUpdated = localSoul ? Date.parse(localSoul.lastUpdated) || 0 : 0

    if (!localSoul || remoteUpdated > localUpdated) {
      // Apply verbatim with the remote clock — re-stamping lastUpdated with
      // new Date() would make this copy beat genuinely newer edits elsewhere.
      local.applySoulSnapshot({
        id: localSoul?.id ?? String(row.local_id || `${row.updated_at}-${nftId}`),
        createdAt: String(row.created_at || row.updated_at),
        lastUpdated: String(row.updated_at),
        data: row.data as CharacterData,
      })
    } else if (localUpdated > remoteUpdated) {
      markDirty(nftId)
    }
  }

  writeTombstones(tombs)

  // First login: upload local souls not on remote (excluding sample/demo).
  // Owner guard (audit §11): only auto-upload when this browser's content is
  // owned by the current identity. setCurrentUserId() runs reconcileContentOwner
  // before any merge, so a foreign authenticated user's souls have already been
  // wiped and the owner marker equals currentUserId (either an adopted-anon
  // library or this user's own). If it somehow doesn't match, refuse to push
  // another account's residual souls into this one.
  const remoteNfts = new Set((data || []).map((r: any) => String(r.nft_id)))
  summary.firstLogin = remoteNfts.size === 0
  const queuedIds: string[] = []
  if (readContentOwner() === currentUserId) {
    for (const soul of local.getStoredSouls()) {
      if (shouldSkipSoul(soul)) continue
      if (!remoteNfts.has(String(soul.data.pfpId)) && !tombs[String(soul.data.pfpId)]) {
        markDirty(String(soul.data.pfpId))
        queuedIds.push(String(soul.data.pfpId))
      }
    }
  }
  summary.queued = queuedIds.length

  await flushDirty()
  // Report what actually landed: anything still dirty after the flush failed.
  const stillDirty = readDirty()
  summary.uploaded = queuedIds.filter((id) => !stillDirty.has(id)).length
  return summary
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
