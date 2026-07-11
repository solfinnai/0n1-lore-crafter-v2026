"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface MemoryCategoryPickerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    category: string
    tags: string[]
    importance: number
    text: string
  }) => void
  selectedText: string
  existingTags?: string[]
}

const DEFAULT_CATEGORIES = [
  "Personality Traits",
  "Important Facts", 
  "Preferences",
  "Chat History",
  "Character Development",
  "Relationships",
  "Backstory",
  "Powers & Abilities"
]

export function MemoryCategoryPicker({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedText,
  existingTags = []
}: MemoryCategoryPickerProps) {
  const [category, setCategory] = useState("Chat History")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [importance, setImportance] = useState(3)
  const [showNewCategory, setShowNewCategory] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    const finalCategory = showNewCategory && newCategory.trim() 
      ? newCategory.trim() 
      : category

    onSave({
      category: finalCategory,
      tags: tags,
      importance: importance,
      text: selectedText
    })

    // Reset form
    setCategory("Chat History")
    setTags([])
    setNewTag("")
    setNewCategory("")
    setImportance(3)
    setShowNewCategory(false)
    onClose()
  }

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <button
        key={index}
        type="button"
        className={`text-2xl ${
          index < importance 
            ? "text-yellow-400 hover:text-yellow-300" 
            : "text-gray-600 hover:text-yellow-400"
        } transition-colors`}
        onClick={() => setImportance(index + 1)}
      >
        ★
      </button>
    ))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-purple-500/30 bg-black/90 backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Add to Memory</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Text Preview */}
          <div className="p-3 rounded-md bg-purple-950/30 border border-purple-500/20">
            <Label className="text-sm text-purple-300 mb-1 block">Selected Text:</Label>
            <p className="text-sm text-white line-clamp-3">"{selectedText}"</p>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-purple-300">Category</Label>
            {!showNewCategory ? (
              <div className="space-y-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-black/40 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/30">
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-purple-900/50">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-500/30 text-purple-300"
                  onClick={() => setShowNewCategory(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name..."
                  className="bg-black/40 border-purple-500/30"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300"
                  onClick={() => setShowNewCategory(false)}
                >
                  Use Existing Category
                </Button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-purple-300">Tags</Label>
            
            {/* Existing Tags */}
            {existingTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-purple-400">Quick add from existing:</p>
                <div className="flex flex-wrap gap-1">
                  {existingTags.slice(0, 8).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag])
                        }
                      }}
                    >
                      +{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-900/50 text-purple-100"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 hover:text-red-300"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* New Tag Input */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag..."
                className="bg-black/40 border-purple-500/30"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="border-purple-500/30"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Importance */}
          <div className="space-y-2">
            <Label className="text-purple-300">Importance</Label>
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="ml-2 text-sm text-purple-400">({importance}/5)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-purple-500/30 text-purple-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedText.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Save to Memory
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 