'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { PersonInput, PersonRecord } from '@/lib/api/people'
import { toast } from '@/lib/hooks/use-toast'

/**
 * React Query hooks for people management (applicants, co-applicants, guarantors)
 *
 * These hooks provide a consistent interface for fetching and mutating
 * person data, with automatic caching and optimistic updates.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch all people for an application
 *
 * @param applicationId - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with people array
 */
export function usePeople(
  applicationId: string,
  enabled: boolean = true
): UseQueryResult<PersonRecord[], Error> {
  return useQuery({
    queryKey: queryKeys.people.byApplication(applicationId),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/people`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch people')
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
 * Create or update a person record
 *
 * @param applicationId - Application ID
 * @returns Mutation result with created/updated person
 */
export function useUpsertPerson(
  applicationId: string
): UseMutationResult<PersonRecord, Error, PersonInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PersonInput) => {
      const response = await fetch(`/api/applications/${applicationId}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save person')
      }

      return response.json()
    },
    onSuccess: (updatedPerson) => {
      // Update people list
      queryClient.setQueryData<PersonRecord[]>(
        queryKeys.people.byApplication(applicationId),
        (old) => {
          if (!old) return [updatedPerson]
          const index = old.findIndex(p => p.id === updatedPerson.id)
          if (index >= 0) {
            // Update existing
            const newData = [...old]
            newData[index] = updatedPerson
            return newData
          } else {
            // Add new
            return [...old, updatedPerson]
          }
        }
      )

      // Invalidate application query to update completion percentage
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      toast.success('Profile information saved successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save profile information')
    },
  })
}

/**
 * Batch update multiple people records
 *
 * @param applicationId - Application ID
 * @returns Mutation result with updated people array
 */
export function useUpdatePeople(
  applicationId: string
): UseMutationResult<PersonRecord[], Error, PersonInput[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (people: PersonInput[]) => {
      const response = await fetch(`/api/applications/${applicationId}/people`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update people')
      }

      return response.json()
    },
    onSuccess: (updatedPeople) => {
      // Replace entire people list
      queryClient.setQueryData<PersonRecord[]>(
        queryKeys.people.byApplication(applicationId),
        updatedPeople
      )

      // Invalidate application query to update completion percentage
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      toast.success('All profile information saved successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save profile information')
    },
  })
}
