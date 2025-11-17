"use client"

import { useState, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MaskedSSNInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value?: string
  onChange?: (value: string) => void
  error?: string
}

export const MaskedSSNInput = forwardRef<HTMLInputElement, MaskedSSNInputProps>(
  ({ value = "", onChange, error, ...props }, ref) => {
    const [showSSN, setShowSSN] = useState(false)

    const formatSSN = (val: string) => {
      // Remove non-digits
      const digits = val.replace(/\D/g, "")

      // Format as XXX-XX-XXXX
      if (digits.length <= 3) return digits
      if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatSSN(e.target.value)
      onChange?.(formatted)
    }

    const maskSSN = (ssn: string) => {
      const digits = ssn.replace(/\D/g, "")
      if (digits.length <= 5) return "•".repeat(digits.length)
      return `•••-••-${digits.slice(5, 9)}`
    }

    return (
      <div className="space-y-1">
        <div className="relative">
          <Input
            ref={ref}
            type={showSSN ? "text" : "password"}
            value={value}
            onChange={handleChange}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowSSN(!showSSN)}
            aria-label={showSSN ? "Hide SSN" : "Show SSN"}
          >
            {showSSN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

MaskedSSNInput.displayName = "MaskedSSNInput"
