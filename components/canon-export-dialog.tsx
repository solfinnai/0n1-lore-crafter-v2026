"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, FileJson, FileText, Loader2, PenLine } from "lucide-react"
import { toast } from "sonner"
import type { CharacterData } from "@/lib/types"
import { useWallet } from "@/components/wallet/wallet-provider"
import { isDemoWallet } from "@/lib/dev-mode"
import {
  validateForCanon,
  buildSubmission,
  signSubmission,
  renderSubmissionMarkdown,
  recordExport,
  downloadFile,
  slugify,
  type CanonValidationReport,
  type CanonSubmission,
} from "@/lib/canon-submission"

interface CanonExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  characterData: CharacterData | null
}

type Phase = "validating" | "ready" | "signing" | "done"

const LEVEL_ICON = {
  pass: <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
  error: <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />,
  skip: <MinusCircle className="h-4 w-4 text-purple-400/50 shrink-0 mt-0.5" />,
}

const CHECK_LABELS: Record<string, string> = {
  "structure.required.soulName": "Soul name",
  "structure.required.archetype": "Archetype",
  "structure.required.background": "Background story",
  "traits.self-consistent": "Trait data",
  "paths.count": "Development path rules",
  "tier.extrapolated": "Tier allowance",
  "paths.in-kit": "Powers match canon kit",
  "text.mask-when-bare-faced": "Mask consistency",
  "text.foreign-lineage": "Lineage references",
  "traits.match-chain": "On-chain trait check",
}

const isUserRejection = (e: any) =>
  e?.code === 4001 || e?.code === "ACTION_REJECTED" || e?.info?.error?.code === 4001

export function CanonExportDialog({ open, onOpenChange, characterData }: CanonExportDialogProps) {
  const { address, isConnected } = useWallet()
  const [phase, setPhase] = useState<Phase>("validating")
  const [report, setReport] = useState<CanonValidationReport | null>(null)
  const [ackWarnings, setAckWarnings] = useState(false)
  const [lastExported, setLastExported] = useState<CanonSubmission | null>(null)

  const canSign =
    isConnected && !!address && !isDemoWallet(address) && typeof (window as any).ethereum !== "undefined"

  useEffect(() => {
    if (!open || !characterData) return
    setPhase("validating")
    setReport(null)
    setAckWarnings(false)
    setLastExported(null)
    let cancelled = false
    validateForCanon(characterData)
      .then((r) => {
        if (!cancelled) {
          setReport(r)
          setPhase("ready")
        }
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error("Validation failed", { description: e instanceof Error ? e.message : undefined })
          onOpenChange(false)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, characterData])

  if (!characterData) return null

  const hasErrors = (report?.errors ?? 0) > 0
  const hasWarnings = (report?.warnings ?? 0) > 0
  const exportBlocked = hasErrors || (hasWarnings && !ackWarnings) || phase === "validating" || phase === "signing"
  const tokenId = String(characterData.pfpId || "").replace(/^0+/, "")

  const finishExport = (submission: CanonSubmission) => {
    recordExport(submission.subject.tokenId, submission.submissionId)
    setLastExported(submission)
    setPhase("done")
  }

  const exportJson = async (sign: boolean) => {
    if (!report) return
    try {
      let submission = await buildSubmission(characterData, report)
      if (sign && address) {
        setPhase("signing")
        try {
          submission = await signSubmission(submission, address)
        } catch (e: any) {
          setPhase("ready")
          if (isUserRejection(e)) {
            toast.error("Signature declined", { description: "Nothing was exported." })
          } else {
            toast.error("Signing failed", {
              description: `${e instanceof Error ? e.message : "Unknown error"} - you can still export unsigned.`,
            })
          }
          return
        }
      }
      downloadFile(JSON.stringify(submission, null, 2), `0N1_${tokenId}_soul-submission_v1.json`, "application/json")
      finishExport(submission)
      toast.success(sign ? "Signed submission exported" : "Unsigned submission exported")
    } catch (e) {
      setPhase("ready")
      toast.error("Export failed", { description: e instanceof Error ? e.message : undefined })
    }
  }

  const exportMarkdown = async () => {
    if (!report) return
    try {
      // Reuse the signed envelope when one was just exported so the .md
      // footer and the JSON carry identical hashes/provenance.
      const submission = lastExported ?? (await buildSubmission(characterData, report))
      const md = renderSubmissionMarkdown(submission)
      downloadFile(md, `0N1_${tokenId}_${slugify(characterData.soulName || "")}.md`, "text/markdown")
      toast.success("Character sheet exported")
    } catch (e) {
      toast.error("Export failed", { description: e instanceof Error ? e.message : undefined })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => phase !== "signing" && onOpenChange(o)}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto border-purple-500/30 bg-black/95 backdrop-blur-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Soul{characterData.soulName ? `: ${characterData.soulName}` : ""}</DialogTitle>
          <DialogDescription>
            Checked against 0N1 canon before export. The JSON file is the official submission record; the
            Markdown sheet is for reading and sharing.
          </DialogDescription>
        </DialogHeader>

        {phase === "validating" && (
          <div className="flex items-center gap-2 py-6 justify-center text-purple-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking against canon...
          </div>
        )}

        {report && phase !== "validating" && (
          <div className="space-y-1.5">
            {report.checks.map((c, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md border border-purple-500/15 bg-purple-950/20 px-3 py-2">
                {LEVEL_ICON[c.level]}
                <div className="min-w-0">
                  <span className="text-sm font-medium text-purple-100">{CHECK_LABELS[c.id] ?? c.id}</span>
                  {c.detail && <p className="text-xs text-purple-300/80 break-words">{c.detail}</p>}
                </div>
              </div>
            ))}

            {hasErrors && (
              <p className="text-sm text-red-300 pt-1">
                Fix the items marked in red before exporting - they are objective canon or structure violations.
              </p>
            )}

            {!hasErrors && hasWarnings && phase !== "done" && (
              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <Checkbox
                  checked={ackWarnings}
                  onCheckedChange={(v) => setAckWarnings(v === true)}
                  className="mt-0.5 border-purple-500/50 data-[state=checked]:bg-purple-600"
                />
                <span className="text-sm text-purple-200">
                  I've reviewed the warnings - export anyway (they stay recorded in the file)
                </span>
              </label>
            )}
          </div>
        )}

        {phase === "done" && lastExported && (
          <div className="flex items-start gap-2 rounded-md border border-green-500/30 bg-green-950/20 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-200">
              Exported {lastExported.provenance.level === "signed" ? "signed" : "unsigned"} submission{" "}
              <span className="font-mono text-xs break-all">{lastExported.submissionId.slice(0, 24)}...</span>
            </p>
          </div>
        )}

        {phase !== "validating" && (
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <div className="w-full space-y-1">
              {canSign ? (
                <Button
                  onClick={() => exportJson(true)}
                  disabled={exportBlocked}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {phase === "signing" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Waiting for wallet signature...
                    </>
                  ) : (
                    <>
                      <PenLine className="mr-2 h-4 w-4" /> Sign & Export JSON
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => exportJson(false)}
                  disabled={exportBlocked}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <FileJson className="mr-2 h-4 w-4" /> Export Unsigned JSON
                </Button>
              )}
              <p className="text-xs text-purple-300/70 text-center">
                {canSign
                  ? "The official submission file - carries your wallet signature and content hash"
                  : isDemoWallet(address)
                    ? "Sample sessions export unsigned - the official file, minus the wallet signature"
                    : "Connect a wallet in a wallet-enabled browser to sign your submission"}
              </p>
            </div>
            <div className="w-full space-y-1">
              <Button
                onClick={exportMarkdown}
                disabled={exportBlocked}
                variant="outline"
                className="w-full border-purple-500/30 hover:bg-purple-900/20"
              >
                <FileText className="mr-2 h-4 w-4" /> Download .md Character Sheet
              </Button>
              <p className="text-xs text-purple-300/70 text-center">
                Readable version for sharing - not the official record
              </p>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
