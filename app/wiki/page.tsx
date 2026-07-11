import { WikiBrowser } from "@/components/wiki/wiki-browser"

export const metadata = {
  title: "0N1 Force Lore Wiki",
  description: "The canonical 0N1 Force universe: world, districts, history, houses, and every trait power.",
}

export default function WikiPage() {
  return (
    <main className="min-h-screen bg-background">
      <WikiBrowser />
    </main>
  )
}
