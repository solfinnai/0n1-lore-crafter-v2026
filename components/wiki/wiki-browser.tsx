"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Globe, Landmark, Swords, Sparkles, ScrollText, BookMarked } from "lucide-react"
import {
  worldOverview,
  districts,
  historyTimeline,
  populationClasses,
  canonFactions,
  designPrinciples,
  glossary,
  domains,
  statDefinitions,
  typeTiers,
  backgroundResonances,
  allPoweredTraits,
  type CanonTraitPower,
} from "@/lib/lore/canon"

function PowerCard({ power }: { power: CanonTraitPower }) {
  return (
    <Card className="border border-purple-500/30 bg-black/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg text-purple-200">{power.trait}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
              {power.category}
            </Badge>
            {power.quantity != null && (
              <Badge variant="outline" className="border-purple-500/30 text-purple-400/70">
                {power.quantity.toLocaleString()} in collection
              </Badge>
            )}
          </div>
        </div>
        {power.foundation && <p className="text-sm text-pink-400/90 font-medium">{power.foundation}</p>}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {power.corePowers && <p className="text-purple-100/90 whitespace-pre-line">{power.corePowers}</p>}
        {power.developmentPaths && power.developmentPaths.length > 0 && (
          <div>
            <p className="font-semibold text-purple-300 mb-1">Development Paths</p>
            <ul className="space-y-1.5">
              {power.developmentPaths.map((p) => (
                <li key={p.name}>
                  <span className="text-pink-300 font-medium">{p.name}:</span>{" "}
                  <span className="text-purple-100/80">{p.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {power.advancedPowers && power.advancedPowers.length > 0 && (
          <div>
            <p className="font-semibold text-purple-300 mb-1">Advanced Powers</p>
            <ul className="space-y-1.5">
              {power.advancedPowers.map((p) => (
                <li key={p.name}>
                  <span className="text-pink-300 font-medium">{p.name}:</span>{" "}
                  <span className="text-purple-100/80">{p.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {power.drawbacks && (
          <p className="text-red-300/90">
            <span className="font-semibold">Drawbacks:</span> {power.drawbacks}
          </p>
        )}
        {power.counters && (
          <p className="text-amber-300/90">
            <span className="font-semibold">Counters:</span> {power.counters}
          </p>
        )}
        {power.notes && (
          <p className="text-purple-300/70 italic">
            <span className="font-semibold not-italic">Canon notes:</span> {power.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const POWER_CATEGORIES = ["All", "Body", "Face", "Extra", "Eyes", "Head"] as const

export function WikiBrowser() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<(typeof POWER_CATEGORIES)[number]>("All")

  const filteredPowers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allPoweredTraits.filter((p) => {
      if (category !== "All" && p.category !== category) return false
      if (!q) return true
      const haystack = [
        p.trait,
        p.foundation,
        p.corePowers,
        p.drawbacks,
        p.counters,
        p.notes,
        ...(p.developmentPaths?.flatMap((d) => [d.name, d.description]) ?? []),
        ...(p.advancedPowers?.flatMap((d) => [d.name, d.description]) ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [search, category])

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          0N1 Force Lore Wiki
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The canonical reference for The Enclave: its world, history, houses, and the exact powers tied to
          every trait in the collection.
        </p>
      </div>

      <Tabs defaultValue="powers" className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-center bg-black/60 border border-purple-500/20">
          <TabsTrigger value="powers"><Sparkles className="h-4 w-4 mr-1.5" />Trait Powers</TabsTrigger>
          <TabsTrigger value="world"><Globe className="h-4 w-4 mr-1.5" />World</TabsTrigger>
          <TabsTrigger value="districts"><Landmark className="h-4 w-4 mr-1.5" />Districts</TabsTrigger>
          <TabsTrigger value="history"><ScrollText className="h-4 w-4 mr-1.5" />History</TabsTrigger>
          <TabsTrigger value="factions"><Swords className="h-4 w-4 mr-1.5" />Houses & Factions</TabsTrigger>
          <TabsTrigger value="glossary"><BookMarked className="h-4 w-4 mr-1.5" />Glossary</TabsTrigger>
        </TabsList>

        {/* ---- Trait Powers ---- */}
        <TabsContent value="powers" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder="Search traits, powers, drawbacks... (e.g. 'Kitsune', 'time', 'healing')"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-black/60 border-purple-500/30"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {POWER_CATEGORIES.map((c) => (
                <Badge
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`cursor-pointer select-none ${
                    category === c
                      ? "bg-purple-600 text-white hover:bg-purple-600"
                      : "bg-black/60 text-purple-300 border border-purple-500/30 hover:bg-purple-900/40"
                  }`}
                >
                  {c === "Body" ? "Body Types" : c === "Face" ? "Masks" : c === "Extra" ? "Accessories" : c}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredPowers.length} powered trait{filteredPowers.length === 1 ? "" : "s"}
            {search && ` matching "${search}"`}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredPowers.map((p) => (
              <PowerCard key={`${p.category}-${p.trait}`} power={p} />
            ))}
          </div>

          <Card className="border border-purple-500/20 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-purple-300">The Six-Layer Power Model</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-purple-100/80 space-y-2">
              <p>Every 0N1's abilities are read from its on-chain traits in six layers:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li><strong>Background</strong> — environmental resonance amplifiers (passive stat buffs)</li>
                <li><strong>Body Type</strong> — the primary power-granting trait and core combat identity</li>
                <li><strong>Face (Masks)</strong> — tactical specialization with secondary power sets</li>
                <li><strong>Extra (Accessories)</strong> — utility, familiars, and support powers</li>
                <li><strong>Head / Eyes</strong> — perception traits and minor powers</li>
                <li><strong>Spirit / Style / Strength</strong> — Defense / Offense / Power stats (1-10)</li>
              </ol>
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                {statDefinitions.map((s) => (
                  <div key={s.statName} className="border border-purple-500/20 rounded-md p-3">
                    <p className="font-semibold text-pink-300">{s.statName} — {s.role}</p>
                    <p className="text-purple-100/70 text-xs mt-1">{s.description}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <p className="font-semibold text-purple-300 mb-1">Background Resonances</p>
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {backgroundResonances.slice(0, 6).map((b) => (
                    <li key={b.trait}>
                      <span className="text-pink-300">{b.trait}:</span>{" "}
                      <span className="text-purple-100/70">{b.effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- World ---- */}
        <TabsContent value="world" className="space-y-4 mt-6">
          {[
            { title: "The Setting", body: worldOverview.setting },
            { title: "The One Source", body: worldOverview.oneSource },
            { title: "Cosmology & The Veil", body: worldOverview.cosmology },
            { title: "Nexus Chronology", body: worldOverview.chronology },
          ].map((s) => (
            <Card key={s.title} className="border border-purple-500/30 bg-black/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-purple-200">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-100/85 whitespace-pre-line">{s.body}</p>
              </CardContent>
            </Card>
          ))}

          <Card className="border border-purple-500/30 bg-black/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-200">Population Classes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {populationClasses.map((c) => (
                <div key={c.name} className="border border-purple-500/20 rounded-md p-3">
                  <p className="font-semibold text-pink-300">{c.name}</p>
                  <p className="text-xs text-purple-400">{c.share}</p>
                  <p className="text-xs text-purple-100/75 mt-1">{c.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-purple-500/30 bg-black/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-200">Power Tiers (Type trait)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {typeTiers.map((t) => (
                <div key={t.trait} className="border border-purple-500/20 rounded-md p-3">
                  <p className="font-semibold text-pink-300">
                    {t.trait} — {t.tierName} <Badge className="ml-1 bg-purple-700">Level {t.powerLevel}</Badge>
                  </p>
                  <p className="text-xs text-purple-400">{t.share}</p>
                  <p className="text-xs text-purple-100/75 mt-1">{t.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-purple-500/30 bg-black/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-200">Design Principles of the Power System</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {designPrinciples.map((d) => (
                <div key={d.name} className="border border-purple-500/20 rounded-md p-3">
                  <p className="font-semibold text-pink-300">{d.name}</p>
                  <p className="text-xs text-purple-100/75 mt-1">{d.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Districts ---- */}
        <TabsContent value="districts" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {districts.map((d) => (
              <Card key={d.name} className="border border-purple-500/30 bg-black/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-purple-200">{d.name}</CardTitle>
                  <p className="text-sm text-pink-400/90">{d.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-100/85">{d.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---- History ---- */}
        <TabsContent value="history" className="mt-6">
          <div className="relative border-l-2 border-purple-500/30 ml-3 space-y-6 pl-6 py-2">
            {historyTimeline.map((e) => (
              <div key={e.era} className="relative">
                <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <h3 className="font-semibold text-purple-200">{e.era}</h3>
                <p className="text-sm text-purple-100/80 mt-1">{e.events}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---- Houses & Factions ---- */}
        <TabsContent value="factions" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-purple-200">The Seven K4M-1 Houses</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {domains.map((h) => (
              <Card key={h.house} className="border border-purple-500/30 bg-black/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-purple-200">
                    {h.house} <span className="text-purple-400 text-sm">{h.houseNumber}</span>
                  </CardTitle>
                  <p className="text-sm text-pink-400/90 italic">{h.philosophy}</p>
                </CardHeader>
                <CardContent className="text-sm space-y-1 text-purple-100/85">
                  <p><span className="text-purple-300 font-medium">Domain:</span> {h.trait}</p>
                  <p><span className="text-purple-300 font-medium">Body type affinity:</span> {h.bodyTypeAffinity}</p>
                  <p><span className="text-purple-300 font-medium">Divine power:</span> {h.divinePower}</p>
                  <p><span className="text-purple-300 font-medium">Domain bonus:</span> {h.bonus}</p>
                  <p className="text-purple-300/70 italic pt-1">Secret: {h.secret}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-purple-200 pt-4">Factions & Powers of The Enclave</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {canonFactions.map((f) => (
              <Card key={f.name} className="border border-purple-500/30 bg-black/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-purple-200">{f.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-100/85">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---- Glossary ---- */}
        <TabsContent value="glossary" className="mt-6">
          <Accordion type="multiple" className="w-full">
            {Object.entries(glossary).map(([term, def]) => (
              <AccordionItem key={term} value={term} className="border-purple-500/20">
                <AccordionTrigger className="text-purple-200 hover:text-purple-100">{term}</AccordionTrigger>
                <AccordionContent className="text-purple-100/80">{def}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  )
}
