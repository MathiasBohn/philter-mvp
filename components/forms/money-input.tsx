"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value?: string | number
  onChange?: (value: string) => void
  /** Label text used to generate accessible aria-label (e.g., "Monthly Rent" becomes "Monthly Rent in US dollars") */
  label?: string
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value = "", onChange, label, ...props }, ref) => {
    const formatCurrency = (val: string) => {
      // Remove non-digits and non-decimals
      let digits = val.replace(/[^\d.]/g, "")

      // Ensure only one decimal point
      const parts = digits.split(".")
      if (parts.length > 2) {
        digits = parts[0] + "." + parts.slice(1).join("")
      }

      // Limit to 2 decimal places
      if (parts.length === 2 && parts[1].length > 2) {
        digits = parts[0] + "." + parts[1].slice(0, 2)
      }

      return digits
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCurrency(e.target.value)
      onChange?.(formatted)
    }

    // Ensure value is properly converted to string for display
    // Handle both string and number inputs, and remove any existing $ or commas
    const numericValue = typeof value === 'number'
      ? value.toString()
      : String(value || '').replace(/[^\d.]/g, '')

    const displayValue = numericValue ? `$${numericValue}` : ""

    // Generate accessible aria-label with currency context
    const ariaLabel = props['aria-label'] || (label ? `${label} in US dollars` : 'Amount in US dollars')

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="$0.00"
        inputMode="decimal"
        aria-label={ariaLabel}
        {...props}
      />
    )
  }
)

MoneyInput.displayName = "MoneyInput"
