'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { RFI, RFIMessage, Role } from '@/lib/types'
import { toast } from '@/lib/hooks/use-toast'

/**
 * React Query hooks for RFI (Request for Information) management
 *
 * These hooks provide a consistent interface for fetching and mutating
 * RFI data, with automatic caching and optimistic updates.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch all RFIs for an application
 *
 * @param applicationId - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with RFIs array
 */
export function useRFIs(
  applicationId: string,
  enabled: boolean = true
): UseQueryResult<RFI[], Error> {
  return useQuery({
    queryKey: queryKeys.rfis(applicationId),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/rfis`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch RFIs')
      }
      return response.json()
    },
    enabled: enabled && !!applicationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new messages
  })
}

/**
 * Fetch a single RFI by ID
 *
 * @param id - RFI ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with RFI data
 */
export function useRFI(
  id: string,
  enabled: boolean = true
): UseQueryResult<RFI, Error> {
  return useQuery({
    queryKey: queryKeys.rfi(id),
    queryFn: async () => {
      const response = await fetch(`/api/rfis/${id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch RFI')
      }
      return response.json()
    },
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Fetch messages for an RFI
 *
 * @param rfiId - RFI ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with messages array
 */
export function useRFIMessages(
  rfiId: string,
  enabled: boolean = true
): UseQueryResult<RFIMessage[], Error> {
  return useQuery({
    queryKey: queryKeys.rfiMessages(rfiId),
    queryFn: async () => {
      const response = await fetch(`/api/rfis/${rfiId}/messages`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch RFI messages')
      }
      return response.json()
    },
    enabled: enabled && !!rfiId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Poll every 10 seconds for new messages
  })
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

interface CreateRFIInput {
  section_key?: string
  assignee_role: Role
  title?: string
  description?: string
}

/**
 * Create a new RFI
 *
 * @param applicationId - Application ID
 * @returns Mutation result with created RFI
 */
export function useCreateRFI(
  applicationId: string
): UseMutationResult<RFI, Error, CreateRFIInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRFIInput) => {
      const response = await fetch(`/api/applications/${applicationId}/rfis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create RFI')
      }

      return response.json()
    },
    onSuccess: (newRFI) => {
      // Add to RFIs list
      queryClient.setQueryData<RFI[]>(
        queryKeys.rfis(applicationId),
        (old) => (old ? [...old, newRFI] : [newRFI])
      )

      // Add to individual RFI cache
      queryClient.setQueryData(queryKeys.rfi(newRFI.id), newRFI)

      // Invalidate application query to update status
      queryClient.invalidateQueries({
        queryKey: queryKeys.application(applicationId)
      })

      toast({
        title: 'RFI created',
        description: 'The request for information has been created.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create RFI',
        variant: 'destructive',
      })
    },
  })
}

interface AddRFIMessageInput {
  message: string
  attachments?: any[]
}

/**
 * Add a message to an RFI
 *
 * @param rfiId - RFI ID
 * @param applicationId - Application ID (for cache updates)
 * @returns Mutation result with created message
 */
export function useAddRFIMessage(
  rfiId: string,
  applicationId: string
): UseMutationResult<RFIMessage, Error, AddRFIMessageInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddRFIMessageInput) => {
      const response = await fetch(`/api/rfis/${rfiId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add message')
      }

      return response.json()
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.rfiMessages(rfiId)
      })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<RFIMessage[]>(
        queryKeys.rfiMessages(rfiId)
      )

      // Optimistically add message
      queryClient.setQueryData<RFIMessage[]>(
        queryKeys.rfiMessages(rfiId),
        (old) => [
          ...(old || []),
          {
            id: `temp-${Date.now()}`,
            rfi_id: rfiId,
            message: data.message,
            attachments: data.attachments || [],
            created_at: new Date().toISOString(),
            author_name: 'You',
            author_role: 'APPLICANT', // Will be updated by server
          } as RFIMessage,
        ]
      )

      return { previousMessages }
    },
    onSuccess: (newMessage) => {
      // Update messages list with actual data from server
      queryClient.setQueryData<RFIMessage[]>(
        queryKeys.rfiMessages(rfiId),
        (old) => {
          // Remove temp message and add real one
          const withoutTemp = old?.filter((msg) => !msg.id.startsWith('temp-')) || []
          return [...withoutTemp, newMessage]
        }
      )

      // Invalidate RFI to update message count
      queryClient.invalidateQueries({
        queryKey: queryKeys.rfi(rfiId)
      })

      // Invalidate RFIs list to show updated status
      queryClient.invalidateQueries({
        queryKey: queryKeys.rfis(applicationId)
      })
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.rfiMessages(rfiId),
          context.previousMessages
        )
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Resolve an RFI
 *
 * @param rfiId - RFI ID
 * @param applicationId - Application ID (for cache updates)
 * @returns Mutation result with updated RFI
 */
export function useResolveRFI(
  rfiId: string,
  applicationId: string
): UseMutationResult<RFI, Error, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/rfis/${rfiId}/resolve`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to resolve RFI')
      }

      return response.json()
    },
    onSuccess: (updatedRFI) => {
      // Update individual RFI cache
      queryClient.setQueryData(queryKeys.rfi(rfiId), updatedRFI)

      // Update RFIs list
      queryClient.setQueryData<RFI[]>(
        queryKeys.rfis(applicationId),
        (old) => old?.map((rfi) => (rfi.id === rfiId ? updatedRFI : rfi)) || []
      )

      // Invalidate application query to update status
      queryClient.invalidateQueries({
        queryKey: queryKeys.application(applicationId)
      })

      toast({
        title: 'RFI resolved',
        description: 'The request for information has been marked as resolved.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve RFI',
        variant: 'destructive',
      })
    },
  })
}
