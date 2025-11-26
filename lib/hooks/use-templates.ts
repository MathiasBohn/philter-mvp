'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { Template } from '@/lib/types'
import { toast } from '@/lib/hooks/use-toast'

/**
 * React Query hooks for template data management
 *
 * These hooks provide a consistent interface for fetching and mutating
 * template data, with automatic caching and optimistic updates.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch all templates
 *
 * @returns Query result with templates array
 */
export function useTemplates(): UseQueryResult<Template[], Error> {
  return useQuery({
    queryKey: queryKeys.templates.all,
    queryFn: async () => {
      const response = await fetch('/api/templates', {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch templates')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single template by ID
 *
 * @param id - Template ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with template data
 */
export function useTemplate(
  id: string,
  enabled: boolean = true
): UseQueryResult<Template, Error> {
  return useQuery({
    queryKey: queryKeys.templates.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/templates/${id}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch template')
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
 * Create a new template
 *
 * @returns Mutation result with created template
 */
export function useCreateTemplate(): UseMutationResult<
  Template,
  Error,
  Partial<Template>
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Template>) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create template')
      }

      return response.json()
    },
    onSuccess: (newTemplate) => {
      // Invalidate templates list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })

      toast.success(`"${newTemplate.name}" has been created successfully.`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create template')
    },
  })
}

/**
 * Update an existing template
 *
 * @param id - Template ID to update
 * @returns Mutation result with updated template
 */
export function useUpdateTemplate(
  id: string
): UseMutationResult<Template, Error, Partial<Template>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Template>) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update template')
      }

      return response.json()
    },
    onMutate: async (updatedData) => {
      // Cancel ongoing queries for this template
      await queryClient.cancelQueries({ queryKey: queryKeys.templates.detail(id) })

      // Snapshot current value
      const previousTemplate = queryClient.getQueryData<Template>(
        queryKeys.templates.detail(id)
      )

      // Optimistically update the cache
      if (previousTemplate) {
        queryClient.setQueryData<Template>(queryKeys.templates.detail(id), {
          ...previousTemplate,
          ...updatedData,
        })
      }

      return { previousTemplate }
    },
    onError: (error, _newData, context) => {
      // Revert to previous value on error
      if (context?.previousTemplate) {
        queryClient.setQueryData(queryKeys.templates.detail(id), context.previousTemplate)
      }

      toast.error(error.message || 'Failed to update template')
    },
    onSuccess: (updatedTemplate) => {
      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })

      toast.success(`"${updatedTemplate.name}" has been updated successfully.`)
    },
  })
}

/**
 * Delete a template
 *
 * @param id - Template ID to delete
 * @returns Mutation result
 */
export function useDeleteTemplate(
  id: string
): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete template')
      }
    },
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.templates.detail(id) })
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })

      toast.success('The template has been deleted successfully.')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete template')
    },
  })
}

/**
 * Publish a template
 *
 * @param id - Template ID to publish
 * @returns Mutation result with published template
 */
export function usePublishTemplate(
  id: string
): UseMutationResult<Template, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/templates/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to publish template')
      }

      return response.json()
    },
    onSuccess: (publishedTemplate) => {
      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })

      toast.success(`"${publishedTemplate.name}" is now live and can be used for applications.`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to publish template')
    },
  })
}
