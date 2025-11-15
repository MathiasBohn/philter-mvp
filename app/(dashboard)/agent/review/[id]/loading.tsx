export default function AdminReviewLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header Skeleton */}
      <div className="border-b dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-5 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>

      {/* Three Column Layout Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column */}
        <div className="w-1/4 min-w-[250px] max-w-[350px] border-r dark:border-gray-800 p-4">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        </div>

        {/* Center Column */}
        <div className="flex-1 border-r dark:border-gray-800 p-6">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/4 min-w-[300px] max-w-[400px] p-4">
          <div className="h-full w-full animate-pulse rounded border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
        </div>
      </div>
    </div>
  )
}
