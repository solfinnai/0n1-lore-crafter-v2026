"use client"

/**
 * Sync status indicator (Phase 2): reflects the real state of the hybrid
 * storage layer. Local-only (logged out / no Supabase / sample wallet),
 * syncing, synced, error, offline. Compact enough for the 390px header.
 */

import { useEffect, useState } from "react"
import { AlertTriangle, Cloud, CloudOff, HardDrive, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  getLastSyncTime,
  getSyncStatus,
  manualSync,
  subscribeSyncStatus,
  type SyncStatus as SyncState,
} from "@/lib/storage-wrapper"

function timeSince(lastSync: number | null): string {
  if (!lastSync) return "never"
  const minutes = Math.floor((Date.now() - lastSync) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function SyncStatus() {
  const [status, setStatus] = useState<SyncState>("local-only")
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setStatus(getSyncStatus())
    return subscribeSyncStatus(setStatus)
  }, [])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const result = await manualSync()
      if (result.success) {
        toast.success("Souls synced")
      } else {
        toast.error("Sync failed", { description: result.errors.join(", ") })
      }
    } catch {
      toast.error("Sync failed", { description: "Check your connection and try again." })
    } finally {
      setIsSyncing(false)
    }
  }

  if (status === "local-only") {
    return (
      <Badge
        variant="outline"
        className="border-purple-500/50 text-purple-300 whitespace-nowrap"
        title="Souls are saved in this browser. Sign in to sync them to the cloud."
      >
        <HardDrive className="w-3 h-3 sm:mr-1" />
        <span className="hidden sm:inline">Local</span>
      </Badge>
    )
  }

  const syncing = status === "syncing" || isSyncing

  const badge =
    status === "offline" ? (
      <Badge
        variant="outline"
        className="border-red-500/50 text-red-400 whitespace-nowrap"
        title="You're offline. Changes are saved locally and sync when you reconnect."
      >
        <CloudOff className="w-3 h-3 sm:mr-1" />
        <span className="hidden sm:inline">Offline</span>
      </Badge>
    ) : status === "error" ? (
      <Badge
        variant="outline"
        className="border-amber-500/50 text-amber-400 whitespace-nowrap"
        title="Some changes haven't synced yet. They're safe locally — retry with the sync button."
      >
        <AlertTriangle className="w-3 h-3 sm:mr-1" />
        <span className="hidden sm:inline">Sync error</span>
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className={`border-green-500/50 text-green-400 whitespace-nowrap ${syncing ? "animate-pulse" : ""}`}
        title={syncing ? "Syncing your souls…" : `Synced ${timeSince(getLastSyncTime())}`}
      >
        <Cloud className="w-3 h-3 sm:mr-1" />
        <span className="hidden sm:inline">{syncing ? "Syncing…" : "Synced"}</span>
      </Badge>
    )

  return (
    <div className="flex items-center gap-1">
      {badge}
      <Button
        size="icon"
        variant="ghost"
        onClick={handleManualSync}
        disabled={syncing || status === "offline"}
        className="h-8 w-8 shrink-0"
        title="Sync now"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      </Button>
    </div>
  )
}
