'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { DecisionRecord } from '@/lib/types'
import { toast } from '@/lib/hooks/use-toast'

/**
 * React Query hooks for decision management
 *
 * These hooks provide a consistent interface for fetching and creating
 * application decisions.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch decision for an application
 *
 * @param applicationId - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with decision data
 */
export function useDecision(
  applicationId: string,
  enabled: boolean = true
): UseQueryResult<DecisionRecord, Error> {
  return useQuery({
    queryKey: queryKeys.decision(applicationId),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/decision`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch decision')
      }
      return response.json()
    },
    enabled: enabled && !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

/**
 * Create or update a decision for an application
 *
 * @param applicationId - Application ID
 * @returns Mutation result with decision record
 */
export function useCreateDecision(
  applicationId: string
): UseMutationResult<DecisionRecord, Error, Partial<DecisionRecord>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<DecisionRecord>) => {
      const response = await fetch(`/api/applications/${applicationId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create decision')
      }

      return response.json()
    },
    onSuccess: (decision) => {
      // Invalidate decision query
      queryClient.invalidateQueries({ queryKey: queryKeys.decision(applicationId) })
      // Invalidate application query since status may have changed
      queryClient.invalidateQueries({ queryKey: queryKeys.application(applicationId) })
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: queryKeys.applications })

      const decisionText = decision.decision === 'APPROVE' ? 'approved' :
                          decision.decision === 'CONDITIONAL' ? 'conditionally approved' : 'denied'

      toast.success(`Application has been ${decisionText}.`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record decision')
    },
  })
}
