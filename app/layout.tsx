import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { WalletProvider } from "@/components/wallet/wallet-provider"
import { SessionProvider } from "@/components/auth/session-provider"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "0N1 Lore Crafter",
  description: "Create detailed lore for your 0N1 Force NFT character",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <WalletProvider>
            <SessionProvider>
              <Header />
              {children}
              <Toaster />
            </SessionProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
