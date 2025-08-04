export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-600 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-600 rounded animate-pulse" />
            <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4" />
            <div className="flex justify-between">
              <div className="h-6 bg-gray-600 rounded animate-pulse w-20" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-600 rounded animate-pulse w-8" />
                <div className="h-4 bg-gray-600 rounded animate-pulse w-8" />
                <div className="h-4 bg-gray-600 rounded animate-pulse w-12" />
              </div>
            </div>
            <div className="h-10 bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}