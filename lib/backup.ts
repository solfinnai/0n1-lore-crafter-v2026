// Full local backup: everything the user has created lives in this browser's
// localStorage, so one downloadable file IS device migration, disaster
// recovery, and the escape hatch for any future sync bug.

import type { StoredSoul } from "@/lib/storage"

export const BACKUP_SCHEMA = "0n1.lore-crafter-backup"
export const BACKUP_SCHEMA_VERSION = "1.0.0"

// Exact keys holding user-created content. Deliberately excluded:
// "walletAddress" (session identity, not content) and
// "oni-souls-last-sync" (sync bookkeeping).
const EXACT_KEYS = [
  "oni-souls",
  "ai_agent_memories",
  "ai_agent_conversations",
  "oni-memory-profiles",
  "oni-chat-archives",
  "oni-user-metrics",
  "oni-character-insights",
  "oni-canon-exports",
] as const

// Per-character keys are `${prefix}${nftId}`.
const PREFIX_KEYS = ["chat-settings-", "memory-segments-", "privacy-settings-"] as const

export interface BackupFile {
  schema: typeof BACKUP_SCHEMA
  schemaVersion: string
  exportedAt: string
  app: { name: string; version: string }
  /** Raw localStorage entries, values still JSON-encoded strings. */
  entries: Record<string, string>
}

export interface BackupCounts {
  souls: number
  chatArchives: number
  otherEntries: number
}

function collectKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key) continue
    if ((EXACT_KEYS as readonly string[]).includes(key) || PREFIX_KEYS.some((p) => key.startsWith(p))) {
      keys.push(key)
    }
  }
  return keys.sort()
}

function countsFor(entries: Record<string, string>): BackupCounts {
  let souls = 0
  let chatArchives = 0
  try {
    const parsed = JSON.parse(entries["oni-souls"] || "[]")
    if (Array.isArray(parsed)) souls = parsed.length
  } catch {
    // malformed souls entry - counted as 0
  }
  try {
    const parsed = JSON.parse(entries["oni-chat-archives"] || "[]")
    if (Array.isArray(parsed)) chatArchives = parsed.length
  } catch {
    // malformed archives entry
  }
  const otherEntries = Object.keys(entries).filter((k) => k !== "oni-souls" && k !== "oni-chat-archives").length
  return { souls, chatArchives, otherEntries }
}

export function buildBackup(): { backup: BackupFile; counts: BackupCounts } {
  const entries: Record<string, string> = {}
  for (const key of collectKeys()) {
    const value = window.localStorage.getItem(key)
    if (value !== null) entries[key] = value
  }
  const backup: BackupFile = {
    schema: BACKUP_SCHEMA,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: { name: "0n1-lore-crafter", version: "0.1.0" },
    entries,
  }
  return { backup, counts: countsFor(entries) }
}

export function parseBackup(text: string): { backup: BackupFile; counts: BackupCounts } {
  let parsed: any
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("Not a valid JSON file")
  }
  if (parsed?.schema !== BACKUP_SCHEMA || typeof parsed?.entries !== "object" || parsed.entries === null) {
    throw new Error("Not a Lore Crafter backup file")
  }
  // Only accept keys we know - a hand-edited file must not write arbitrary
  // localStorage entries.
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed.entries)) {
    const known = (EXACT_KEYS as readonly string[]).includes(key) || PREFIX_KEYS.some((p) => key.startsWith(p))
    if (known && typeof value === "string") entries[key] = value
  }
  return { backup: { ...parsed, entries }, counts: countsFor(entries) }
}

export interface ImportResult {
  soulsAdded: number
  soulsUpdated: number
  entriesFilled: number
}

/**
 * Additive, non-destructive restore:
 * - Souls merge per NFT: a backup soul is added if missing, and replaces the
 *   local one only when its lastUpdated is newer. Local souls are never
 *   deleted.
 * - Every other entry fills in ONLY where this browser has nothing - current
 *   chats and settings always win over an old backup.
 */
export function applyBackup(backup: BackupFile): ImportResult {
  const result: ImportResult = { soulsAdded: 0, soulsUpdated: 0, entriesFilled: 0 }

  // Souls: timestamped merge by pfpId
  if (backup.entries["oni-souls"]) {
    let incoming: StoredSoul[] = []
    try {
      const parsed = JSON.parse(backup.entries["oni-souls"])
      if (Array.isArray(parsed)) incoming = parsed.filter((s: any) => s && s.data && s.data.pfpId)
    } catch {
      // ignore malformed souls in backup
    }
    let local: StoredSoul[] = []
    try {
      local = JSON.parse(window.localStorage.getItem("oni-souls") || "[]")
      if (!Array.isArray(local)) local = []
    } catch {
      local = []
    }
    const byPfp = new Map(local.map((s) => [String(s.data?.pfpId), s]))
    const restored: string[] = []
    for (const soul of incoming) {
      const key = String(soul.data.pfpId)
      const existing = byPfp.get(key)
      if (!existing) {
        byPfp.set(key, soul)
        restored.push(key)
        result.soulsAdded++
      } else {
        const incomingTime = Date.parse(soul.lastUpdated || "") || 0
        const existingTime = Date.parse(existing.lastUpdated || "") || 0
        if (incomingTime > existingTime) {
          byPfp.set(key, soul)
          restored.push(key)
          result.soulsUpdated++
        }
      }
    }

    // A restore is a deliberate user write NOW, so it must re-enter the cloud
    // sync layer (shared localStorage contract with lib/storage-hybrid):
    // re-stamp lastUpdated so an old cloud tombstone can't re-delete the
    // restored soul at the next merge, mark it dirty so it uploads, and clear
    // any local tombstone shadowing it. Without this, imported souls never
    // sync and a soul restored after a cloud delete is silently re-deleted.
    if (restored.length > 0) {
      const nowIso = new Date().toISOString()
      for (const key of restored) {
        const soul = byPfp.get(key)!
        byPfp.set(key, { ...soul, lastUpdated: nowIso })
      }
      try {
        const dirtyRaw = JSON.parse(window.localStorage.getItem("oni-souls-dirty") || "[]")
        const dirty = new Set<string>(Array.isArray(dirtyRaw) ? dirtyRaw.map(String) : [])
        for (const key of restored) dirty.add(key)
        window.localStorage.setItem("oni-souls-dirty", JSON.stringify([...dirty]))

        const tombs = JSON.parse(window.localStorage.getItem("oni-souls-tombstones") || "{}")
        for (const key of restored) delete tombs[key]
        window.localStorage.setItem("oni-souls-tombstones", JSON.stringify(tombs))
      } catch {
        // Sync bookkeeping is best-effort — the souls themselves are saved.
      }
    }
    window.localStorage.setItem("oni-souls", JSON.stringify(Array.from(byPfp.values())))
  }

  // Everything else: fill-missing only
  for (const [key, value] of Object.entries(backup.entries)) {
    if (key === "oni-souls") continue
    if (window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, value)
      result.entriesFilled++
    }
  }

  return result
}
