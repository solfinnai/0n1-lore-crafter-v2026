import { CollectionKey, COLLECTIONS } from '@/lib/collection-config'

interface CollectionBadgeProps {
  collection: CollectionKey
  className?: string
}

export function CollectionBadge({ collection, className = "" }: CollectionBadgeProps) {
  const config = COLLECTIONS[collection]
  
  const badgeStyles = {
    purple: "bg-purple-600 text-white border-purple-500 hover:bg-purple-700",
    blue: "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
  }

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
        border transition-colors duration-200
        ${badgeStyles[config.badgeColor]}
        ${className}
      `}
      title={`${config.displayName} Collection`}
    >
      {config.displayName.split(' ')[1]} {/* Shows "Force" or "Frame" */}
    </span>
  )
}

interface MultipleBadgesProps {
  collections: CollectionKey[]
  className?: string
}

export function MultipleBadges({ collections, className = "" }: MultipleBadgesProps) {
  if (collections.length === 0) return null

  return (
    <div className={`flex gap-1 ${className}`}>
      {collections.map((collection) => (
        <CollectionBadge key={collection} collection={collection} />
      ))}
    </div>
  )
} 