import { Skeleton } from "@/components/ui/skeleton"

export function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
