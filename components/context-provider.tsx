"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Info, X, Pin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ContextProviderProps {
  onAddContext: (context: {
    content: string
    tags: string[]
    customTags: string[]
    importance: number
  }) => void
  existingTags?: string[] // tags from the memory system
  pinnedTags?: string[] // pinned tags for quick access
}

export function ContextProvider({ onAddContext, existingTags = [], pinnedTags = [] }: ContextProviderProps) {
  const [content, setContent] = useState("")
  const [importance, setImportance] = useState(7)
  const [tagInput, setTagInput] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Predefined quick tags that are always available
  const quickTags = ["important", "follow-up", "backstory", "preferences", "plot", "world", "character-growth"]
  
  // Combine all available tags (pinned first, then existing, then quick tags)
  const availableTags = [
    ...pinnedTags,
    ...existingTags.filter(tag => !pinnedTags.includes(tag)),
    ...quickTags.filter(tag => !existingTags.includes(tag) && !pinnedTags.includes(tag))
  ]

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag])
    }
    setTagInput("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (tagInput.trim()) {
        handleAddTag(tagInput)
      }
    }
  }

  const handleSubmit = () => {
    if (!content.trim()) return

    // Separate existing tags from new custom tags
    const existingTagsSelected = selectedTags.filter(tag => 
      availableTags.includes(tag) || quickTags.includes(tag)
    )
    const customTagsSelected = selectedTags.filter(tag => 
      !availableTags.includes(tag) && !quickTags.includes(tag)
    )

    onAddContext({
      content: content.trim(),
      tags: existingTagsSelected,
      customTags: customTagsSelected,
      importance,
    })

    // Reset form
    setContent("")
    setImportance(7)
    setSelectedTags([])
    setTagInput("")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-900/20">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Context
        </Button>
      </DialogTrigger>
      <DialogContent className="border border-purple-500/30 bg-black/90 backdrop-blur-sm max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Context for Your Soul Agent</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Information to Remember</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter information you want your Soul Agent to remember..."
              className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500 min-h-[120px]"
              rows={5}
            />
          </div>

          {/* Tag Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label>Tags</Label>
              <div className="relative group">
                <Info className="h-4 w-4 text-muted-foreground" />
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-2 bg-black border border-purple-500/30 rounded text-xs hidden group-hover:block z-10">
                  Create custom tags or use existing ones. New tags will automatically create categories in your memory.
                </div>
              </div>
            </div>

            {/* Pinned Tags (Quick Access) */}
            {pinnedTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">📌 Pinned Tags (Quick Access)</Label>
                <div className="flex flex-wrap gap-1">
                  {pinnedTags.slice(0, 10).map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          handleRemoveTag(tag)
                        } else {
                          handleAddTag(tag)
                        }
                      }}
                    >
                      <Pin className="h-3 w-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Tags */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Existing Tags</Label>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {availableTags.slice(0, 20).map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          handleRemoveTag(tag)
                        } else {
                          handleAddTag(tag)
                        }
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tag Input */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Create New Tags</Label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Type custom tags and press Enter (e.g., 'family-history', 'combat-style')"
                className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
              />
              {tagInput.trim() && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTag(tagInput)}
                  className="text-xs"
                >
                  Add "{tagInput.trim()}"
                </Button>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Selected Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Importance */}
          <div className="space-y-2">
            <Label>Importance (1-10)</Label>
            <Select value={importance.toString()} onValueChange={(value) => setImportance(Number.parseInt(value))}>
              <SelectTrigger className="bg-background/50 border-purple-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} - {num >= 8 ? "Critical" : num >= 5 ? "Important" : "Normal"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Add to Agent Memory
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
