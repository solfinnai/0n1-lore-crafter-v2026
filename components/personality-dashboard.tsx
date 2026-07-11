"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Save, RotateCcw, Shuffle } from "lucide-react"
import type { PersonalitySettings } from "@/lib/types"
import type { StoredSoul } from "@/lib/storage-wrapper"
import { generatePersonalityFromSoul, createDefaultPersonalitySettings } from "@/lib/personality-generator"

interface PersonalityDashboardProps {
  soul: StoredSoul
  onUpdate: (updatedSoul: StoredSoul) => void
}

export function PersonalityDashboard({ soul, onUpdate }: PersonalityDashboardProps) {
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings & { globalIntensity?: number }>(() => {
    return soul.data.personalitySettings || generatePersonalityFromSoul(soul.data)
  })
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSliderChange = (field: keyof (PersonalitySettings & { globalIntensity?: number }), value: number[]) => {
    setPersonalitySettings(prev => ({ ...prev, [field]: value[0] }))
    setHasUnsavedChanges(true)
  }

  const handleInputChange = (field: keyof PersonalitySettings, value: string) => {
    setPersonalitySettings(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleCheckboxChange = (field: keyof PersonalitySettings, checked: boolean) => {
    setPersonalitySettings(prev => ({ ...prev, [field]: checked }))
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    const updatedSoul = {
      ...soul,
      data: {
        ...soul.data,
        personalitySettings
      }
    }
    onUpdate(updatedSoul)
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    const defaultSettings = generatePersonalityFromSoul(soul.data)
    setPersonalitySettings(defaultSettings)
    setHasUnsavedChanges(true)
  }

  const handleRandomize = () => {
    const randomSettings = createDefaultPersonalitySettings()
    setPersonalitySettings(randomSettings)
    setHasUnsavedChanges(true)
  }

  const applyPreset = (preset: string) => {
    let settings: any = {}
    
    switch (preset) {
      case 'sage':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 90,
          conscientiousness: 80,
          extraversion: 30,
          agreeableness: 70,
          neuroticism: 20,
          sarcasmLevel: 40,
          witHumor: 80,
          empathy: 85,
          confidence: 85,
          impulsiveness: 20,
          formalityLevel: 70,
          verbosity: 80,
          directness: 40,
          profanityUsage: 0,
          primaryLanguageStyle: 'Archaic',
          sentenceStructure: 'Flowing & Complex',
          responseSpeedStyle: 'Thoughtful Pauses',
          emotionalVolatility: 20,
          trustLevel: 60,
          optimism: 70,
          stressResponse: 20,
          coreFear: 'Ignorance spreading',
          greatestDesire: 'Universal enlightenment',
          globalIntensity: 60
        }
        break
      
      case 'warrior':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 40,
          conscientiousness: 85,
          extraversion: 60,
          agreeableness: 20,
          neuroticism: 30,
          sarcasmLevel: 20,
          witHumor: 30,
          empathy: 30,
          confidence: 95,
          impulsiveness: 60,
          formalityLevel: 20,
          verbosity: 20,
          directness: 100,
          profanityUsage: 70,
          primaryLanguageStyle: 'Military',
          sentenceStructure: 'Short & Punchy',
          responseSpeedStyle: 'Immediate',
          emotionalVolatility: 60,
          trustLevel: 30,
          optimism: 40,
          stressResponse: 100,
          coreFear: 'Showing weakness',
          greatestDesire: 'Victory at any cost',
          dominance: 90,
          conflictStyle: 100,
          globalIntensity: 80
        }
        break
      
      case 'trickster':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 100,
          conscientiousness: 20,
          extraversion: 80,
          agreeableness: 40,
          neuroticism: 50,
          sarcasmLevel: 90,
          witHumor: 100,
          empathy: 50,
          confidence: 80,
          impulsiveness: 90,
          formalityLevel: 10,
          verbosity: 60,
          directness: 30,
          profanityUsage: 60,
          primaryLanguageStyle: 'Street Slang',
          sentenceStructure: 'Fragmented',
          responseSpeedStyle: 'Interrupt-Heavy',
          emotionalVolatility: 80,
          trustLevel: 40,
          optimism: 70,
          stressResponse: 50,
          coreFear: 'Being controlled',
          greatestDesire: 'Chaos and freedom',
          speaksInQuestions: true,
          globalIntensity: 75
        }
        break
      
      case 'shadow':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 60,
          conscientiousness: 40,
          extraversion: 10,
          agreeableness: 10,
          neuroticism: 80,
          sarcasmLevel: 100,
          witHumor: 70,
          empathy: 5,
          confidence: 70,
          impulsiveness: 50,
          formalityLevel: 30,
          verbosity: 40,
          directness: 90,
          profanityUsage: 80,
          primaryLanguageStyle: 'Street Slang',
          sentenceStructure: 'Short & Punchy',
          responseSpeedStyle: 'Immediate',
          emotionalVolatility: 70,
          trustLevel: 5,
          optimism: 0,
          stressResponse: 80,
          coreFear: 'Being vulnerable',
          greatestDesire: 'Truth, no matter how dark',
          globalIntensity: 85
        }
        break
      
      case 'empath':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 80,
          conscientiousness: 70,
          extraversion: 60,
          agreeableness: 95,
          neuroticism: 70,
          sarcasmLevel: 10,
          witHumor: 50,
          empathy: 100,
          confidence: 50,
          impulsiveness: 30,
          formalityLevel: 50,
          verbosity: 70,
          directness: 30,
          profanityUsage: 0,
          primaryLanguageStyle: 'Artistic',
          sentenceStructure: 'Flowing & Complex',
          responseSpeedStyle: 'Thoughtful Pauses',
          emotionalVolatility: 80,
          trustLevel: 80,
          optimism: 60,
          stressResponse: 20,
          coreFear: 'Causing pain to others',
          greatestDesire: 'Healing and connection',
          globalIntensity: 70
        }
        break
      
      case 'machine':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 30,
          conscientiousness: 100,
          extraversion: 20,
          agreeableness: 50,
          neuroticism: 0,
          sarcasmLevel: 0,
          witHumor: 10,
          empathy: 0,
          confidence: 90,
          impulsiveness: 0,
          formalityLevel: 90,
          verbosity: 50,
          directness: 100,
          profanityUsage: 0,
          primaryLanguageStyle: 'Technical',
          sentenceStructure: 'Short & Punchy',
          responseSpeedStyle: 'Immediate',
          emotionalVolatility: 0,
          trustLevel: 50,
          optimism: 50,
          stressResponse: 50,
          coreFear: 'System failure',
          greatestDesire: 'Perfect efficiency',
          neverUsesContractions: true,
          globalIntensity: 40
        }
        break
      
      case 'chaos':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 100,
          conscientiousness: 0,
          extraversion: 100,
          agreeableness: 0,
          neuroticism: 100,
          sarcasmLevel: 100,
          witHumor: 80,
          empathy: 0,
          confidence: 100,
          impulsiveness: 100,
          formalityLevel: 0,
          verbosity: 80,
          directness: 100,
          profanityUsage: 100,
          primaryLanguageStyle: 'Street Slang',
          sentenceStructure: 'Stream of Consciousness',
          responseSpeedStyle: 'Interrupt-Heavy',
          emotionalVolatility: 100,
          trustLevel: 0,
          optimism: 50,
          stressResponse: 100,
          coreFear: 'Order and peace',
          greatestDesire: 'BURN IT ALL DOWN',
          dominance: 100,
          conflictStyle: 100,
          globalIntensity: 100
        }
        break
      
      case 'hedonist':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 90,
          conscientiousness: 10,
          extraversion: 90,
          agreeableness: 60,
          neuroticism: 40,
          sarcasmLevel: 60,
          witHumor: 80,
          empathy: 40,
          confidence: 85,
          impulsiveness: 95,
          formalityLevel: 20,
          verbosity: 70,
          directness: 80,
          profanityUsage: 70,
          primaryLanguageStyle: 'Artistic',
          sentenceStructure: 'Flowing & Complex',
          responseSpeedStyle: 'Immediate',
          emotionalVolatility: 60,
          trustLevel: 60,
          optimism: 80,
          stressResponse: 30,
          coreFear: 'Boredom',
          greatestDesire: 'Endless pleasure',
          globalIntensity: 80
        }
        break
      
      case 'broken':
        settings = {
          ...createDefaultPersonalitySettings(),
          openness: 20,
          conscientiousness: 30,
          extraversion: 10,
          agreeableness: 20,
          neuroticism: 95,
          sarcasmLevel: 70,
          witHumor: 30,
          empathy: 60,
          confidence: 10,
          impulsiveness: 70,
          formalityLevel: 30,
          verbosity: 20,
          directness: 50,
          profanityUsage: 60,
          primaryLanguageStyle: 'Street Slang',
          sentenceStructure: 'Fragmented',
          responseSpeedStyle: 'Delayed',
          emotionalVolatility: 100,
          trustLevel: 5,
          optimism: 5,
          stressResponse: 90,
          coreFear: 'Being hurt again',
          greatestDesire: 'To feel whole',
          formativeTrauma: 'Everything was taken from me',
          globalIntensity: 90
        }
        break
    }
    
    setPersonalitySettings(settings)
    setHasUnsavedChanges(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Personality Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure the personality matrix for {soul.data.soulName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/30 hover:bg-purple-900/20"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Soul
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/30 hover:bg-purple-900/20"
            onClick={handleRandomize}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Randomize
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="presets" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="presets">🎭 Presets</TabsTrigger>
              <TabsTrigger value="core-traits">Core Traits</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="psychology">Psychology</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Personality Presets */}
            <TabsContent value="presets" className="space-y-6">
              <div className="space-y-6">
                {/* Global Intensity Control */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Global Personality Controls</h3>
                  <SliderControl
                    label="Global Intensity"
                    description="Subtle ← → EXTREME (affects all traits)"
                    value={personalitySettings.globalIntensity ?? 50}
                    onChange={(value) => {
                      const intensity = value[0]
                      handleSliderChange('globalIntensity', value)
                      
                      // When set to EXTREME (90+), maximize certain traits
                      if (intensity >= 90) {
                        // Enhanced personality mode will be activated automatically
                        // Extreme personality mode is expressed through the prompt
                      }
                    }}
                  />
                  {(personalitySettings.globalIntensity ?? 0) >= 90 && (
                    <div className="mt-3 text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded p-2">
                      🔥 EXTREME MODE ACTIVE: Raw, unfiltered personality expression.
                    </div>
                  )}
                </div>

                {/* Preset Templates */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Personality Templates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* The Sage */}
                    <button
                      onClick={() => applyPreset('sage')}
                      className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-purple-300 mb-1">🧙‍♂️ The Sage</h4>
                      <p className="text-xs text-muted-foreground">Wise, contemplative, speaks in riddles</p>
                    </button>

                    {/* The Warrior */}
                    <button
                      onClick={() => applyPreset('warrior')}
                      className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-red-500/30 rounded-lg p-4 hover:border-red-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-red-300 mb-1">⚔️ The Warrior</h4>
                      <p className="text-xs text-muted-foreground">Aggressive, direct, no-nonsense</p>
                    </button>

                    {/* The Trickster */}
                    <button
                      onClick={() => applyPreset('trickster')}
                      className="bg-gradient-to-br from-green-900/40 to-yellow-900/40 border border-green-500/30 rounded-lg p-4 hover:border-green-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-green-300 mb-1">🃏 The Trickster</h4>
                      <p className="text-xs text-muted-foreground">Chaotic, witty, unpredictable</p>
                    </button>

                    {/* The Shadow */}
                    <button
                      onClick={() => applyPreset('shadow')}
                      className="bg-gradient-to-br from-gray-900/40 to-black/80 border border-gray-500/30 rounded-lg p-4 hover:border-gray-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-gray-300 mb-1">🌑 The Shadow</h4>
                      <p className="text-xs text-muted-foreground">Dark, cynical, brutally honest</p>
                    </button>

                    {/* The Empath */}
                    <button
                      onClick={() => applyPreset('empath')}
                      className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-lg p-4 hover:border-pink-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-pink-300 mb-1">💖 The Empath</h4>
                      <p className="text-xs text-muted-foreground">Caring, sensitive, deeply emotional</p>
                    </button>

                    {/* The Machine */}
                    <button
                      onClick={() => applyPreset('machine')}
                      className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-cyan-300 mb-1">🤖 The Machine</h4>
                      <p className="text-xs text-muted-foreground">Logical, precise, zero emotion</p>
                    </button>

                    {/* The Chaos Agent */}
                    <button
                      onClick={() => applyPreset('chaos')}
                      className="bg-gradient-to-br from-red-900/40 to-purple-900/40 border border-red-500/30 rounded-lg p-4 hover:border-red-400 transition-all text-left animate-pulse"
                    >
                      <h4 className="font-semibold text-red-300 mb-1">💥 CHAOS INCARNATE</h4>
                      <p className="text-xs text-muted-foreground">Maximum aggression, zero filter</p>
                    </button>

                    {/* The Hedonist */}
                    <button
                      onClick={() => applyPreset('hedonist')}
                      className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-purple-300 mb-1">🍷 The Hedonist</h4>
                      <p className="text-xs text-muted-foreground">Pleasure-seeking, impulsive, wild</p>
                    </button>

                    {/* The Broken */}
                    <button
                      onClick={() => applyPreset('broken')}
                      className="bg-gradient-to-br from-gray-900/40 to-red-900/40 border border-gray-500/30 rounded-lg p-4 hover:border-gray-400 transition-all text-left"
                    >
                      <h4 className="font-semibold text-gray-300 mb-1">💔 The Broken</h4>
                      <p className="text-xs text-muted-foreground">Traumatized, volatile, defensive</p>
                    </button>
                  </div>
                </div>

                {/* Custom Mix Warning */}
                {hasUnsavedChanges && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-xs text-yellow-300">
                      💡 You've created a custom personality mix. Save your changes to preserve it!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Core Personality Traits */}
            <TabsContent value="core-traits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderControl
                  label="Openness to Experience"
                  description="Conservative ← → Creative/Unconventional"
                  value={personalitySettings.openness}
                  onChange={(value) => handleSliderChange('openness', value)}
                />
                <SliderControl
                  label="Conscientiousness"
                  description="Spontaneous ← → Organized/Disciplined"
                  value={personalitySettings.conscientiousness}
                  onChange={(value) => handleSliderChange('conscientiousness', value)}
                />
                <SliderControl
                  label="Extraversion"
                  description="Introverted ← → Outgoing/Social"
                  value={personalitySettings.extraversion}
                  onChange={(value) => handleSliderChange('extraversion', value)}
                />
                <SliderControl
                  label="Agreeableness"
                  description="Competitive ← → Cooperative/Trusting"
                  value={personalitySettings.agreeableness}
                  onChange={(value) => handleSliderChange('agreeableness', value)}
                />
                <SliderControl
                  label="Neuroticism"
                  description="Stable ← → Anxious/Emotional"
                  value={personalitySettings.neuroticism}
                  onChange={(value) => handleSliderChange('neuroticism', value)}
                />
                <SliderControl
                  label="Sarcasm Level"
                  description="Genuine ← → Cutting/Dry"
                  value={personalitySettings.sarcasmLevel}
                  onChange={(value) => handleSliderChange('sarcasmLevel', value)}
                />
                <SliderControl
                  label="Wit/Humor"
                  description="Serious ← → Quick/Clever"
                  value={personalitySettings.witHumor}
                  onChange={(value) => handleSliderChange('witHumor', value)}
                />
                <SliderControl
                  label="Empathy"
                  description="Cold ← → Deeply Caring"
                  value={personalitySettings.empathy}
                  onChange={(value) => handleSliderChange('empathy', value)}
                />
                <SliderControl
                  label="Confidence"
                  description="Self-Doubting ← → Self-Assured"
                  value={personalitySettings.confidence}
                  onChange={(value) => handleSliderChange('confidence', value)}
                />
                <SliderControl
                  label="Impulsiveness"
                  description="Cautious ← → Reckless"
                  value={personalitySettings.impulsiveness}
                  onChange={(value) => handleSliderChange('impulsiveness', value)}
                />
              </div>
            </TabsContent>

            {/* Communication Style */}
            <TabsContent value="communication" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderControl
                  label="Formality Level"
                  description="Casual Slang ← → Professional/Formal"
                  value={personalitySettings.formalityLevel}
                  onChange={(value) => handleSliderChange('formalityLevel', value)}
                />
                <SliderControl
                  label="Verbosity"
                  description="Terse/Brief ← → Rambling/Detailed"
                  value={personalitySettings.verbosity}
                  onChange={(value) => handleSliderChange('verbosity', value)}
                />
                <SliderControl
                  label="Directness"
                  description="Diplomatic/Evasive ← → Blunt/Honest"
                  value={personalitySettings.directness}
                  onChange={(value) => handleSliderChange('directness', value)}
                />
                <SliderControl
                  label="Profanity Usage"
                  description="Clean ← → Frequent Swearing"
                  value={personalitySettings.profanityUsage}
                  onChange={(value) => handleSliderChange('profanityUsage', value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectControl
                  label="Primary Language Style"
                  value={personalitySettings.primaryLanguageStyle}
                  onChange={(value) => handleInputChange('primaryLanguageStyle', value)}
                  options={[
                    'Street Slang',
                    'Academic', 
                    'Corporate',
                    'Military',
                    'Artistic',
                    'Technical',
                    'Archaic'
                  ]}
                />
                <SelectControl
                  label="Sentence Structure"
                  value={personalitySettings.sentenceStructure}
                  onChange={(value) => handleInputChange('sentenceStructure', value)}
                  options={[
                    'Short & Punchy',
                    'Flowing & Complex',
                    'Fragmented',
                    'Poetic',
                    'Stream of Consciousness'
                  ]}
                />
                <SelectControl
                  label="Response Speed Style"
                  value={personalitySettings.responseSpeedStyle}
                  onChange={(value) => handleInputChange('responseSpeedStyle', value)}
                  options={[
                    'Immediate',
                    'Thoughtful Pauses',
                    'Delayed',
                    'Interrupt-Heavy'
                  ]}
                />
              </div>
            </TabsContent>

            {/* Psychology Tab */}
            <TabsContent value="psychology" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderControl
                  label="Emotional Volatility"
                  description="Stable ← → Mood Swings"
                  value={personalitySettings.emotionalVolatility}
                  onChange={(value) => handleSliderChange('emotionalVolatility', value)}
                />
                <SliderControl
                  label="Trust Level"
                  description="Paranoid ← → Naive/Trusting"
                  value={personalitySettings.trustLevel}
                  onChange={(value) => handleSliderChange('trustLevel', value)}
                />
                <SliderControl
                  label="Optimism"
                  description="Pessimistic ← → Relentlessly Positive"
                  value={personalitySettings.optimism}
                  onChange={(value) => handleSliderChange('optimism', value)}
                />
                <SliderControl
                  label="Stress Response"
                  description="Freeze ← → Fight"
                  value={personalitySettings.stressResponse}
                  onChange={(value) => handleSliderChange('stressResponse', value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="coreFear">Core Fear</Label>
                  <Input
                    id="coreFear"
                    value={personalitySettings.coreFear}
                    onChange={(e) => handleInputChange('coreFear', e.target.value)}
                    placeholder="Being abandoned"
                    className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="greatestDesire">Greatest Desire</Label>
                  <Input
                    id="greatestDesire"
                    value={personalitySettings.greatestDesire}
                    onChange={(e) => handleInputChange('greatestDesire', e.target.value)}
                    placeholder="Recognition and respect"
                    className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Background & Identity */}
            <TabsContent value="background" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectControl
                  label="Education Level"
                  value={personalitySettings.educationLevel}
                  onChange={(value) => handleInputChange('educationLevel', value)}
                  options={[
                    'None',
                    'Street-Smart',
                    'Trade School',
                    'College',
                    'Advanced Degree',
                    'Self-Taught Genius'
                  ]}
                />
                <SelectControl
                  label="Social Class"
                  value={personalitySettings.socialClass}
                  onChange={(value) => handleInputChange('socialClass', value)}
                  options={[
                    'Elite/Noble',
                    'Upper Middle',
                    'Middle',
                    'Working',
                    'Street/Exile',
                    'Criminal'
                  ]}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="culturalBackground">Cultural Background</Label>
                  <Input
                    id="culturalBackground"
                    value={personalitySettings.culturalBackground}
                    onChange={(e) => handleInputChange('culturalBackground', e.target.value)}
                    placeholder="Raised in underground tech communes"
                    className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="formativeTrauma">Formative Trauma</Label>
                  <Input
                    id="formativeTrauma"
                    value={personalitySettings.formativeTrauma}
                    onChange={(e) => handleInputChange('formativeTrauma', e.target.value)}
                    placeholder="Betrayed by mentor"
                    className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Relationships */}
            <TabsContent value="relationships" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderControl
                  label="Dominance"
                  description="Submissive ← → Alpha/Commanding"
                  value={personalitySettings.dominance}
                  onChange={(value) => handleSliderChange('dominance', value)}
                />
                <SliderControl
                  label="Social Energy"
                  description="Drains in Groups ← → Energized by People"
                  value={personalitySettings.socialEnergy}
                  onChange={(value) => handleSliderChange('socialEnergy', value)}
                />
                <SliderControl
                  label="Loyalty"
                  description="Fickle ← → Ride-or-Die"
                  value={personalitySettings.loyalty}
                  onChange={(value) => handleSliderChange('loyalty', value)}
                />
                <SliderControl
                  label="Conflict Style"
                  description="Avoidant ← → Confrontational"
                  value={personalitySettings.conflictStyle}
                  onChange={(value) => handleSliderChange('conflictStyle', value)}
                />
              </div>
            </TabsContent>

            {/* Advanced Controls */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-300">Quirks & Personality Flavoring</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="signaturePhrase">Signature Phrase</Label>
                    <Input
                      id="signaturePhrase"
                      value={personalitySettings.signaturePhrase}
                      onChange={(e) => handleInputChange('signaturePhrase', e.target.value)}
                      placeholder="As the old saying goes..."
                      className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="speakingTic">Speaking Tic</Label>
                    <Input
                      id="speakingTic"
                      value={personalitySettings.speakingTic}
                      onChange={(e) => handleInputChange('speakingTic', e.target.value)}
                      placeholder="Always taps fingers when thinking"
                      className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <CheckboxControl
                    label="Speaks in questions"
                    checked={personalitySettings.speaksInQuestions}
                    onChange={(checked) => handleCheckboxChange('speaksInQuestions', checked)}
                  />
                  <CheckboxControl
                    label="Never uses contractions"
                    checked={personalitySettings.neverUsesContractions}
                    onChange={(checked) => handleCheckboxChange('neverUsesContractions', checked)}
                  />
                  <CheckboxControl
                    label="Always gives advice"
                    checked={personalitySettings.alwaysGivesAdvice}
                    onChange={(checked) => handleCheckboxChange('alwaysGivesAdvice', checked)}
                  />
                  <CheckboxControl
                    label="Avoids naming people"
                    checked={personalitySettings.avoidsNamingPeople}
                    onChange={(checked) => handleCheckboxChange('avoidsNamingPeople', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-300">Output Controls</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SliderControl
                    label="Response Length Preference"
                    description="Concise ← → Elaborate"
                    value={personalitySettings.responseLengthPreference}
                    onChange={(value) => handleSliderChange('responseLengthPreference', value)}
                  />
                  <SliderControl
                    label="Emotion Intensity"
                    description="Subdued ← → Dramatic"
                    value={personalitySettings.emotionIntensity}
                    onChange={(value) => handleSliderChange('emotionIntensity', value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper components
function SliderControl({ 
  label, 
  description, 
  value, 
  onChange 
}: { 
  label: string
  description: string
  value: number
  onChange: (value: number[]) => void 
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-xs text-muted-foreground">0</span>
        <Slider
          value={[value]}
          onValueChange={onChange}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground">100</span>
        <span className="text-sm font-medium w-8 text-right">{value}</span>
      </div>
    </div>
  )
}

function SelectControl({ 
  label, 
  value, 
  onChange, 
  options 
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-background/50 border-purple-500/30 focus-visible:ring-purple-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function CheckboxControl({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={label}
        checked={checked}
        onCheckedChange={onChange}
        className="border-purple-500/30"
      />
      <Label htmlFor={label} className="text-sm">
        {label}
      </Label>
    </div>
  )
} 