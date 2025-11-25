/**
 * Real-Time Application Updates Hook
 *
 * Subscribes to real-time changes for an application using Supabase Realtime.
 * Updates React Query cache when changes are detected from other users.
 *
 * @module lib/hooks/use-realtime-application
 */

'use client'

import { useEffect, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface ApplicationChangePayload {
  id: string
  status?: string
  completion_percentage?: number
  current_section?: string
  updated_at?: string
  [key: string]: unknown
}

interface UseRealtimeApplicationOptions {
  /** Whether to enable the subscription */
  enabled?: boolean
  /** Callback when application is updated */
  onUpdate?: (payload: ApplicationChangePayload) => void
  /** Callback when subscription status changes */
  onStatusChange?: (status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED') => void
}

interface UseRealtimeApplicationReturn {
  /** Whether the subscription is active */
  isSubscribed: boolean
  /** Any subscription error */
  error: Error | null
  /** Subscription status */
  status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | 'CONNECTING' | null
}

/**
 * Hook to subscribe to real-time updates for a specific application
 *
 * @param applicationId - The ID of the application to subscribe to
 * @param options - Configuration options for the subscription
 * @returns Subscription status and error information
 *
 * @example
 * ```tsx
 * function ApplicationPage({ applicationId }) {
 *   const { isSubscribed, error } = useRealtimeApplication(applicationId, {
 *     onUpdate: (payload) => {
 *       console.log('Application updated:', payload)
 *     }
 *   })
 *
 *   return (
 *     <div>
 *       {isSubscribed && <span>Real-time updates active</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeApplication(
  applicationId: string | undefined,
  options: UseRealtimeApplicationOptions = {}
): UseRealtimeApplicationReturn {
  const { enabled = true, onUpdate, onStatusChange } = options
  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<UseRealtimeApplicationReturn['status']>(null)

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<ApplicationChangePayload>) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        // Update React Query cache with the new data
        queryClient.setQueryData(
          queryKeys.applications.detail(payload.new.id),
          (oldData: ApplicationChangePayload | undefined) => {
            if (!oldData) return oldData
            return { ...oldData, ...payload.new }
          }
        )

        // Also invalidate the applications list to refetch
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.all,
          refetchType: 'none' // Don't refetch immediately, just mark as stale
        })

        // Call the onUpdate callback if provided
        if (onUpdate) {
          onUpdate(payload.new as ApplicationChangePayload)
        }
      }
    },
    [queryClient, onUpdate]
  )

  useEffect(() => {
    if (!applicationId || !enabled) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupSubscription = async () => {
      setStatus('CONNECTING')
      setError(null)

      channel = supabase
        .channel(`application-${applicationId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'applications',
            filter: `id=eq.${applicationId}`
          },
          handlePayload
        )
        .subscribe((subscriptionStatus, err) => {
          if (subscriptionStatus === 'SUBSCRIBED') {
            setIsSubscribed(true)
            setStatus('SUBSCRIBED')
            setError(null)
          } else if (subscriptionStatus === 'CHANNEL_ERROR') {
            setIsSubscribed(false)
            setStatus('CHANNEL_ERROR')
            setError(err ? new Error(err.message) : new Error('Channel error'))
          } else if (subscriptionStatus === 'TIMED_OUT') {
            setIsSubscribed(false)
            setStatus('TIMED_OUT')
            setError(new Error('Connection timed out'))
          } else if (subscriptionStatus === 'CLOSED') {
            setIsSubscribed(false)
            setStatus('CLOSED')
          }

          if (onStatusChange) {
            onStatusChange(subscriptionStatus as 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED')
          }
        })
    }

    setupSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
        supabase.removeChannel(channel)
      }
      setIsSubscribed(false)
      setStatus(null)
    }
  }, [applicationId, enabled, handlePayload, onStatusChange])

  return { isSubscribed, error, status }
}

/**
 * Hook to subscribe to real-time updates for multiple applications (e.g., a list view)
 *
 * @param options - Configuration options for the subscription
 * @returns Subscription status and error information
 */
export function useRealtimeApplicationList(
  options: Omit<UseRealtimeApplicationOptions, 'onUpdate'> & {
    onUpdate?: (payload: ApplicationChangePayload, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  } = {}
): UseRealtimeApplicationReturn {
  const { enabled = true, onUpdate, onStatusChange } = options
  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<UseRealtimeApplicationReturn['status']>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupSubscription = async () => {
      setStatus('CONNECTING')
      setError(null)

      channel = supabase
        .channel('applications-list')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events
            schema: 'public',
            table: 'applications'
          },
          (payload: RealtimePostgresChangesPayload<ApplicationChangePayload>) => {
            // Invalidate the applications list query to refetch
            queryClient.invalidateQueries({
              queryKey: queryKeys.applications.all
            })

            // Update individual application in cache if updated
            if (payload.eventType === 'UPDATE' && payload.new) {
              queryClient.setQueryData(
                queryKeys.applications.detail(payload.new.id),
                (oldData: ApplicationChangePayload | undefined) => {
                  if (!oldData) return oldData
                  return { ...oldData, ...payload.new }
                }
              )
            }

            // Remove from cache if deleted
            if (payload.eventType === 'DELETE' && payload.old) {
              queryClient.removeQueries({
                queryKey: queryKeys.applications.detail((payload.old as ApplicationChangePayload).id)
              })
            }

            // Call the onUpdate callback if provided
            if (onUpdate && (payload.new || payload.old)) {
              onUpdate(
                (payload.new || payload.old) as ApplicationChangePayload,
                payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
              )
            }
          }
        )
        .subscribe((subscriptionStatus, err) => {
          if (subscriptionStatus === 'SUBSCRIBED') {
            setIsSubscribed(true)
            setStatus('SUBSCRIBED')
            setError(null)
          } else if (subscriptionStatus === 'CHANNEL_ERROR') {
            setIsSubscribed(false)
            setStatus('CHANNEL_ERROR')
            setError(err ? new Error(err.message) : new Error('Channel error'))
          } else if (subscriptionStatus === 'TIMED_OUT') {
            setIsSubscribed(false)
            setStatus('TIMED_OUT')
            setError(new Error('Connection timed out'))
          } else if (subscriptionStatus === 'CLOSED') {
            setIsSubscribed(false)
            setStatus('CLOSED')
          }

          if (onStatusChange) {
            onStatusChange(subscriptionStatus as 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED')
          }
        })
    }

    setupSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
        supabase.removeChannel(channel)
      }
      setIsSubscribed(false)
      setStatus(null)
    }
  }, [enabled, queryClient, onUpdate, onStatusChange])

  return { isSubscribed, error, status }
}
