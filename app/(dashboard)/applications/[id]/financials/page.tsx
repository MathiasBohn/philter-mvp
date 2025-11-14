"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FinancialTable } from "@/components/features/application/financial-table"
import { TotalsBar } from "@/components/features/application/totals-bar"
import { FormActions } from "@/components/forms/form-actions"
import {
  FinancialEntryType,
  AssetCategory,
  LiabilityCategory,
  IncomeCategory,
  ExpenseCategory,
  type FinancialEntry,
} from "@/lib/types"

const ASSET_CATEGORIES = [
  { value: AssetCategory.CHECKING, label: "Checking Account" },
  { value: AssetCategory.SAVINGS, label: "Savings Account" },
  { value: AssetCategory.INVESTMENT, label: "Investment Account" },
  { value: AssetCategory.REAL_ESTATE, label: "Real Estate" },
  { value: AssetCategory.OTHER, label: "Other Asset" },
]

const LIABILITY_CATEGORIES = [
  { value: LiabilityCategory.MORTGAGE, label: "Mortgage" },
  { value: LiabilityCategory.AUTO_LOAN, label: "Auto Loan" },
  { value: LiabilityCategory.CREDIT_CARD, label: "Credit Card" },
  { value: LiabilityCategory.STUDENT_LOAN, label: "Student Loan" },
  { value: LiabilityCategory.OTHER, label: "Other Liability" },
]

const INCOME_CATEGORIES = [
  { value: IncomeCategory.EMPLOYMENT, label: "Employment Income" },
  { value: IncomeCategory.RENTAL, label: "Rental Income" },
  { value: IncomeCategory.INVESTMENT, label: "Investment Income" },
  { value: IncomeCategory.OTHER, label: "Other Income" },
]

const EXPENSE_CATEGORIES = [
  { value: ExpenseCategory.RENT_MORTGAGE, label: "Rent/Mortgage" },
  { value: ExpenseCategory.UTILITIES, label: "Utilities" },
  { value: ExpenseCategory.INSURANCE, label: "Insurance" },
  { value: ExpenseCategory.OTHER, label: "Other Expense" },
]

export default function FinancialsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [entries, setEntries] = useState<FinancialEntry[]>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`financials-data-${params.id}`)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.entries) {
          return data.entries
        }
      }
    }
    return []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<FinancialEntryType>(
    FinancialEntryType.ASSET
  )

  const addEntry = (entryType: FinancialEntryType) => {
    // Get default category for the entry type
    let defaultCategory: string
    switch (entryType) {
      case FinancialEntryType.ASSET:
        defaultCategory = AssetCategory.CHECKING
        break
      case FinancialEntryType.LIABILITY:
        defaultCategory = LiabilityCategory.CREDIT_CARD
        break
      case FinancialEntryType.MONTHLY_INCOME:
        defaultCategory = IncomeCategory.EMPLOYMENT
        break
      case FinancialEntryType.MONTHLY_EXPENSE:
        defaultCategory = ExpenseCategory.OTHER
        break
      default:
        defaultCategory = ""
    }

    const newEntry: FinancialEntry = {
      id: Math.random().toString(36).substring(7),
      entryType,
      category: defaultCategory as AssetCategory | LiabilityCategory | IncomeCategory | ExpenseCategory,
      amount: 0,
    }
    setEntries([...entries, newEntry])
  }

  const updateEntry = (id: string, updated: FinancialEntry) => {
    setEntries(entries.map((e) => (e.id === id ? updated : e)))
  }

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Save to localStorage
    const data = {
      entries,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(`financials-data-${params.id}`, JSON.stringify(data))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSaving(false)
  }

  const handleContinue = async () => {
    await handleSave()
    router.push(`/applications/${params.id}/documents`)
  }

  // Calculate totals
  const assets = entries
    .filter((e) => e.entryType === FinancialEntryType.ASSET)
    .reduce((sum, e) => sum + e.amount, 0)

  const liabilities = entries
    .filter((e) => e.entryType === FinancialEntryType.LIABILITY)
    .reduce((sum, e) => sum + e.amount, 0)

  const monthlyIncome = entries
    .filter((e) => e.entryType === FinancialEntryType.MONTHLY_INCOME)
    .reduce((sum, e) => sum + e.amount, 0)

  const monthlyExpenses = entries
    .filter((e) => e.entryType === FinancialEntryType.MONTHLY_EXPENSE)
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Summary</h1>
        <p className="mt-2 text-muted-foreground">
          Provide a comprehensive overview of your financial situation. This information
          follows the REBNY format.
        </p>
      </div>

      <Separator />

      <TotalsBar
        assets={assets}
        liabilities={liabilities}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
      />

      <Separator />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FinancialEntryType)}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value={FinancialEntryType.ASSET}>Assets</TabsTrigger>
          <TabsTrigger value={FinancialEntryType.LIABILITY}>Liabilities</TabsTrigger>
          <TabsTrigger value={FinancialEntryType.MONTHLY_INCOME}>
            Monthly Income
          </TabsTrigger>
          <TabsTrigger value={FinancialEntryType.MONTHLY_EXPENSE}>
            Monthly Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value={FinancialEntryType.ASSET} className="mt-6">
          <FinancialTable
            entries={entries}
            onAdd={() => addEntry(FinancialEntryType.ASSET)}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
            entryType={FinancialEntryType.ASSET}
            categories={ASSET_CATEGORIES}
          />
        </TabsContent>

        <TabsContent value={FinancialEntryType.LIABILITY} className="mt-6">
          <FinancialTable
            entries={entries}
            onAdd={() => addEntry(FinancialEntryType.LIABILITY)}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
            entryType={FinancialEntryType.LIABILITY}
            categories={LIABILITY_CATEGORIES}
          />
        </TabsContent>

        <TabsContent value={FinancialEntryType.MONTHLY_INCOME} className="mt-6">
          <FinancialTable
            entries={entries}
            onAdd={() => addEntry(FinancialEntryType.MONTHLY_INCOME)}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
            entryType={FinancialEntryType.MONTHLY_INCOME}
            categories={INCOME_CATEGORIES}
          />
        </TabsContent>

        <TabsContent value={FinancialEntryType.MONTHLY_EXPENSE} className="mt-6">
          <FinancialTable
            entries={entries}
            onAdd={() => addEntry(FinancialEntryType.MONTHLY_EXPENSE)}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
            entryType={FinancialEntryType.MONTHLY_EXPENSE}
            categories={EXPENSE_CATEGORIES}
          />
        </TabsContent>
      </Tabs>

      <Separator />

      <FormActions
        onSave={handleSave}
        onCancel={() => router.push(`/applications/${params.id}`)}
        onContinue={handleContinue}
        isSaving={isSaving}
        continueText="Save & Continue"
      />
    </div>
  )
}
