"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Eye, Palette, Sparkles, Lock } from "lucide-react"
import { useState } from "react"
import { UnifiedCharacter } from "@/lib/types"
import { storeSoul } from "@/lib/storage-wrapper"
import { useToast } from "@/hooks/use-toast"

interface UnifiedCharacterCardProps {
  character: UnifiedCharacter
  onSelectNft: (tokenId: string) => void
  onShowTraits: (tokenId: string, imageUrl: string | null, collection: string) => void
  onEditProfile: (tokenId: string) => void
  selectedNftId?: string | null
  isLoading?: boolean
}

export function UnifiedCharacterCard({ 
  character, 
  onSelectNft, 
  onShowTraits, 
  onEditProfile, 
  selectedNftId, 
  isLoading: externalLoading 
}: UnifiedCharacterCardProps) {
  const [isViewingFrame, setIsViewingFrame] = useState(false)
  const { toast } = useToast()

  // Determine which image to show based on toggle state and availability
  const getDisplayImage = () => {
    const result = isViewingFrame && character.hasFrame && character.frameImageUrl 
      ? character.frameImageUrl 
      : character.forceImageUrl
    return result
  }

  // Determine if Frame toggle should be enabled
  const canToggleFrame = character.hasForce && character.hasFrame && 
                        character.forceImageUrl && character.frameImageUrl

  const handleFrameToggle = (checked: boolean) => {
    if (canToggleFrame) {
      setIsViewingFrame(checked)
    }
  }

  const handleCreateSoul = async () => {
    try {
      const currentImageUrl = getDisplayImage()
      if (!currentImageUrl) {
        toast({
          title: "Error",
          description: "No image available for this character",
          variant: "destructive"
        })
        return
      }

      // Create a basic soul with the current image
      const soulData = {
        data: {
          pfpId: character.tokenId,
          imageUrl: currentImageUrl,
          soulName: character.displayName,
          collection: isViewingFrame ? 'frame' : 'force',
          traits: [],
          archetype: '',
          background: '',
          hopesFears: { hopes: '', fears: '' },
          personalityProfile: { description: '' },
          motivations: { drives: '', goals: '', values: '' },
          relationships: { friends: '', rivals: '', family: '' },
          worldPosition: { societalRole: '', classStatus: '', perception: '' },
          voice: { speechStyle: '', innerDialogue: '', uniquePhrases: '' },
          symbolism: { colors: '', items: '', motifs: '' },
          powersAbilities: { powers: [], description: '' }
        }
      }

      storeSoul(soulData.data)
      
      toast({
        title: "Soul Created!",
        description: `Created soul for ${character.displayName}`,
      })
      
      // Call the parent's onSelectNft to proceed with soul creation
      onSelectNft(character.tokenId)
    } catch (error) {
      console.error('Error creating soul:', error)
      toast({
        title: "Error",
        description: "Failed to create soul",
        variant: "destructive"
      })
    }
  }

  const handleTraitsClick = () => {
    const currentImageUrl = getDisplayImage()
    const currentCollection = isViewingFrame && character.hasFrame ? 'frame' : 'force'
    onShowTraits(character.tokenId, currentImageUrl, currentCollection)
  }

  const handleMainAction = () => {
    if ((character as any).hasSoul) {
      onEditProfile(character.tokenId)
    } else {
      handleCreateSoul()
    }
  }

  return (
    <Card className="group relative overflow-hidden border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-purple-500 transition-all duration-300">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img
            key={`${character.tokenId}-${isViewingFrame ? 'frame' : 'force'}`}
            src={getDisplayImage() || "/placeholder-nft.png"}
            alt={character.displayName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder-nft.png"
            }}
          />
          
          {/* Collection Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {character.hasForce && (
              <Badge 
                variant="secondary" 
                className={`text-xs font-bold ${!isViewingFrame ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'}`}
              >
                Force
              </Badge>
            )}
            {character.hasFrame && (
              <Badge 
                variant="secondary" 
                className={`text-xs font-bold ${isViewingFrame ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'}`}
              >
                Frame
              </Badge>
            )}

          </div>

          {/* Soul Indicator - Check if character has soul property */}
          {(character as any).hasSoul && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Soul
              </Badge>
            </div>
          )}

          {/* Loading Indicator */}
          {externalLoading && selectedNftId === character.tokenId && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="text-center">
            <h3 className="font-bold text-lg text-white mb-1">
              {character.displayName}
            </h3>
            <p className="text-sm text-gray-400">
              {isViewingFrame && character.hasFrame ? 'Viewing Frame' : 'Viewing Force'}
            </p>
          </div>

          {/* Frame Toggle - Only show if user owns both Force and Frame */}
          {canToggleFrame && (
            <div className="flex items-center justify-center space-x-2 py-2">
              <Label htmlFor={`frame-toggle-${character.tokenId}`} className="text-sm text-gray-300">
                Force
              </Label>
              <Switch
                id={`frame-toggle-${character.tokenId}`}
                checked={isViewingFrame}
                onCheckedChange={handleFrameToggle}
                className="data-[state=checked]:bg-yellow-600"
              />
              <Label htmlFor={`frame-toggle-${character.tokenId}`} className="text-sm text-gray-300">
                Frame
              </Label>
            </div>
          )}

          {/* Frame Not Available Message */}
          {!canToggleFrame && character.hasForce && !character.hasFrame && (
            <div className="flex items-center justify-center space-x-2 py-2 text-gray-500">
              <Lock className="w-4 h-4" />
              <span className="text-xs">Frame NFT not owned</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleTraitsClick}
              variant="outline"
              size="sm"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Eye className="w-4 h-4 mr-1" />
              Traits
            </Button>
            
            <Button
              onClick={handleMainAction}
              size="sm"
              disabled={externalLoading && selectedNftId === character.tokenId}
              className={`w-full ${
                (character as any).hasSoul 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Palette className="w-4 h-4 mr-1" />
              {(character as any).hasSoul ? 'Edit Soul' : 'Create Soul'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 