'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { Application } from '@/lib/types'
import { toast } from '@/lib/hooks/use-toast'

/**
 * React Query hooks for application data management
 *
 * These hooks provide a consistent interface for fetching and mutating
 * application data, with automatic caching and optimistic updates.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch all applications for the current user
 *
 * @returns Query result with applications array
 */
export function useApplications(): UseQueryResult<Application[], Error> {
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: async () => {
      const response = await fetch('/api/applications')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch applications')
      }
      const data = await response.json()
      // API returns { applications: [] }, extract the array
      return data.applications || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single application by ID
 *
 * @param id - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with application data
 */
export function useApplication(
  id: string,
  enabled: boolean = true
): UseQueryResult<Application, Error> {
  return useQuery({
    queryKey: queryKeys.application(id),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch application')
      }
      return response.json()
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

/**
 * Create a new application
 *
 * @returns Mutation result with created application
 */
export function useCreateApplication(): UseMutationResult<
  Application,
  Error,
  Partial<Application>
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Application>) => {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create application')
      }

      return response.json()
    },
    onSuccess: (newApplication) => {
      // Add to applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications,
        (old) => (old ? [...old, newApplication] : [newApplication])
      )

      // Add to individual application cache
      queryClient.setQueryData(
        queryKeys.application(newApplication.id),
        newApplication
      )

      toast.success('Your application has been created successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create application')
    },
  })
}

/**
 * Update an existing application
 *
 * @param id - Application ID
 * @returns Mutation result with updated application
 */
export function useUpdateApplication(
  id: string
): UseMutationResult<Application, Error, Partial<Application>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Application>) => {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update application')
      }

      return response.json()
    },
    onMutate: async (updatedData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.application(id) })

      // Snapshot previous value
      const previousApplication = queryClient.getQueryData<Application>(
        queryKeys.application(id)
      )

      // Optimistically update
      if (previousApplication) {
        queryClient.setQueryData<Application>(queryKeys.application(id), {
          ...previousApplication,
          ...updatedData,
        })
      }

      return { previousApplication }
    },
    onSuccess: (updatedApplication) => {
      // Update individual application cache
      queryClient.setQueryData(
        queryKeys.application(id),
        updatedApplication
      )

      // Update applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications,
        (old) =>
          old?.map((app) => (app.id === id ? updatedApplication : app)) || []
      )

      toast.success('Your changes have been saved.')
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousApplication) {
        queryClient.setQueryData(
          queryKeys.application(id),
          context.previousApplication
        )
      }

      toast.error(error.message || 'Failed to update application')
    },
  })
}

/**
 * Delete an application
 *
 * @param id - Application ID
 * @returns Mutation result
 */
export function useDeleteApplication(
  id: string
): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete application')
      }
    },
    onSuccess: () => {
      // Remove from applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications,
        (old) => old?.filter((app) => app.id !== id) || []
      )

      // Remove individual application cache
      queryClient.removeQueries({ queryKey: queryKeys.application(id) })

      toast.success('The application has been deleted successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete application')
    },
  })
}

/**
 * Submit an application
 *
 * @param id - Application ID
 * @returns Mutation result with updated application
 */
export function useSubmitApplication(
  id: string
): UseMutationResult<Application, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/applications/${id}/submit`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit application')
      }

      return response.json()
    },
    onSuccess: (updatedApplication) => {
      // Update individual application cache
      queryClient.setQueryData(
        queryKeys.application(id),
        updatedApplication
      )

      // Update applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications,
        (old) =>
          old?.map((app) => (app.id === id ? updatedApplication : app)) || []
      )

      toast.success('Your application has been submitted successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit application')
    },
  })
}
