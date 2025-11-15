import { Skeleton } from "@/components/ui/skeleton"

export function AgentReviewSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-2 h-5 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column */}
        <div className="w-1/4 min-w-[250px] max-w-[350px] border-r dark:border-gray-800 p-4">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>

        {/* Center Column */}
        <div className="flex-1 border-r dark:border-gray-800 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/4 min-w-[300px] max-w-[400px] p-4">
          <Skeleton className="h-full w-full rounded border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
        </div>
      </div>
    </div>
  )
}
