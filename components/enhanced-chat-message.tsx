"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Star, MoreVertical, Copy, Check, User, Bot } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SavedTextSegment {
  start: number
  end: number
  id: string
}

interface EnhancedChatMessageProps {
  message: Message
  isSelected: boolean
  onSelectionChange: (messageId: string, selected: boolean) => void
  onSaveToMemory: (text: string, messageId: string) => void
  savedSegments: SavedTextSegment[]
  isMemorySaved: boolean
  characterImageUrl?: string
}

export function EnhancedChatMessage({
  message,
  isSelected,
  onSelectionChange,
  onSaveToMemory,
  savedSegments,
  isMemorySaved,
  characterImageUrl
}: EnhancedChatMessageProps) {
  const [showStar, setShowStar] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      setSelectedText(text)
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    } else {
      setSelectedText("")
      setSelectionPosition(null)
    }
  }

  const handleSaveSelectedText = () => {
    if (selectedText) {
      onSaveToMemory(selectedText, message.id)
      setSelectedText("")
      setSelectionPosition(null)
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleSaveFullMessage = () => {
    onSaveToMemory(message.content, message.id)
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
    toast.success("Message copied to clipboard")
  }

  const renderContentWithHighlights = () => {
    if (savedSegments.length === 0) {
      return message.content
    }

    // Sort segments by start position
    const sortedSegments = [...savedSegments].sort((a, b) => a.start - b.start)
    
    let lastIndex = 0
    const parts: React.ReactNode[] = []

    sortedSegments.forEach((segment, index) => {
      // Add text before this segment
      if (segment.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {message.content.slice(lastIndex, segment.start)}
          </span>
        )
      }

      // Add highlighted segment
      parts.push(
        <span
          key={`highlight-${segment.id}`}
          className="bg-yellow-200/20 border-b border-yellow-400/50 rounded px-1"
          title="Saved to memory"
        >
          {message.content.slice(segment.start, segment.end)}
        </span>
      )

      lastIndex = segment.end
    })

    // Add remaining text
    if (lastIndex < message.content.length) {
      parts.push(
        <span key="text-end">
          {message.content.slice(lastIndex)}
        </span>
      )
    }

    return <>{parts}</>
  }

  return (
    <div
      className={`flex items-start space-x-3 group ${
        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {/* Checkbox - Only for AI messages */}
      {message.role === "assistant" && (
        <div className="flex-shrink-0 pt-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(message.id, !!checked)}
            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
        </div>
      )}

      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
        {message.role === "user" ? (
          <div className="w-full h-full bg-blue-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        ) : characterImageUrl ? (
          <img 
            src={characterImageUrl} 
            alt="Character" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to Bot icon if image fails to load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback Bot icon - hidden by default, shown if image fails */}
        <div 
          className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center" 
          style={{ display: characterImageUrl ? 'none' : 'flex' }}
        >
          <Bot className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
        <div
          ref={messageRef}
          className={`relative inline-block p-3 rounded-lg ${
            message.role === "user" ? "bg-blue-600 text-white" : "bg-muted"
          }`}
          onMouseEnter={() => message.role === "assistant" && setShowStar(true)}
          onMouseLeave={() => setShowStar(false)}
        >
          {/* Action Buttons - Only for AI messages */}
          {message.role === "assistant" && (
            <>
              {/* Three Dots Menu - Top Left */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -left-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-black/90 border border-purple-500/30"
                  >
                    <MoreVertical className="h-3 w-3 text-purple-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 border-purple-500/30">
                  <DropdownMenuItem onClick={handleSaveFullMessage} className="text-purple-200 hover:bg-purple-900/50">
                    <Star className="h-4 w-4 mr-2" />
                    Save Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyMessage} className="text-purple-200 hover:bg-purple-900/50">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Star Button - Top Right */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveFullMessage}
                className={`absolute -top-2 -right-2 w-6 h-6 p-0 transition-all bg-black/80 hover:bg-black/90 border border-purple-500/30 ${
                  showStar || isMemorySaved ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {isMemorySaved ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Star className="h-3 w-3 text-yellow-400" />
                )}
              </Button>
            </>
          )}

          {/* Message Text */}
          <div
            className="whitespace-pre-wrap select-text"
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            {renderContentWithHighlights()}
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {/* Floating "Add to Memory" Button for Selected Text */}
      {selectedText && selectionPosition && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: selectionPosition.x,
            top: selectionPosition.y,
          }}
        >
          <Button
            size="sm"
            onClick={handleSaveSelectedText}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg border border-purple-500/50"
          >
            Add to Memory
          </Button>
        </div>
      )}
    </div>
  )
} 