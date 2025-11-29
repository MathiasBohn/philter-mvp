"use client"

import React, { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface RepeatableGroupProps {
  children: ReactNode
  onAdd: () => void
  onRemove?: () => void
  addLabel?: string
  showRemove?: boolean
  removeLabel?: string
  index?: number
  title?: string
  /** Custom message to show when there are no items */
  emptyMessage?: string
}

export function RepeatableGroup({
  children,
  onAdd,
  onRemove,
  addLabel = "Add Another",
  showRemove = false,
  removeLabel = "Remove",
  title,
  emptyMessage,
}: RepeatableGroupProps) {
  // Check if there are any children to display
  const hasChildren = React.Children.count(children) > 0

  // Generate default empty message based on title
  const defaultEmptyMessage = title
    ? `No ${title.toLowerCase()} added yet. Click below to add one.`
    : "No items added yet. Click below to add one."

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {title && (
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">{title}</h3>
              {showRemove && onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="text-destructive hover:text-destructive"
                  aria-label={`${removeLabel} ${title || 'item'}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  {removeLabel}
                </Button>
              )}
            </div>
          )}

          {hasChildren ? (
            <div className="space-y-4">{children}</div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              {emptyMessage || defaultEmptyMessage}
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="w-full"
        aria-label={title ? `Add another ${title.toLowerCase()}` : addLabel}
      >
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  )
}
