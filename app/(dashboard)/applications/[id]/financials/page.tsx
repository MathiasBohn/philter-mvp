"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { FinancialTable } from "@/components/features/application/financial-table"
import { TotalsBar } from "@/components/features/application/totals-bar"
import { FormActions } from "@/components/forms/form-actions"
import { RealEstateEntry } from "@/components/features/application/real-estate-entry"
import { FormSkeleton } from "@/components/loading/form-skeleton"
import {
  FinancialEntryType,
  AssetCategory,
  LiabilityCategory,
  IncomeCategory,
  ExpenseCategory,
  PropertyType,
  type FinancialEntry,
  type RealEstateProperty,
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
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<FinancialEntry[]>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`financials-data-${id}`)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.entries) {
          // Ensure all amounts are numbers, not strings
          return data.entries.map((entry: FinancialEntry) => ({
            ...entry,
            amount: typeof entry.amount === 'number' ? entry.amount : parseFloat(String(entry.amount)) || 0
          }))
        }
      }
    }
    return []
  })
  const [realEstateProperties, setRealEstateProperties] = useState<RealEstateProperty[]>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`financials-data-${id}`)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.realEstateProperties) {
          // Ensure all numeric values are numbers, not strings
          return data.realEstateProperties.map((property: RealEstateProperty) => ({
            ...property,
            marketValue: typeof property.marketValue === 'number' ? property.marketValue : parseFloat(String(property.marketValue)) || 0,
            mortgageBalance: typeof property.mortgageBalance === 'number' ? property.mortgageBalance : parseFloat(String(property.mortgageBalance)) || 0,
            monthlyMortgagePayment: typeof property.monthlyMortgagePayment === 'number' ? property.monthlyMortgagePayment : parseFloat(String(property.monthlyMortgagePayment)) || 0,
            monthlyMaintenanceHOA: typeof property.monthlyMaintenanceHOA === 'number' ? property.monthlyMaintenanceHOA : parseFloat(String(property.monthlyMaintenanceHOA)) || 0,
            monthlyRealEstateTaxes: typeof property.monthlyRealEstateTaxes === 'number' ? property.monthlyRealEstateTaxes : parseFloat(String(property.monthlyRealEstateTaxes)) || 0,
            monthlyInsurance: typeof property.monthlyInsurance === 'number' ? property.monthlyInsurance : parseFloat(String(property.monthlyInsurance)) || 0,
          }))
        }
      }
    }
    return []
  })
  const [ownsRealEstate, setOwnsRealEstate] = useState<boolean>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`financials-data-${id}`)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.ownsRealEstate !== undefined) {
          return data.ownsRealEstate
        }
      }
    }
    return false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<FinancialEntryType>(
    FinancialEntryType.ASSET
  )

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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

  const addRealEstateProperty = () => {
    const newProperty: RealEstateProperty = {
      id: Math.random().toString(36).substring(7),
      address: { street: "", city: "", state: "", zip: "" },
      propertyType: PropertyType.SINGLE_FAMILY,
      marketValue: 0,
      mortgageBalance: 0,
      monthlyMortgagePayment: 0,
      monthlyMaintenanceHOA: 0,
      monthlyRealEstateTaxes: 0,
      monthlyInsurance: 0,
    }
    setRealEstateProperties([...realEstateProperties, newProperty])
  }

  const updateRealEstateProperty = (id: string, updated: RealEstateProperty) => {
    setRealEstateProperties(realEstateProperties.map((p) => (p.id === id ? updated : p)))
  }

  const removeRealEstateProperty = (id: string) => {
    setRealEstateProperties(realEstateProperties.filter((p) => p.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Save to localStorage
    const data = {
      entries,
      realEstateProperties,
      ownsRealEstate,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(`financials-data-${id}`, JSON.stringify(data))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSaving(false)
  }

  const handleContinue = async () => {
    await handleSave()
    router.push(`/applications/${id}/documents`)
  }

  // Calculate totals - ensure all values are numbers to prevent string concatenation
  const realEstateTotalValue = realEstateProperties.reduce(
    (sum, p) => sum + (typeof p.marketValue === 'number' ? p.marketValue : parseFloat(String(p.marketValue)) || 0),
    0
  )

  const assets = entries
    .filter((e) => e.entryType === FinancialEntryType.ASSET)
    .reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0), 0) + realEstateTotalValue

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

  return (
    <div className="space-y-6">
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

      {/* Real Estate Holdings Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Real Estate Holdings</h2>
          <p className="mt-2 text-muted-foreground">
            Do you own any real estate properties? If yes, please provide details for each property.
          </p>
        </div>

        {/* Do you own real estate toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="owns-real-estate"
            checked={ownsRealEstate}
            onChange={(e) => {
              setOwnsRealEstate(e.target.checked)
              // If unchecking, clear all properties
              if (!e.target.checked) {
                setRealEstateProperties([])
              }
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="owns-real-estate" className="text-sm font-medium cursor-pointer">
            I own real estate
          </label>
        </div>

        {/* Show property entries if owns real estate */}
        {ownsRealEstate && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Properties</h3>
              <Button type="button" onClick={addRealEstateProperty} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>

            {realEstateProperties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No properties added yet. Click "Add Property" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {realEstateProperties.map((property) => (
                  <RealEstateEntry
                    key={property.id}
                    property={property}
                    onUpdate={(updated) => updateRealEstateProperty(property.id, updated)}
                    onRemove={() => removeRealEstateProperty(property.id)}
                    showRemove={realEstateProperties.length > 0}
                  />
                ))}
              </div>
            )}

            {realEstateProperties.length > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Real Estate Value:</span>
                  <span className="text-xl font-bold">
                    ${realEstateTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
