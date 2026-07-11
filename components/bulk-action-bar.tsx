"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, X } from "lucide-react"

interface BulkActionBarProps {
  selectedCount: number
  onBulkSave: () => void
  onClearSelection: () => void
}

export function BulkActionBar({ selectedCount, onBulkSave, onClearSelection }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
      <div className="bg-black/90 backdrop-blur-md border border-purple-500/50 rounded-lg px-6 py-3 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-900/50 text-purple-100">
              {selectedCount} selected
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            
            <Button
              size="sm"
              onClick={onBulkSave}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Star className="h-4 w-4 mr-1" />
              Add {selectedCount} to Memory
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 