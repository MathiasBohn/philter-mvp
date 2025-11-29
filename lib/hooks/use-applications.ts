'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { z } from 'zod'
import { queryKeys } from '@/lib/query-client'
import type { Application } from '@/lib/types'
import { toast } from '@/lib/hooks/use-toast'

// =============================================================================
// API Response Schemas (Type Safety Fix 3.9)
// =============================================================================

/**
 * Schema for validating individual application response
 * Validates the essential fields we expect from the API
 */
const applicationResponseSchema = z.object({
  id: z.string().uuid(),
  building_id: z.string().uuid().nullable().optional(),
  buildingId: z.string().uuid().nullable().optional(),
  transaction_type: z.string().optional(),
  transactionType: z.string().optional(),
  status: z.string(),
  created_by: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  created_at: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
}).passthrough() // Allow additional fields

/**
 * Schema for validating applications list response
 */
const applicationsListResponseSchema = z.object({
  applications: z.array(applicationResponseSchema),
})

/**
 * Schema for validating single application response
 */
const singleApplicationResponseSchema = z.object({
  application: applicationResponseSchema,
})

/**
 * Validates and extracts applications from API response
 * Logs warnings for invalid responses but attempts graceful degradation
 */
function validateApplicationsResponse(data: unknown): Application[] {
  const result = applicationsListResponseSchema.safeParse(data)

  if (!result.success) {
    console.warn('Invalid applications API response:', result.error.issues)
    // Attempt graceful degradation - check if it's an array directly
    if (Array.isArray(data)) {
      return data as Application[]
    }
    // Check if it has an applications property even if validation failed
    if (data && typeof data === 'object' && 'applications' in data) {
      return (data as { applications: unknown[] }).applications as Application[]
    }
    throw new Error('Invalid response format from server')
  }

  return result.data.applications as Application[]
}

/**
 * Validates and extracts single application from API response
 * Logs warnings for invalid responses but attempts graceful degradation
 */
function validateSingleApplicationResponse(data: unknown): Application {
  const result = singleApplicationResponseSchema.safeParse(data)

  if (!result.success) {
    console.warn('Invalid application API response:', result.error.issues)
    // Attempt graceful degradation
    if (data && typeof data === 'object' && 'application' in data) {
      return (data as { application: unknown }).application as Application
    }
    throw new Error('Invalid response format from server')
  }

  return result.data.application as Application
}

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
    queryKey: queryKeys.applications.all,
    queryFn: async (): Promise<Application[]> => {
      const response = await fetch('/api/applications', {
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json()
        // API returns errors in format: { error: { message: "..." } }
        const errorMessage = errorData.error?.message || errorData.message || 'Failed to fetch applications'
        throw new Error(errorMessage)
      }
      const data = await response.json()
      // Validate response shape (Type Safety Fix 3.9)
      return validateApplicationsResponse(data)
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
    queryKey: queryKeys.applications.detail(id),
    queryFn: async (): Promise<Application> => {
      const response = await fetch(`/api/applications/${id}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json()
        // API returns errors in format: { error: { message: "..." } }
        const errorMessage = errorData.error?.message || errorData.message || 'Failed to fetch application'
        throw new Error(errorMessage)
      }
      const result = await response.json()
      // Validate response shape (Type Safety Fix 3.9)
      return validateSingleApplicationResponse(result)
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
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error?.message || errorData.message || 'Failed to create application'
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result.application
    },
    onSuccess: (newApplication) => {
      // Add to applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications.all,
        (old) => (old ? [...old, newApplication] : [newApplication])
      )

      // Add to individual application cache
      queryClient.setQueryData(
        queryKeys.applications.detail(newApplication.id),
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
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error?.message || errorData.message || 'Failed to update application'
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result.application
    },
    onMutate: async (updatedData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.applications.detail(id) })

      // Snapshot previous value
      const previousApplication = queryClient.getQueryData<Application>(
        queryKeys.applications.detail(id)
      )

      // Optimistically update
      if (previousApplication) {
        queryClient.setQueryData<Application>(queryKeys.applications.detail(id), {
          ...previousApplication,
          ...updatedData,
        })
      }

      return { previousApplication }
    },
    onSuccess: (updatedApplication) => {
      // Update individual application cache
      queryClient.setQueryData(
        queryKeys.applications.detail(id),
        updatedApplication
      )

      // Update applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications.all,
        (old) =>
          old?.map((app) => (app.id === id ? updatedApplication : app)) || []
      )

      toast.success('Your changes have been saved.')
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousApplication) {
        queryClient.setQueryData(
          queryKeys.applications.detail(id),
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
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error?.message || errorData.message || 'Failed to delete application'
        throw new Error(errorMessage)
      }
    },
    onSuccess: () => {
      // Remove from applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications.all,
        (old) => old?.filter((app) => app.id !== id) || []
      )

      // Remove individual application cache
      queryClient.removeQueries({ queryKey: queryKeys.applications.detail(id) })

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
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error?.message || errorData.message || 'Failed to submit application'
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result.application
    },
    onSuccess: (updatedApplication) => {
      // Update individual application cache
      queryClient.setQueryData(
        queryKeys.applications.detail(id),
        updatedApplication
      )

      // Update applications list
      queryClient.setQueryData<Application[]>(
        queryKeys.applications.all,
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
