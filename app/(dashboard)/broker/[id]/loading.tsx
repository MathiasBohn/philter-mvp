export default function BrokerLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-5 w-96 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Three Column Layout Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>

        {/* Center Column */}
        <div className="md:col-span-2 lg:col-span-6">
          <div className="h-96 w-full animate-pulse rounded-lg border bg-gray-50" />
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="h-96 w-full animate-pulse rounded-lg border bg-gray-50" />
        </div>
      </div>
    </div>
  )
}
