"use client"

import { ReactNode } from "react"
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
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      {children}

      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
