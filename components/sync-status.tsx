"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudOff, HardDrive, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { manualSync } from "@/lib/storage-wrapper"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useWallet } from "@/components/wallet/wallet-provider"

export function SyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const { address } = useWallet()

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Check last sync time
    const checkLastSync = () => {
      const syncTime = localStorage.getItem('oni-souls-last-sync')
      if (syncTime) {
        setLastSync(new Date(parseInt(syncTime)))
      }
    }
    
    checkLastSync()
    const interval = setInterval(checkLastSync, 10000) // Check every 10 seconds
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  const handleManualSync = async () => {
    if (!address) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSyncing(true)
    
    try {
      const result = await manualSync()
      
      if (result.success) {
        toast.success(`Synced ${result.synced} souls to cloud storage`)
        setLastSync(new Date())
      } else {
        toast.error("Sync failed", {
          description: result.errors.join(", ")
        })
      }
    } catch (error) {
      toast.error("Sync failed", {
        description: "Please check your connection and try again"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getTimeSinceSync = () => {
    if (!lastSync) return "Never synced"
    
    const now = new Date()
    const diff = now.getTime() - lastSync.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!address) return null

  // Cloud storage disabled - souls live in browser localStorage only
  if (!supabase) {
    return (
      <Badge
        variant="outline"
        className="border-purple-500/50 text-purple-300"
        title="Souls are saved in this browser. Cloud sync is not configured."
      >
        <HardDrive className="w-3 h-3 mr-1" />
        Local only
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`
          ${isOnline ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}
          ${isSyncing ? 'animate-pulse' : ''}
        `}
      >
        {isOnline ? (
          <>
            <Cloud className="w-3 h-3 mr-1" />
            {isSyncing ? "Syncing..." : `Synced ${getTimeSinceSync()}`}
          </>
        ) : (
          <>
            <CloudOff className="w-3 h-3 mr-1" />
            Offline
          </>
        )}
      </Badge>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={handleManualSync}
        disabled={isSyncing || !isOnline}
        className="h-8 w-8"
        title="Manual sync"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
} 