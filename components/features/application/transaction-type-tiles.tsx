"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Home, Building2, Key, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TransactionType } from "@/lib/types"

interface TransactionTypeTilesProps {
  value: TransactionType | null
  onChange: (value: TransactionType) => void
  error?: string
}

const transactionTypes = [
  {
    value: "COOP_PURCHASE" as TransactionType,
    label: "Co-op Purchase",
    description: "Buying shares in a cooperative building",
    icon: Home,
  },
  {
    value: "CONDO_PURCHASE" as TransactionType,
    label: "Condo Purchase",
    description: "Buying a condominium unit",
    icon: Building2,
  },
  {
    value: "COOP_SUBLET" as TransactionType,
    label: "Co-op Lease",
    description: "Renting a cooperative unit",
    icon: Key,
  },
  {
    value: "CONDO_LEASE" as TransactionType,
    label: "Condo Lease",
    description: "Renting a condominium unit",
    icon: FileText,
  },
]

export function TransactionTypeTiles({
  value,
  onChange,
  error,
}: TransactionTypeTilesProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        Transaction Type <span className="text-destructive">*</span>
      </Label>

      <div className="grid gap-4 sm:grid-cols-2">
        {transactionTypes.map((type) => {
          const Icon = type.icon
          const isSelected = value === type.value

          return (
            <Card
              key={type.value}
              className={cn(
                "cursor-pointer transition-all hover:border-primary hover:shadow-md",
                isSelected && "border-primary bg-primary/5 ring-2 ring-primary",
                error && !value && "border-destructive"
              )}
              onClick={() => onChange(type.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onChange(type.value)
                }
              }}
              aria-pressed={isSelected}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div
                  className={cn(
                    "rounded-lg p-3",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold leading-none">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    ✓
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
