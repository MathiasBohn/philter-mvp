"use client"

import { ReactNode } from "react"
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
}

export function RepeatableGroup({
  children,
  onAdd,
  onRemove,
  addLabel = "Add Another",
  showRemove = false,
  removeLabel = "Remove",
  index,
  title,
}: RepeatableGroupProps) {
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
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {removeLabel}
                </Button>
              )}
            </div>
          )}

          <div className="space-y-4">{children}</div>
        </CardContent>
      </Card>

      <Button type="button" variant="outline" onClick={onAdd} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  )
}
