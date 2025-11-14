"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BuildingCodeInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  id?: string
}

export function BuildingCodeInput({
  value,
  onChange,
  error,
  id = "building-code",
}: BuildingCodeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only alphanumeric characters, convert to uppercase
    const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    onChange(formatted)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        Building Code <span className="text-destructive">*</span>
      </Label>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        placeholder="Enter 6-character code"
        maxLength={6}
        className={error ? "border-destructive" : ""}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        This code was provided by your broker or building management.
      </p>
    </div>
  )
}
