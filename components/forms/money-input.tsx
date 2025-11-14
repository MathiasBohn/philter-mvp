"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value?: string | number
  onChange?: (value: string) => void
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value = "", onChange, ...props }, ref) => {
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

    const displayValue = value ? `$${value}` : ""

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="$0.00"
        inputMode="decimal"
        {...props}
      />
    )
  }
)

MoneyInput.displayName = "MoneyInput"
