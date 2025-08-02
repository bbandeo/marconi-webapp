export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-800 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-48 mx-auto animate-pulse" />
        </div>

        {/* Filters skeleton */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <div className="h-6 bg-gray-700 rounded w-48 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2 h-10 bg-gray-700 rounded animate-pulse" />
            <div className="h-10 bg-gray-700 rounded animate-pulse" />
            <div className="h-10 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Properties grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="h-48 bg-gray-700 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-700 rounded w-16 animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-700 rounded w-20 animate-pulse" />
                  <div className="h-8 bg-gray-700 rounded w-24 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
