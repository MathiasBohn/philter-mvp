"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressIndicatorProps {
  value: number
  label?: string
  showPercentage?: boolean
}

export function ProgressIndicator({
  value,
  label,
  showPercentage = true,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-muted-foreground">{Math.round(value)}%</span>
          )}
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  )
}
