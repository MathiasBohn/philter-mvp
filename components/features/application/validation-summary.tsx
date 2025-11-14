"use client"

import Link from "next/link"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ValidationItem {
  section: string
  requirement: string
  status: "complete" | "incomplete" | "warning"
  link?: string
  message?: string
}

interface ValidationSummaryProps {
  items: ValidationItem[]
}

export function ValidationSummary({ items }: ValidationSummaryProps) {
  const completeCount = items.filter((i) => i.status === "complete").length
  const totalCount = items.length
  const allComplete = completeCount === totalCount

  const getIcon = (status: ValidationItem["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "incomplete":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: ValidationItem["status"]) => {
    switch (status) {
      case "complete":
        return (
          <Badge variant="outline" className="border-green-600 text-green-600">
            Complete
          </Badge>
        )
      case "incomplete":
        return (
          <Badge variant="outline" className="border-destructive text-destructive">
            Required
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
            Warning
          </Badge>
        )
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Application Completeness</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {completeCount} of {totalCount} requirements met
            </p>
          </div>
          {allComplete ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Ready to Submit</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              <span className="font-semibold">
                {totalCount - completeCount} items remaining
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all",
                allComplete ? "bg-green-600" : "bg-primary"
              )}
              style={{ width: `${(completeCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="divide-y">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "p-4 transition-colors",
              item.link && "hover:bg-muted/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(item.status)}</div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.section}
                    </p>
                    {item.link ? (
                      <Link
                        href={item.link}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.requirement}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">{item.requirement}</p>
                    )}
                    {item.message && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.message}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
