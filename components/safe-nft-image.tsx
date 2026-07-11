"use client"

import { useState } from "react"
import Image from "next/image"

interface SafeNftImageProps {
  src: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  onError?: () => void
}

export function SafeNftImage({ 
  src, 
  alt, 
  fill = false, 
  width, 
  height, 
  className = "", 
  onError 
}: SafeNftImageProps) {
  const [imageError, setImageError] = useState(false)
  const [useUnoptimized, setUseUnoptimized] = useState(false)

  const imageSrc = src || "/placeholder.svg"

  // Auto-detect if we should use unoptimized for external URLs
  const shouldUseUnoptimized = useUnoptimized || 
    Boolean(src && (
      src.includes('ipfs://') ||
      src.includes('data:') ||
      src.includes('blob:') ||
      !src.startsWith('http')
    ))

  const handleError = () => {
    console.log(`Image load error for: ${imageSrc}`)
    if (!useUnoptimized) {
      // First try with unoptimized
      console.log('Retrying with unoptimized...')
      setUseUnoptimized(true)
    } else {
      // If still failing, mark as error and use placeholder
      console.log('Image failed completely, using placeholder')
      setImageError(true)
    }
    onError?.()
  }

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-purple-900/20 text-purple-300 ${className}`}>
        <span className="text-xs">No image</span>
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      unoptimized={shouldUseUnoptimized}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
} 