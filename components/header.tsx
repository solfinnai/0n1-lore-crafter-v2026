"use client"

import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, Home, Library } from "lucide-react"
import { SyncStatus } from "@/components/sync-status"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-black/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              0N1 Lore Crafter
            </span>
          </Link>

          <nav className="hidden md:flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={pathname === "/" ? "text-purple-300" : "text-muted-foreground"}
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={pathname === "/souls" ? "text-purple-300" : "text-muted-foreground"}
              onClick={() => router.push("/souls")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Souls
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={pathname?.startsWith("/wiki") ? "text-purple-300" : "text-muted-foreground"}
              onClick={() => router.push("/wiki")}
            >
              <Library className="h-4 w-4 mr-2" />
              Lore Wiki
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {pathname === "/" ? (
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => router.push("/souls")}>
              <BookOpen className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => router.push("/")}>
              <Home className="h-5 w-5" />
            </Button>
          )}
          <SyncStatus />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  )
}
