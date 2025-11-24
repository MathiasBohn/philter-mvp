"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { FinancialTable } from "@/components/features/application/financial-table"
import { TotalsBar } from "@/components/features/application/totals-bar"
import { FormActions } from "@/components/forms/form-actions"
import { FormSkeleton } from "@/components/loading/form-skeleton"
import { useApplication, useUpdateApplication } from "@/lib/hooks/use-applications"
import { useFinancialEntries, useUpdateFinancialEntries } from "@/lib/hooks/use-financials"
import { notFound } from "next/navigation"
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
  // Real Estate removed - use Real Estate Holdings section below instead
  { value: AssetCategory.CONTRACT_DEPOSIT, label: "Contract Deposit" },
  { value: AssetCategory.INVESTMENT_IN_BUSINESS, label: "Investment in Business" },
  { value: AssetCategory.ACCOUNTS_RECEIVABLE, label: "Accounts Receivable" },
  { value: AssetCategory.AUTOMOBILES, label: "Automobiles" },
  { value: AssetCategory.PERSONAL_PROPERTY, label: "Personal Property" },
  { value: AssetCategory.LIFE_INSURANCE_CASH_VALUE, label: "Life Insurance (Cash Value)" },
  { value: AssetCategory.KEOGH, label: "KEOGH" },
  { value: AssetCategory.PROFIT_SHARING_OR_PENSION, label: "Profit Sharing or Pension" },
  { value: AssetCategory.OTHER, label: "Other Asset" },
]

const LIABILITY_CATEGORIES = [
  { value: LiabilityCategory.MORTGAGE, label: "Mortgage" },
  { value: LiabilityCategory.AUTO_LOAN, label: "Auto Loan" },
  { value: LiabilityCategory.CREDIT_CARD, label: "Credit Card" },
  { value: LiabilityCategory.STUDENT_LOAN, label: "Student Loan" },
  { value: LiabilityCategory.NOTES_PAYABLE_TO_BANKS, label: "Notes Payable to Banks" },
  { value: LiabilityCategory.NOTES_TO_RELATIVES, label: "Notes to Relatives" },
  { value: LiabilityCategory.OTHER, label: "Other Liability" },
]

const INCOME_CATEGORIES = [
  { value: IncomeCategory.EMPLOYMENT, label: "Employment Income" },
  { value: IncomeCategory.OVERTIME, label: "Overtime" },
  { value: IncomeCategory.BONUSES, label: "Bonuses" },
  { value: IncomeCategory.COMMISSIONS, label: "Commissions" },
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

export default function FinancialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const { data: application, isLoading, error } = useApplication(id)
  const updateApplication = useUpdateApplication(id)
  const { data: financialEntries, isLoading: financialsLoading } = useFinancialEntries(id, !!application)
  const updateFinancials = useUpdateFinancialEntries(id)
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<FinancialEntryType>(
    FinancialEntryType.ASSET
  )

  // Load financial entries from application
  useEffect(() => {
    if (application?.financialEntries) {
      // Ensure all amounts are numbers, not strings
      const loadedEntries = application.financialEntries.map((entry: FinancialEntry) => ({
        ...entry,
        amount: typeof entry.amount === 'number' ? entry.amount : parseFloat(String(entry.amount)) || 0
      }))
      setEntries(loadedEntries)
    }
  }, [application]);

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
    if (!application) return

    setIsSaving(true)

    try {
      // Save financial entries to database via new financials API
      const financialInputs = entries.map(entry => ({
        id: entry.id,
        entryType: entry.type as any, // Map to database enum
        category: entry.category,
        amount: entry.amount,
        institution: entry.institution,
        accountNumberLast4: entry.accountNumber ? entry.accountNumber.slice(-4) : undefined,
        description: entry.description,
        isLiquid: entry.type === FinancialEntryType.ASSET ? entry.isLiquid : undefined,
        monthlyPayment: entry.type === FinancialEntryType.LIABILITY ? entry.monthlyPayment : undefined,
      }))

      await updateFinancials.mutateAsync(financialInputs)
    } catch (error) {
      console.error('Error saving financials:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContinue = async () => {
    await handleSave()
    router.push(`/applications/${id}/real-estate`)
  }

  // Calculate totals - ensure all values are numbers to prevent string concatenation
  const assets = entries
    .filter((e) => e.entryType === FinancialEntryType.ASSET)
    .reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0), 0)

  const liabilities = entries
    .filter((e) => e.entryType === FinancialEntryType.LIABILITY)
    .reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0), 0)

  const monthlyIncome = entries
    .filter((e) => e.entryType === FinancialEntryType.MONTHLY_INCOME)
    .reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0), 0)

  const monthlyExpenses = entries
    .filter((e) => e.entryType === FinancialEntryType.MONTHLY_EXPENSE)
    .reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0), 0)

  if (isLoading) {
    return <FormSkeleton sections={4} fieldsPerSection={4} />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Alert variant="destructive">
          <AlertTitle>Error loading application</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load application data"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!application) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Summary</h1>
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
        onCancel={() => router.push(`/applications/${id}`)}
        onContinue={handleContinue}
        isSaving={isSaving}
        continueText="Save & Continue"
      />
    </div>
  )
}
