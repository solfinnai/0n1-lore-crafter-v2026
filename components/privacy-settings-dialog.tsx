"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Shield, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  TestTube,
  Save,
  X
} from "lucide-react"
import {
  type PrivacySettings,
  type PrivacyPattern,
  DEFAULT_PRIVACY_PATTERNS,
  loadPrivacySettings,
  savePrivacySettings,
  createCustomPattern,
  validateRegexPattern,
  previewPrivacyFilters
} from "@/lib/privacy-filters"

interface PrivacySettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nftId: string
  onSettingsChange: (settings: PrivacySettings) => void
}

export function PrivacySettingsDialog({
  open,
  onOpenChange,
  nftId,
  onSettingsChange
}: PrivacySettingsDialogProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    enabled: false,
    patterns: DEFAULT_PRIVACY_PATTERNS
  })
  
  const [newPatternName, setNewPatternName] = useState("")
  const [newPatternRegex, setNewPatternRegex] = useState("")
  const [newPatternReplacement, setNewPatternReplacement] = useState("")
  const [newPatternFlags, setNewPatternFlags] = useState("g")
  const [regexError, setRegexError] = useState("")
  
  const [testText, setTestText] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [previewResult, setPreviewResult] = useState<any>(null)
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Load settings on mount
  useEffect(() => {
    if (open && nftId) {
      const loadedSettings = loadPrivacySettings(nftId)
      setSettings(loadedSettings)
    }
  }, [open, nftId])

  // Save settings
  const handleSave = () => {
    savePrivacySettings(nftId, settings)
    onSettingsChange(settings)
    onOpenChange(false)
  }

  // Toggle privacy mode
  const togglePrivacyMode = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }))
  }

  // Toggle pattern enabled state
  const togglePattern = (patternId: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      patterns: prev.patterns.map(p => 
        p.id === patternId ? { ...p, enabled } : p
      )
    }))
  }

  // Add custom pattern
  const addCustomPattern = () => {
    if (!newPatternName.trim() || !newPatternRegex.trim() || !newPatternReplacement.trim()) {
      return
    }

    if (!validateRegexPattern(newPatternRegex, newPatternFlags)) {
      setRegexError("Invalid regex pattern")
      return
    }

    const customPattern = createCustomPattern(
      newPatternName,
      newPatternRegex,
      newPatternReplacement,
      newPatternFlags
    )

    if (customPattern) {
      setSettings(prev => ({
        ...prev,
        patterns: [...prev.patterns, customPattern]
      }))

      // Clear form
      setNewPatternName("")
      setNewPatternRegex("")
      setNewPatternReplacement("")
      setNewPatternFlags("g")
      setRegexError("")
    }
  }

  // Delete custom pattern
  const deletePattern = (patternId: string) => {
    setSettings(prev => ({
      ...prev,
      patterns: prev.patterns.filter(p => p.id !== patternId)
    }))
    setDeleteConfirmId(null)
  }

  // Test patterns with sample text
  const testPatterns = () => {
    if (!testText.trim()) return

    const result = previewPrivacyFilters(testText, settings)
    setPreviewResult(result)
    setShowPreview(true)
  }

  // Validate regex as user types
  const handleRegexChange = (value: string) => {
    setNewPatternRegex(value)
    if (value && !validateRegexPattern(value, newPatternFlags)) {
      setRegexError("Invalid regex pattern")
    } else {
      setRegexError("")
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border border-purple-500/30 bg-black/90 backdrop-blur-sm max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-purple-300 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Data Protection Settings
            </DialogTitle>
            <DialogDescription>
              Configure privacy filters to automatically redact sensitive information from exports.
              These filters only apply to exported data, not to your stored content.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="patterns" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patterns">Privacy Patterns</TabsTrigger>
              <TabsTrigger value="custom">Custom Patterns</TabsTrigger>
              <TabsTrigger value="test">Test & Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="patterns" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-purple-300">Enable Privacy Mode</Label>
                  <p className="text-sm text-gray-400">
                    When enabled, sensitive information will be redacted in exports
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={togglePrivacyMode}
                />
              </div>

              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-3">
                  {settings.patterns.map((pattern) => (
                    <Card key={pattern.id} className="border border-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-purple-300">{pattern.name}</Label>
                              {pattern.isCustom && (
                                <Badge variant="outline" className="text-xs">Custom</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              Replaces with: <code className="bg-gray-800 px-1 rounded">{pattern.replacement}</code>
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              Pattern: {pattern.pattern.source}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={pattern.enabled}
                              onCheckedChange={(enabled) => togglePattern(pattern.id, enabled)}
                              disabled={!settings.enabled}
                            />
                            {pattern.isCustom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(pattern.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card className="border border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Custom Privacy Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pattern Name</Label>
                      <Input
                        placeholder="e.g., Company Names"
                        value={newPatternName}
                        onChange={(e) => setNewPatternName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Replacement Text</Label>
                      <Input
                        placeholder="e.g., [COMPANY_REDACTED]"
                        value={newPatternReplacement}
                        onChange={(e) => setNewPatternReplacement(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label>Regular Expression Pattern</Label>
                      <Input
                        placeholder="e.g., \\b(Apple|Google|Microsoft)\\b"
                        value={newPatternRegex}
                        onChange={(e) => handleRegexChange(e.target.value)}
                        className={regexError ? "border-red-500" : ""}
                      />
                      {regexError && (
                        <p className="text-sm text-red-400">{regexError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Flags</Label>
                      <Input
                        placeholder="g"
                        value={newPatternFlags}
                        onChange={(e) => setNewPatternFlags(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={addCustomPattern}
                    disabled={!newPatternName.trim() || !newPatternRegex.trim() || !newPatternReplacement.trim() || !!regexError}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Pattern
                  </Button>
                </CardContent>
              </Card>

              <div className="text-sm text-gray-400 space-y-2">
                <p><strong>Regex Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use <code>\\b</code> for word boundaries</li>
                  <li>Use <code>(option1|option2)</code> for alternatives</li>
                  <li>Use <code>\\d</code> for digits, <code>\\w</code> for word characters</li>
                  <li>Use <code>+</code> for one or more, <code>*</code> for zero or more</li>
                  <li>Common flags: <code>g</code> (global), <code>i</code> (case-insensitive)</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <Card className="border border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Privacy Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Text</Label>
                    <Textarea
                      placeholder="Enter text to test privacy filters... (e.g., 'Contact me at john@example.com or call 555-123-4567')"
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={testPatterns}
                    disabled={!testText.trim() || !settings.enabled}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Privacy Filtering
                  </Button>

                  {showPreview && previewResult && (
                    <Card className="border border-yellow-500/20">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-yellow-300 font-medium">Preview Results</h4>
                          <Badge variant="outline">
                            {previewResult.matchCount} matches found
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-gray-400">Original Text:</Label>
                            <div className="bg-gray-800 p-3 rounded text-sm font-mono">
                              {previewResult.originalText}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm text-gray-400">Filtered Text:</Label>
                            <div className="bg-gray-800 p-3 rounded text-sm font-mono">
                              {previewResult.filteredText}
                            </div>
                          </div>

                          {previewResult.patternMatches.length > 0 && (
                            <div>
                              <Label className="text-sm text-gray-400">Pattern Matches:</Label>
                              <div className="space-y-1">
                                {previewResult.patternMatches.map((pm: any, index: number) => (
                                  pm.count > 0 && (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{pm.pattern.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {pm.count} matches
                                      </Badge>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t border-purple-500/20">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Pattern</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom privacy pattern? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deletePattern(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 