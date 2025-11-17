"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoneyInput } from "@/components/forms/money-input"
import { type FinancialEntry } from "@/lib/types"

interface FinancialEntryRowProps {
  entry: FinancialEntry
  onUpdate: (entry: FinancialEntry) => void
  onDelete: () => void
  categories: Array<{ value: string; label: string }>
}

export function FinancialEntryRow({
  entry,
  onUpdate,
  onDelete,
  categories,
}: FinancialEntryRowProps) {
  const handleChange = (field: keyof FinancialEntry, value: unknown) => {
    // Ensure amount values are stored as numbers, not strings
    const processedValue = field === 'amount'
      ? parseFloat(String(value)) || 0
      : value

    onUpdate({
      ...entry,
      [field]: processedValue,
    })
  }

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-3">
        <Select
          value={entry.category}
          onValueChange={(value) => handleChange("category", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        <Input
          value={entry.institution || ""}
          onChange={(e) => handleChange("institution", e.target.value)}
          placeholder="Institution (optional)"
        />
      </td>
      <td className="p-3">
        <Input
          value={entry.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Description (optional)"
        />
      </td>
      <td className="p-3">
        <MoneyInput
          value={entry.amount}
          onChange={(value) => handleChange("amount", value)}
        />
      </td>
      <td className="p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete entry</span>
        </Button>
      </td>
    </tr>
  )
}
