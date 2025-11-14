"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value?: Date | string
  onChange?: (value: Date) => void
  error?: string
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, error, ...props }, ref) => {
    // Convert Date to string for input
    const stringValue = value instanceof Date
      ? value.toISOString().split('T')[0]
      : value || "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value && onChange) {
        onChange(new Date(e.target.value))
      }
    }

    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          type="date"
          value={stringValue}
          onChange={handleChange}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

DateInput.displayName = "DateInput"
