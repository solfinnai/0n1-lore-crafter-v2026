"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DownloadCloud, UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { buildBackup, parseBackup, applyBackup, type BackupFile, type BackupCounts } from "@/lib/backup"
import { downloadFile } from "@/lib/canon-submission"

/** "Backup All" + "Import Backup" for the souls library. */
export function BackupControls({ onImported }: { onImported?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ backup: BackupFile; counts: BackupCounts } | null>(null)
  const [importing, setImporting] = useState(false)

  const handleBackup = () => {
    try {
      const { backup, counts } = buildBackup()
      const date = new Date().toISOString().slice(0, 10)
      downloadFile(JSON.stringify(backup, null, 2), `0n1-lore-crafter-backup_${date}.json`, "application/json")
      toast.success(`Backup downloaded`, {
        description: `${counts.souls} soul${counts.souls === 1 ? "" : "s"}, ${counts.chatArchives} chat archive${counts.chatArchives === 1 ? "" : "s"}, ${counts.otherEntries} other entries`,
      })
    } catch (e) {
      toast.error("Backup failed", { description: e instanceof Error ? e.message : undefined })
    }
  }

  const handleFileChosen = async (file: File) => {
    try {
      const text = await file.text()
      setPending(parseBackup(text))
    } catch (e) {
      toast.error("Can't import this file", { description: e instanceof Error ? e.message : undefined })
    }
  }

  const confirmImport = () => {
    if (!pending) return
    setImporting(true)
    try {
      const result = applyBackup(pending.backup)
      toast.success("Backup imported", {
        description: `${result.soulsAdded} soul${result.soulsAdded === 1 ? "" : "s"} added, ${result.soulsUpdated} updated, ${result.entriesFilled} other entries restored. Nothing local was deleted.`,
      })
      setPending(null)
      onImported?.()
    } catch (e) {
      toast.error("Import failed", { description: e instanceof Error ? e.message : undefined })
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <Button variant="outline" className="border-purple-500/30 hover:bg-purple-900/20" onClick={handleBackup}>
        <DownloadCloud className="mr-2 h-4 w-4" />
        Backup All
      </Button>
      <Button
        variant="outline"
        className="border-purple-500/30 hover:bg-purple-900/20"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        Import Backup
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = "" // allow re-picking the same file
          if (file) handleFileChosen(file)
        }}
      />

      <Dialog open={!!pending} onOpenChange={(o) => !o && !importing && setPending(null)}>
        <DialogContent className="border-purple-500/30 bg-black/95 backdrop-blur-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import backup?</DialogTitle>
            <DialogDescription>
              {pending && (
                <>
                  This backup from {new Date(pending.backup.exportedAt).toLocaleDateString()} contains{" "}
                  <span className="text-purple-200">{pending.counts.souls} souls</span>,{" "}
                  <span className="text-purple-200">{pending.counts.chatArchives} chat archives</span> and{" "}
                  <span className="text-purple-200">{pending.counts.otherEntries} other entries</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-purple-300/80">
            Importing is additive: souls are added or updated only when the backup copy is newer, and existing
            chats and settings in this browser always win. Nothing gets deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" className="border-purple-500/30" onClick={() => setPending(null)} disabled={importing}>
              Cancel
            </Button>
            <Button
              onClick={confirmImport}
              disabled={importing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
