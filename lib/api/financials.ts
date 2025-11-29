/**
 * Financial Entries Data Access Layer
 *
 * Provides functions for managing financial entries (assets, liabilities, income, expenses).
 * All functions use Supabase client and respect Row-Level Security policies.
 */

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'
import { isNotFoundError } from '@/lib/constants/supabase-errors'

type FinancialEntryRow = Database['public']['Tables']['financial_entries']['Row']
type FinancialEntryInsert = Database['public']['Tables']['financial_entries']['Insert']

/**
 * Helper to convert null to undefined for optional fields
 */
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value
}

/**
 * Map database record to FinancialEntryRecord type
 */
function mapToFinancialEntryRecord(data: FinancialEntryRow): FinancialEntryRecord {
  return {
    id: data.id,
    application_id: data.application_id,
    entry_type: data.entry_type as FinancialEntryType,
    category: data.category,
    amount: data.amount,
    institution: nullToUndefined(data.institution),
    account_number_last4: nullToUndefined(data.account_number_last4),
    description: nullToUndefined(data.description),
    is_liquid: nullToUndefined(data.is_liquid),
    monthly_payment: nullToUndefined(data.monthly_payment),
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Financial entry type enum (matches database)
 */
export type FinancialEntryType = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE'

/**
 * Asset category enum (matches database)
 */
export type AssetCategory =
  | 'CHECKING'
  | 'SAVINGS'
  | 'STOCKS'
  | 'BONDS'
  | 'RETIREMENT'
  | 'REAL_ESTATE'
  | 'OTHER'

/**
 * Liability category enum (matches database)
 */
export type LiabilityCategory =
  | 'MORTGAGE'
  | 'AUTO_LOAN'
  | 'STUDENT_LOAN'
  | 'CREDIT_CARD'
  | 'PERSONAL_LOAN'
  | 'OTHER'

/**
 * Income category enum (matches database)
 */
export type IncomeCategory =
  | 'SALARY'
  | 'BONUS'
  | 'INVESTMENT'
  | 'RENTAL'
  | 'BUSINESS'
  | 'OTHER'

/**
 * Expense category enum (matches database)
 */
export type ExpenseCategory =
  | 'RENT'
  | 'MORTGAGE'
  | 'UTILITIES'
  | 'INSURANCE'
  | 'CAR_PAYMENT'
  | 'STUDENT_LOAN'
  | 'CREDIT_CARD'
  | 'OTHER'

/**
 * Financial entry record from database
 */
export type FinancialEntryRecord = {
  id: string
  application_id: string
  entry_type: FinancialEntryType
  category: string // One of the category enums above, stored as text
  amount: number
  institution?: string
  account_number_last4?: string
  description?: string
  is_liquid?: boolean // For assets
  monthly_payment?: number // For liabilities/expenses
  created_at: string
  updated_at: string
}

/**
 * Input type for creating/updating financial entry
 */
export type FinancialEntryInput = {
  id?: string // Optional for create, required for update
  entryType: FinancialEntryType
  category: string
  amount: number
  institution?: string
  accountNumberLast4?: string
  description?: string
  isLiquid?: boolean
  monthlyPayment?: number
}

/**
 * Get all financial entries for an application
 */
export async function getFinancialEntries(
  applicationId: string
): Promise<FinancialEntryRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('financial_entries')
    .select('*')
    .eq('application_id', applicationId)
    .order('entry_type', { ascending: true })
    .order('amount', { ascending: false })

  if (error) {
    console.error('Error fetching financial entries:', error)
    throw new Error(`Failed to fetch financial entries: ${error.message}`)
  }

  return (data || []).map(mapToFinancialEntryRecord)
}

/**
 * Get financial entries by type
 */
export async function getFinancialEntriesByType(
  applicationId: string,
  entryType: FinancialEntryType
): Promise<FinancialEntryRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('financial_entries')
    .select('*')
    .eq('application_id', applicationId)
    .eq('entry_type', entryType)
    .order('amount', { ascending: false })

  if (error) {
    console.error('Error fetching financial entries by type:', error)
    throw new Error(`Failed to fetch financial entries by type: ${error.message}`)
  }

  return (data || []).map(mapToFinancialEntryRecord)
}

/**
 * Get a single financial entry by ID
 */
export async function getFinancialEntry(
  entryId: string
): Promise<FinancialEntryRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('financial_entries')
    .select('*')
    .eq('id', entryId)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null
    }
    console.error('Error fetching financial entry:', error)
    throw new Error(`Failed to fetch financial entry: ${error.message}`)
  }

  return mapToFinancialEntryRecord(data)
}

/**
 * Create or update a financial entry
 */
export async function upsertFinancialEntry(
  applicationId: string,
  entryData: FinancialEntryInput
): Promise<FinancialEntryRecord> {
  const supabase = await createClient()

  const entryRecord: FinancialEntryInsert = {
    application_id: applicationId,
    entry_type: entryData.entryType,
    category: entryData.category,
    amount: entryData.amount,
    institution: entryData.institution,
    account_number_last4: entryData.accountNumberLast4,
    description: entryData.description,
    is_liquid: entryData.isLiquid,
    monthly_payment: entryData.monthlyPayment,
  }

  if (entryData.id) {
    // Update existing record
    const { data, error } = await supabase
      .from('financial_entries')
      .update(entryRecord)
      .eq('id', entryData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating financial entry:', error)
      throw new Error(`Failed to update financial entry: ${error.message}`)
    }

    return mapToFinancialEntryRecord(data)
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('financial_entries')
      .insert(entryRecord)
      .select()
      .single()

    if (error) {
      console.error('Error creating financial entry:', error)
      throw new Error(`Failed to create financial entry: ${error.message}`)
    }

    return mapToFinancialEntryRecord(data)
  }
}

/**
 * Upsert multiple financial entries at once
 * Handles create/update/delete operations
 */
export async function upsertFinancialEntries(
  applicationId: string,
  entries: FinancialEntryInput[]
): Promise<FinancialEntryRecord[]> {
  const supabase = await createClient()

  // Get existing financial entries
  const { data: existing } = await supabase
    .from('financial_entries')
    .select('id')
    .eq('application_id', applicationId)

  const existingIds = new Set((existing || []).map(e => e.id))
  const providedIds = new Set(entries.map(e => e.id).filter(Boolean))

  // Delete removed entries
  const toDelete = Array.from(existingIds).filter(id => !providedIds.has(id))
  if (toDelete.length > 0) {
    await supabase
      .from('financial_entries')
      .delete()
      .in('id', toDelete)
  }

  // Upsert provided entries
  const results: FinancialEntryRecord[] = []
  for (const entry of entries) {
    const result = await upsertFinancialEntry(applicationId, entry)
    results.push(result)
  }

  return results
}

/**
 * Delete a financial entry
 */
export async function deleteFinancialEntry(entryId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('financial_entries')
    .delete()
    .eq('id', entryId)

  if (error) {
    console.error('Error deleting financial entry:', error)
    throw new Error(`Failed to delete financial entry: ${error.message}`)
  }
}

/**
 * Calculate financial summaries for an application
 */
export async function getFinancialSummary(
  applicationId: string
): Promise<{
  totalAssets: number
  totalLiabilities: number
  totalIncome: number
  totalExpenses: number
  netWorth: number
  liquidAssets: number
}> {
  const entries = await getFinancialEntries(applicationId)

  const assets = entries.filter(e => e.entry_type === 'ASSET')
  const liabilities = entries.filter(e => e.entry_type === 'LIABILITY')
  const income = entries.filter(e => e.entry_type === 'INCOME')
  const expenses = entries.filter(e => e.entry_type === 'EXPENSE')

  const totalAssets = assets.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalLiabilities = liabilities.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalIncome = income.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const liquidAssets = assets
    .filter(e => e.is_liquid)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  return {
    totalAssets,
    totalLiabilities,
    totalIncome,
    totalExpenses,
    netWorth: totalAssets - totalLiabilities,
    liquidAssets,
  }
}
