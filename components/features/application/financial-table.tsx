"use client"

import { useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FinancialEntryRow } from "./financial-entry-row"
import { FinancialEntryType, AssetCategory, type FinancialEntry } from "@/lib/types"

interface FinancialTableProps {
  entries: FinancialEntry[]
  onAdd: () => void
  onUpdate: (id: string, entry: FinancialEntry) => void
  onDelete: (id: string) => void
  entryType: FinancialEntryType
  categories: Array<{ value: string; label: string }>
}

// Helper function to determine if a category requires an institution field
function categoryRequiresInstitution(category: string): boolean {
  // Categories that DON'T need institution
  const noInstitutionCategories = [
    AssetCategory.AUTOMOBILES,
    AssetCategory.PERSONAL_PROPERTY,
    AssetCategory.REAL_ESTATE, // In case there are old entries
    AssetCategory.ACCOUNTS_RECEIVABLE,
    AssetCategory.CONTRACT_DEPOSIT,
  ];

  return !noInstitutionCategories.includes(category as AssetCategory);
}

export function FinancialTable({
  entries,
  onAdd,
  onUpdate,
  onDelete,
  entryType,
  categories,
}: FinancialTableProps) {
  // Memoize filtered entries to avoid recalculating on every render
  const filteredEntries = useMemo(
    () => entries.filter((e) => e.entryType === entryType),
    [entries, entryType]
  )

  // Determine if we should show the institution column for this entry type
  // Only show for Assets where some categories need it
  const showInstitutionColumn = entryType === FinancialEntryType.ASSET

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </th>
              {showInstitutionColumn && (
                <th className="p-3 text-left text-sm font-medium">Institution</th>
              )}
              <th className="p-3 text-left text-sm font-medium">Description</th>
              <th className="p-3 text-left text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </th>
              <th className="w-16 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={showInstitutionColumn ? 5 : 4} className="p-8 text-center text-muted-foreground">
                  No entries yet. Click &quot;Add Entry&quot; to get started.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <FinancialEntryRow
                  key={entry.id}
                  entry={entry}
                  onUpdate={(updated) => onUpdate(entry.id, updated)}
                  onDelete={() => onDelete(entry.id)}
                  categories={categories}
                  showInstitutionColumn={showInstitutionColumn}
                  institutionRequired={categoryRequiresInstitution(entry.category)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t p-4">
        <Button type="button" onClick={onAdd} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>
    </Card>
  )
}
