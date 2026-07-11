"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Wallet, LogOut, FlaskConical } from "lucide-react"
import { useWallet } from "./wallet-provider"
import { shortenAddress } from "@/lib/wallet"
import { isClientDemoModeEnabled, isDemoWallet } from "@/lib/dev-mode"

export function WalletConnectButton() {
  const { address, isConnected, isConnecting, connect, connectDemo, disconnect, error } = useWallet()

  const handleConnect = () => {
    connect()
  }

  const handleDisconnect = () => {
    console.log("Disconnect button clicked")
    disconnect()
  }

  return (
    <div className="flex flex-col items-end">
      {isConnected ? (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="bg-purple-900/50 hover:bg-purple-900/70 text-purple-100 border-purple-500/50"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            {isDemoWallet(address) ? "Demo Wallet" : shortenAddress(address || "")}
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDisconnect} title="Disconnect wallet">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
          {isClientDemoModeEnabled() && (
            <Button
              onClick={connectDemo}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50"
              title="Try the app without MetaMask or an NFT"
            >
              <FlaskConical className="mr-2 h-4 w-4" />
              Demo Mode
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
