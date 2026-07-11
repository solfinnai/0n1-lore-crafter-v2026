export default function SoulsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-md bg-purple-500/20 animate-pulse" />
              <div className="h-8 w-48 bg-purple-500/20 rounded-md animate-pulse" />
            </div>
            <div className="w-32 h-10 bg-purple-500/20 rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Search bar skeleton */}
        <div className="mb-6 h-10 bg-purple-500/20 rounded-md animate-pulse" />

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border border-purple-500/30 bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 pb-2 space-y-2">
                <div className="h-6 w-3/4 bg-purple-500/20 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-purple-500/20 rounded animate-pulse" />
              </div>

              {/* Content */}
              <div className="px-4 pb-3 space-y-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-purple-500/20 rounded-md animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-purple-500/20 rounded animate-pulse" />
                      <div className="h-6 w-24 bg-purple-500/20 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-purple-500/20 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-purple-500/20 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-px bg-purple-500/20" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-purple-500/20 rounded animate-pulse" />
                    <div className="h-4 w-full bg-purple-500/20 rounded animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-12 bg-purple-500/20 rounded animate-pulse" />
                    <div className="h-4 w-full bg-purple-500/20 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 pt-2 border-t border-purple-500/20 bg-black/40 space-y-2">
                <div className="flex justify-between">
                  <div className="h-8 w-16 bg-purple-500/20 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-purple-500/20 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-purple-500/20 rounded animate-pulse" />
                </div>
                <div className="h-10 w-full bg-purple-500/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
