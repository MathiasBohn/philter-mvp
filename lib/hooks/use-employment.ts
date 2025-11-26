'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { EmploymentInput, EmploymentRecord } from '@/lib/api/employment'
import { toast } from '@/lib/hooks/use-toast'

/**
 * React Query hooks for employment records management
 *
 * These hooks provide a consistent interface for fetching and mutating
 * employment data, with automatic caching and optimistic updates.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch all employment records for an application
 *
 * @param applicationId - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with employment records array
 */
export function useEmploymentRecords(
  applicationId: string,
  enabled: boolean = true
): UseQueryResult<EmploymentRecord[], Error> {
  return useQuery({
    queryKey: queryKeys.employment.byApplication(applicationId),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/employment`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch employment records')
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
 * Create or update an employment record
 *
 * @param applicationId - Application ID
 * @returns Mutation result with created/updated employment record
 */
export function useUpsertEmploymentRecord(
  applicationId: string
): UseMutationResult<EmploymentRecord, Error, EmploymentInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EmploymentInput) => {
      const response = await fetch(`/api/applications/${applicationId}/employment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save employment record')
      }

      return response.json()
    },
    onSuccess: (updatedRecord) => {
      // Update employment records list
      queryClient.setQueryData<EmploymentRecord[]>(
        queryKeys.employment.byApplication(applicationId),
        (old) => {
          if (!old) return [updatedRecord]
          const index = old.findIndex(e => e.id === updatedRecord.id)
          if (index >= 0) {
            // Update existing
            const newData = [...old]
            newData[index] = updatedRecord
            return newData
          } else {
            // Add new
            return [...old, updatedRecord]
          }
        }
      )

      // Invalidate application query to update completion percentage
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      toast.success('Employment information saved successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save employment information')
    },
  })
}

/**
 * Batch update multiple employment records
 *
 * @param applicationId - Application ID
 * @returns Mutation result with updated employment records array
 */
export function useUpdateEmploymentRecords(
  applicationId: string
): UseMutationResult<EmploymentRecord[], Error, EmploymentInput[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employmentRecords: EmploymentInput[]) => {
      const response = await fetch(`/api/applications/${applicationId}/employment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employmentRecords }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update employment records')
      }

      return response.json()
    },
    onSuccess: (updatedRecords) => {
      // Replace entire employment records list
      queryClient.setQueryData<EmploymentRecord[]>(
        queryKeys.employment.byApplication(applicationId),
        updatedRecords
      )

      // Invalidate application query to update completion percentage
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      toast.success('All employment information saved successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save employment information')
    },
  })
}
