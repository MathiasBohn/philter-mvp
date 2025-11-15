export default function ApplicationLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="flex items-center justify-between">
          <div className="h-9 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="mt-2 h-5 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Progress Bar Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-2 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Sections Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
