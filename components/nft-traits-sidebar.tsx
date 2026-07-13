"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { ExternalLink, AlertTriangle, Sparkles, Shirt } from "lucide-react"
import { SafeNftImage } from "@/components/safe-nft-image"
import { fetchNftDataWithFallback, getOpenSeaNftLink } from "@/lib/api"
import { classifyTraits, type ClassifiedTrait } from "@/lib/lore/canon/match"
import { getPathSelectionRules } from "@/lib/lore/canon/selection-rules"
import type { Trait } from "@/lib/types"
import Link from "next/link"

interface NftTraitsSidebarProps {
  isOpen: boolean
  onClose: () => void
  tokenId: string | null
  imageUrl?: string | null
  /**
   * Traits already held by the app (e.g. characterData.traits). When provided,
   * the panel shows exactly these - the same traits the AI prompts see - and
   * skips the network fetch entirely. Without them it falls back to fetching
   * by tokenId (used when browsing NFTs before one is selected).
   */
  traits?: Trait[]
}

// User-facing meaning for each cosmetic kind. Deliberately plain and
// power-negating - this copy exists to stop "Void mask" / "citrine lineage"
// style misreads. The AI-prompt wording for the same classifications lives in
// generateTraitContext (lib/lore/canon/match.ts).
function cosmeticMeaning(entry: ClassifiedTrait & { category: "cosmetic" }): string {
  switch (entry.kind) {
    case "bare-faced":
      return "Bare face - Void means this character wears no mask. It grants nothing and hides nothing."
    case "face-detail":
      return "Facial detail - style only."
    case "headwear":
      return "Headwear - style only. A color word here (like Citrine) is just a color, not a lineage."
    case "expression":
      return "Expression - flavors personality, carries no powers."
    default:
      return "Style only - carries no powers."
  }
}

function slotLabel(slot: string): string {
  switch (slot) {
    case "face":
      return "Mask"
    case "extra":
      return "Accessory"
    case "eyes":
      return "Eyes"
    case "head":
      return "Headgear"
    default:
      return slot
  }
}

function firstSentences(text: string | undefined, n: number): string {
  if (!text) return ""
  return text.split(". ").slice(0, n).join(". ").replace(/\.?$/, ".")
}

function TraitMeanings({ traits }: { traits: Trait[] }) {
  const classified = classifyTraits(traits)

  const bodyEntry = classified.find(
    (e): e is ClassifiedTrait & { category: "power"; slot: "body" } => e.category === "power" && e.slot === "body",
  )
  const unknownBody = classified.find((e) => e.category === "meta" && e.kind === "unknown-body")
  const otherPowers = classified.filter(
    (e): e is ClassifiedTrait & { category: "power" } => e.category === "power" && e.slot !== "body",
  )
  const tierEntry = classified.find(
    (e): e is Extract<ClassifiedTrait, { kind: "tier" }> => e.category === "meta" && e.kind === "tier",
  )
  const backgroundEntry = classified.find(
    (e): e is Extract<ClassifiedTrait, { kind: "background" }> => e.category === "meta" && e.kind === "background",
  )
  const houseEntry = classified.find(
    (e): e is Extract<ClassifiedTrait, { kind: "house" }> => e.category === "meta" && e.kind === "house",
  )
  const statEntries = classified.filter(
    (e): e is Extract<ClassifiedTrait, { kind: "stat" }> => e.category === "meta" && e.kind === "stat",
  )
  const cosmetics = classified.filter((e): e is ClassifiedTrait & { category: "cosmetic" } => e.category === "cosmetic")

  // Canon selection rule ("a Y0K-A1 Azurite specializes in TWO emotions...")
  const tierRule = bodyEntry
    ? getPathSelectionRules(String(bodyEntry.trait.value), tierEntry ? String(tierEntry.trait.value) : null).rule
    : null

  return (
    <div className="space-y-6">
      {/* ---- Power source ---- */}
      <section className="space-y-3">
        <h4 className="flex items-center gap-2 font-semibold text-purple-300">
          <Sparkles className="h-4 w-4" />
          Where the powers come from
        </h4>

        {bodyEntry && (
          <div className="p-3 rounded-md bg-purple-950/40 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-white">Body: {String(bodyEntry.trait.value)}</span>
              <div className="flex gap-1.5">
                <Badge variant="outline" className="bg-purple-900/50 text-purple-200 border-purple-500/30">
                  {bodyEntry.power.foundation}
                </Badge>
                {tierEntry?.tier && (
                  <Badge variant="outline" className="bg-pink-900/40 text-pink-200 border-pink-500/30">
                    {tierEntry.tier.tierName}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-purple-100/90">{firstSentences(bodyEntry.power.corePowers, 2)}</p>
            {bodyEntry.power.developmentPaths && bodyEntry.power.developmentPaths.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {bodyEntry.power.developmentPaths.map((p) => (
                  <Badge key={p.name} variant="outline" className="bg-black/40 text-purple-200 border-purple-500/25">
                    {p.name}
                  </Badge>
                ))}
              </div>
            )}
            {tierRule && <p className="text-xs text-purple-300/80">{tierRule}</p>}
          </div>
        )}

        {unknownBody && (
          <div className="p-3 rounded-md bg-purple-950/40 border border-purple-500/30 text-sm text-purple-100/90">
            Body: {String(unknownBody.trait.value)} - not a canonical lineage, so no powers derive from it.
          </div>
        )}

        {otherPowers.map((entry, i) => (
          <div key={i} className="p-3 rounded-md bg-purple-950/30 border border-purple-500/25 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-purple-100">
                {slotLabel(entry.slot)}: {String(entry.trait.value)}
              </span>
              {entry.power.foundation && (
                <Badge variant="outline" className="bg-purple-900/50 text-purple-200 border-purple-500/30">
                  {entry.power.foundation}
                </Badge>
              )}
            </div>
            <p className="text-sm text-purple-100/80">{firstSentences(entry.power.corePowers, 1)}</p>
          </div>
        ))}

        {/* Passive & ambient effects */}
        {(backgroundEntry || houseEntry || statEntries.length > 0 || (tierEntry && !bodyEntry)) && (
          <div className="space-y-2">
            <h5 className="text-xs uppercase tracking-wide text-purple-400/80">Passive & ambient</h5>
            {backgroundEntry && (
              <div className="p-2.5 rounded-md bg-purple-950/20 border border-purple-500/20 text-sm">
                <span className="font-medium text-purple-200">Background: {String(backgroundEntry.trait.value)}</span>
                <p className="text-purple-100/75 mt-0.5">
                  The backdrop color behind your character - a real trait.{" "}
                  {backgroundEntry.resonance ? `${backgroundEntry.resonance.effect} ` : ""}
                  Not a bloodline or lineage.
                </p>
              </div>
            )}
            {tierEntry && !bodyEntry && (
              <div className="p-2.5 rounded-md bg-purple-950/20 border border-purple-500/20 text-sm">
                <span className="font-medium text-purple-200">Type: {String(tierEntry.trait.value)}</span>
                {tierEntry.tier && <p className="text-purple-100/75 mt-0.5">Level {tierEntry.tier.powerLevel} powers.</p>}
              </div>
            )}
            {houseEntry && (
              <div className="p-2.5 rounded-md bg-purple-950/20 border border-purple-500/20 text-sm">
                <span className="font-medium text-purple-200">Domain: {String(houseEntry.trait.value)}</span>
                {houseEntry.house && (
                  <p className="text-purple-100/75 mt-0.5">
                    {houseEntry.house.house} {houseEntry.house.houseNumber}. Bonus: {houseEntry.house.bonus}
                  </p>
                )}
              </div>
            )}
            {statEntries.map((entry, i) => (
              <div key={i} className="p-2.5 rounded-md bg-purple-950/20 border border-purple-500/20 text-sm">
                <span className="font-medium text-purple-200">
                  {entry.trait.trait_type}: {String(entry.trait.value)}
                  {entry.stat ? "/10" : ""}
                </span>
                {entry.stat && (
                  <p className="text-purple-100/75 mt-0.5">
                    {entry.stat.name} ({entry.stat.role}). {firstSentences(entry.stat.description, 1)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- Appearance only ---- */}
      {cosmetics.length > 0 && (
        <section className="space-y-2">
          <h4 className="flex items-center gap-2 font-semibold text-purple-300">
            <Shirt className="h-4 w-4" />
            Appearance only
          </h4>
          {cosmetics.map((entry, i) => (
            <div key={i} className="p-2.5 rounded-md bg-black/40 border border-purple-500/15 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-purple-100/90">
                  {entry.trait.trait_type}: {String(entry.trait.value)}
                </span>
                <Badge variant="outline" className="shrink-0 bg-black/40 text-purple-300/70 border-purple-500/20 text-[10px]">
                  no powers
                </Badge>
              </div>
              <p className="text-purple-100/60 mt-0.5">{cosmeticMeaning(entry)}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function PanelBody({ tokenId, imageUrl, traits }: { tokenId: string | null; imageUrl?: string | null; traits?: Trait[] }) {
  const hasProvidedTraits = !!traits && traits.length > 0
  const [fetchedTraits, setFetchedTraits] = useState<Trait[]>([])
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!hasProvidedTraits)
  const [error, setError] = useState("")
  const [isApiData, setIsApiData] = useState(true)

  const fetchTraits = useCallback(async () => {
    if (!tokenId) return
    setIsLoading(true)
    setError("")
    try {
      const normalizedTokenId = tokenId.replace(/^0+/, "")
      const { traits: result, imageUrl: image, isApiData: fromApi } = await fetchNftDataWithFallback(normalizedTokenId)
      setFetchedTraits(result)
      setFetchedImageUrl(image)
      setIsApiData(fromApi)
      if (result.length === 0) setError("Could not fetch traits data. Please try again later.")
    } catch (err) {
      console.error("Error fetching traits:", err)
      setError("Failed to load traits data")
    } finally {
      setIsLoading(false)
    }
  }, [tokenId])

  useEffect(() => {
    if (!hasProvidedTraits && tokenId) {
      fetchTraits()
    }
  }, [hasProvidedTraits, tokenId, fetchTraits])

  const displayTraits = hasProvidedTraits ? traits! : fetchedTraits
  const normalizedId = tokenId?.replace(/^0+/, "") || ""
  const openSeaLink = normalizedId ? getOpenSeaNftLink(normalizedId) : ""
  const displayImageUrl = imageUrl || fetchedImageUrl

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-4">
      {/* NFT image + id */}
      <div className="flex items-center gap-3 pt-1">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-purple-500/30 shrink-0">
          {displayImageUrl ? (
            <SafeNftImage src={displayImageUrl} alt={`0N1 Force #${normalizedId}`} fill className="object-contain" />
          ) : (
            <div className="w-full h-full bg-purple-900/20" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">0N1 Force #{normalizedId}</h3>
          <p className="text-xs text-purple-300/70">
            {hasProvidedTraits ? "These are the exact traits the AI uses." : "Traits loaded from OpenSea."}
          </p>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && !hasProvidedTraits && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md bg-purple-950/40" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-3 rounded-md bg-red-950/30 border border-red-500/50 text-red-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs bg-red-950/50 hover:bg-red-900/50 border-red-500/30"
              onClick={fetchTraits}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Classified traits */}
      {displayTraits.length > 0 && !isLoading && <TraitMeanings traits={displayTraits} />}

      {/* Footer: fail-closed notice + OpenSea link */}
      {!hasProvidedTraits && !isApiData && (
        <div className="text-xs text-amber-400 flex items-start gap-2">
          <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>
            Traits could not be verified from OpenSea. No invented traits are shown — retry later or use sample token #922.
          </span>
        </div>
      )}
      {openSeaLink && (
        <div className="pt-1 pb-2">
          <Link
            href={openSeaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View on OpenSea
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

export function NftTraitsSidebar({ isOpen, onClose, tokenId, imageUrl, traits }: NftTraitsSidebarProps) {
  const isMobile = useIsMobile()
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[88dvh] bg-black/95 border-purple-500/30">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-purple-300">What your traits mean</DrawerTitle>
            <DrawerDescription className="sr-only">Canonical meaning of each NFT trait</DrawerDescription>
          </DrawerHeader>
          {isOpen && <PanelBody tokenId={tokenId} imageUrl={imageUrl} traits={traits} />}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-black/95 border-purple-500/30 flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-purple-300">What your traits mean</SheetTitle>
          <SheetDescription className="sr-only">Canonical meaning of each NFT trait</SheetDescription>
        </SheetHeader>
        {isOpen && <PanelBody tokenId={tokenId} imageUrl={imageUrl} traits={traits} />}
      </SheetContent>
    </Sheet>
  )
}
