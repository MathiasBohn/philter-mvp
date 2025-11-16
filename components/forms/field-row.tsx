"use client"

import { ReactNode, cloneElement, isValidElement } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FieldRowProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  helpText?: string
  children: ReactNode
  className?: string
}

export function FieldRow({
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  children,
  className,
}: FieldRowProps) {
  const helpTextId = helpText ? `${htmlFor}-help` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined

  // Build aria-describedby
  const ariaDescribedBy = [helpTextId, errorId].filter(Boolean).join(" ") || undefined

  // Clone children to add aria attributes
  const enhancedChildren = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: htmlFor,
        "aria-required": required || undefined,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": ariaDescribedBy,
      })
    : children

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-1">
        {label}
        {required && (
          <span className="text-destructive" aria-label="required">
            *
          </span>
        )}
      </Label>

      {enhancedChildren}

      {helpText && !error && (
        <p id={helpTextId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
