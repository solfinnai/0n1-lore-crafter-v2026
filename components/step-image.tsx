import Image from "next/image"

interface StepImageProps {
  step: string
  className?: string
}

export function StepImage({ step, className = "" }: StepImageProps) {
  // Map step names to appropriate images
  const getImageForStep = (stepName: string): string => {
    switch (stepName) {
      case "pfpInput":
        return "/images/steps/pfp-input.jpg"
      case "archetype":
        return "/images/steps/archetype.jpg"
      case "background":
        return "/images/steps/background.jpg"
      case "hopes":
        return "/images/steps/hopes.jpg"
      case "fears":
        return "/images/steps/fears.jpg"
      case "personalityProfile":
        return "/images/steps/personality.jpg"
      case "motivations":
        return "/images/steps/motivations.jpg"
      case "relationships":
        return "/images/steps/relationships.jpg"
      case "worldPosition":
        return "/images/steps/world-position.jpg"
      case "voice":
        return "/images/steps/voice.jpg"
      case "symbolism":
        return "/images/steps/symbolism.jpg"
      case "powersAbilities":
        return "/images/steps/powers.jpg"
      case "finalLore":
        return "/images/steps/final-lore.jpg"
      default:
        return "/images/steps/default.jpg"
    }
  }

  // For now, use placeholder images with the step name
  // You can replace these with actual images later
  const placeholderUrl = `https://placehold.co/1600x900/3a1c71/ffffff?text=${step.replace(/([A-Z])/g, " $1").trim()}`

  // Use the actual image if available, otherwise use placeholder
  const imageUrl = getImageForStep(step) || placeholderUrl

  return (
    <div className={`w-full relative rounded-lg overflow-hidden mb-6 ${className}`}>
      <div className="aspect-video w-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 relative">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={`${step} illustration`}
          fill
          className="object-cover mix-blend-overlay opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
    </div>
  )
}
