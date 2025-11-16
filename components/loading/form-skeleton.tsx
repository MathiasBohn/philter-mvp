import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FormSkeletonProps {
  /**
   * Number of form sections to display
   */
  sections?: number
  /**
   * Number of fields per section
   */
  fieldsPerSection?: number
  /**
   * Whether to show action buttons at the bottom
   */
  showActions?: boolean
}

export function FormSkeleton({
  sections = 2,
  fieldsPerSection = 4,
  showActions = true,
}: FormSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Form Sections */}
      {Array.from({ length: sections }).map((_, sectionIdx) => (
        <Card key={sectionIdx} className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: fieldsPerSection }).map((_, fieldIdx) => (
              <div key={fieldIdx} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-10 w-24" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact form skeleton for smaller forms
 */
export function CompactFormSkeleton() {
  return <FormSkeleton sections={1} fieldsPerSection={3} />
}

/**
 * Large form skeleton for complex forms with many sections
 */
export function LargeFormSkeleton() {
  return <FormSkeleton sections={4} fieldsPerSection={6} />
}
