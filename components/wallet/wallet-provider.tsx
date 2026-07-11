"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { DEMO_WALLET_ADDRESS, isClientDemoModeEnabled } from "@/lib/dev-mode"
// Wallet address is now handled directly in components

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (accounts: string[]) => void) => void
      removeListener: (event: string, handler: (accounts: string[]) => void) => void
    }
  }
}

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  // True until the saved wallet connection has been restored from localStorage.
  // Consumers must not treat "not connected" as final while this is true.
  isInitializing: boolean
  connect: () => Promise<void>
  connectDemo: () => void
  disconnect: () => void
  error: string | null
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  isInitializing: true,
  connect: async () => {},
  connectDemo: () => {},
  disconnect: () => {},
  error: null,
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Check if ethereum is available
  const isMetaMaskAvailable = () => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  // Initialize wallet state from localStorage
  useEffect(() => {
    setMounted(true)
    const savedAddress = localStorage.getItem("walletAddress")
    if (savedAddress) {
      setAddress(savedAddress)
      setIsConnected(true)
      // Wallet address is now managed by React context
      console.log("Restored wallet connection from localStorage:", savedAddress)
    }
    setIsInitializing(false)
  }, [])

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskAvailable() || !isConnected) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("MetaMask accounts changed:", accounts)
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect()
      } else if (accounts[0] !== address) {
        // User switched accounts
        setAddress(accounts[0])
        localStorage.setItem("walletAddress", accounts[0])
        // Wallet address updated in React context
        console.log("Updated wallet address:", accounts[0])
      }
    }

    window.ethereum?.on("accountsChanged", handleAccountsChanged)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [address, isConnected])

  const connect = async () => {
    if (!isMetaMaskAvailable()) {
      setError("MetaMask is not installed. Please install MetaMask to connect your wallet.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log("Requesting accounts from MetaMask...")
      console.log("Current URL:", window.location.href)
      console.log("Ethereum object:", window.ethereum)
      
      const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" })
      console.log("MetaMask accounts:", accounts)

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        localStorage.setItem("walletAddress", accounts[0])
        // Wallet address set in React context
        console.log("Wallet connected:", accounts[0])
      } else {
        setError("No accounts returned from MetaMask. Please check your wallet.")
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      console.error("Error code:", err.code)
      console.error("Error message:", err.message)
      
      if (err.code === 4001) {
        setError("Connection rejected. Please approve the connection in MetaMask.")
      } else if (err.code === -32002) {
        setError("MetaMask is already processing a request. Please check MetaMask.")
      } else {
        setError(`Failed to connect wallet: ${err.message || "Unknown error"}`)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Demo mode: connect with a fake wallet (no MetaMask needed). Only used when
  // NEXT_PUBLIC_DEV_MODE=true - the server also gates demo data behind dev mode.
  const connectDemo = () => {
    if (!isClientDemoModeEnabled()) {
      setError("Demo mode is not enabled. Set NEXT_PUBLIC_DEV_MODE=true in .env.local.")
      return
    }
    setError(null)
    setAddress(DEMO_WALLET_ADDRESS)
    setIsConnected(true)
    localStorage.setItem("walletAddress", DEMO_WALLET_ADDRESS)
    console.log("Connected in demo mode:", DEMO_WALLET_ADDRESS)
  }

  const disconnect = () => {
    console.log("Disconnecting wallet...")
    setAddress(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
    // Wallet address cleared from React context
    console.log("Wallet disconnected, localStorage cleared")

    // Force a page refresh to ensure clean state
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  // Don't render anything on the server
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        isInitializing,
        connect,
        connectDemo,
        disconnect,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
