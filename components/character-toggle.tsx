import { CollectionKey } from '@/lib/collection-config'

interface CharacterToggleProps {
  currentView: CollectionKey
  onToggle: (view: CollectionKey) => void
  disabled?: boolean
  className?: string
}

export function CharacterToggle({ 
  currentView, 
  onToggle, 
  disabled = false, 
  className = "" 
}: CharacterToggleProps) {
  const handleToggle = () => {
    if (disabled) return
    const newView = currentView === 'force' ? 'frame' : 'force'
    onToggle(newView)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center
        px-4 py-2 rounded-lg border-2 border-gray-600
        bg-gray-800 hover:bg-gray-700
        text-sm font-medium text-gray-200 hover:text-white
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={`Switch to ${currentView === 'force' ? 'Frame' : 'Force'} view`}
      aria-label={`Currently viewing ${currentView}, click to switch to ${currentView === 'force' ? 'Frame' : 'Force'}`}
    >
      <div className="flex items-center space-x-2">
        {/* Force indicator */}
        <div className={`
          w-3 h-3 rounded-full transition-all duration-300
          ${currentView === 'force' 
            ? 'bg-purple-500 ring-2 ring-purple-300' 
            : 'bg-gray-500 group-hover:bg-purple-400'
          }
        `} />
        
        {/* Toggle arrow */}
        <div className="flex items-center">
          <svg 
            className={`
              w-4 h-4 transition-transform duration-300
              ${currentView === 'force' ? 'rotate-0' : 'rotate-180'}
            `}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
            />
          </svg>
        </div>
        
        {/* Frame indicator */}
        <div className={`
          w-3 h-3 rounded-full transition-all duration-300
          ${currentView === 'frame' 
            ? 'bg-blue-500 ring-2 ring-blue-300' 
            : 'bg-gray-500 group-hover:bg-blue-400'
          }
        `} />
      </div>
      
      {/* Current view label */}
      <div className="ml-3 text-xs opacity-75">
        {currentView === 'force' ? 'Force' : 'Frame'}
      </div>
    </button>
  )
} 