'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { FinancialEntryInput, FinancialEntryRecord } from '@/lib/api/financials'
import { toast } from '@/lib/hooks/use-toast'

/**
 * React Query hooks for financial entries management
 *
 * These hooks provide a consistent interface for fetching and mutating
 * financial data (assets, liabilities, income, expenses), with automatic
 * caching and optimistic updates.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Financial summary type
 */
export type FinancialSummary = {
  totalAssets: number
  totalLiabilities: number
  totalIncome: number
  totalExpenses: number
  netWorth: number
  liquidAssets: number
}

/**
 * Fetch all financial entries for an application
 *
 * @param applicationId - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with financial entries array
 */
export function useFinancialEntries(
  applicationId: string,
  enabled: boolean = true
): UseQueryResult<FinancialEntryRecord[], Error> {
  return useQuery({
    queryKey: queryKeys.financials.byApplication(applicationId),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/financials`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch financial entries')
      }
      return response.json()
    },
    enabled: enabled && !!applicationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Fetch financial summary for an application
 *
 * @param applicationId - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with financial summary
 */
export function useFinancialSummary(
  applicationId: string,
  enabled: boolean = true
): UseQueryResult<{ entries: FinancialEntryRecord[]; summary: FinancialSummary }, Error> {
  return useQuery({
    queryKey: [...queryKeys.financials.byApplication(applicationId), 'summary'] as const,
    queryFn: async () => {
      const response = await fetch(
        `/api/applications/${applicationId}/financials?includeSummary=true`,
        {
          credentials: 'include',
        }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch financial summary')
      }
      return response.json()
    },
    enabled: enabled && !!applicationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

/**
 * Create or update a financial entry
 *
 * @param applicationId - Application ID
 * @returns Mutation result with created/updated financial entry
 */
export function useUpsertFinancialEntry(
  applicationId: string
): UseMutationResult<FinancialEntryRecord, Error, FinancialEntryInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: FinancialEntryInput) => {
      const response = await fetch(`/api/applications/${applicationId}/financials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save financial entry')
      }

      return response.json()
    },
    onSuccess: (updatedEntry) => {
      // Update financial entries list
      queryClient.setQueryData<FinancialEntryRecord[]>(
        queryKeys.financials.byApplication(applicationId),
        (old) => {
          if (!old) return [updatedEntry]
          const index = old.findIndex(e => e.id === updatedEntry.id)
          if (index >= 0) {
            // Update existing
            const newData = [...old]
            newData[index] = updatedEntry
            return newData
          } else {
            // Add new
            return [...old, updatedEntry]
          }
        }
      )

      // Invalidate application query to update completion percentage
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      // Invalidate summary query
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.financials.byApplication(applicationId), 'summary']
      })

      toast.success('Financial information saved successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save financial information')
    },
  })
}

/**
 * Batch update multiple financial entries
 *
 * @param applicationId - Application ID
 * @returns Mutation result with updated financial entries array
 */
export function useUpdateFinancialEntries(
  applicationId: string
): UseMutationResult<FinancialEntryRecord[], Error, FinancialEntryInput[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (financialEntries: FinancialEntryInput[]) => {
      const response = await fetch(`/api/applications/${applicationId}/financials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialEntries }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update financial entries')
      }

      return response.json()
    },
    onSuccess: (updatedEntries) => {
      // Replace entire financial entries list
      queryClient.setQueryData<FinancialEntryRecord[]>(
        queryKeys.financials.byApplication(applicationId),
        updatedEntries
      )

      // Invalidate application query to update completion percentage
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      // Invalidate summary query
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.financials.byApplication(applicationId), 'summary']
      })

      toast.success('All financial information saved successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save financial information')
    },
  })
}
