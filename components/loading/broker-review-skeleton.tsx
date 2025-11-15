import { Skeleton } from "@/components/ui/skeleton"

export function BrokerReviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>

        {/* Center Column */}
        <div className="md:col-span-2 lg:col-span-6">
          <Skeleton className="h-96 w-full rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 lg:col-span-3">
          <Skeleton className="h-96 w-full rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
        </div>
      </div>
    </div>
  )
}
