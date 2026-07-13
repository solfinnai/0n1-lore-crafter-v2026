"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { DEMO_WALLET_ADDRESS, isClientDemoModeEnabled, isSampleModeEnabled } from "@/lib/dev-mode"
import { describeWalletError, discoverWalletProvider, requestAccounts } from "@/lib/wallet-request"
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
  /**
   * Adopt an address that was already authorized elsewhere (e.g. wallet
   * sign-in just ran eth_requestAccounts) — sets connected state without
   * prompting the wallet again.
   */
  adoptAddress: (address: string) => void
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
  adoptAddress: () => {},
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
    // EIP-6963 discovery so a second wallet extension can't silently swallow
    // the request; falls back to window.ethereum.
    const provider = discoverWalletProvider()
    if (!provider) {
      setError("MetaMask is not installed. Please install MetaMask to connect your wallet.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log("Requesting accounts from MetaMask...")
      // Deadline-raced: MetaMask can leave this pending forever (locked wallet,
      // unnoticed popup) and the spinner must always be able to reset.
      const accounts = await requestAccounts(provider)
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
      setError(describeWalletError(err))
    } finally {
      setIsConnecting(false)
    }
  }

  // Demo/sample mode: connect with the reserved demo address (no MetaMask
  // needed). Enabled by NEXT_PUBLIC_DEV_MODE=true (dev, full demo set) or
  // NEXT_PUBLIC_ENABLE_SAMPLE_MODE=true (production, sample token only) -
  // the server gates what this address can actually see either way.
  const connectDemo = () => {
    if (!isClientDemoModeEnabled() && !isSampleModeEnabled()) {
      setError("Demo mode is not enabled. Set NEXT_PUBLIC_DEV_MODE=true or NEXT_PUBLIC_ENABLE_SAMPLE_MODE=true.")
      return
    }
    setError(null)
    setAddress(DEMO_WALLET_ADDRESS)
    setIsConnected(true)
    localStorage.setItem("walletAddress", DEMO_WALLET_ADDRESS)
    console.log("Connected in demo mode:", DEMO_WALLET_ADDRESS)
  }

  const adoptAddress = (adopted: string) => {
    setError(null)
    setAddress(adopted)
    setIsConnected(true)
    localStorage.setItem("walletAddress", adopted)
    console.log("Wallet adopted from sign-in:", adopted)
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
        adoptAddress,
        disconnect,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
