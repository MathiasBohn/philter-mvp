/**
 * Real-Time RFI Updates Hook
 *
 * Subscribes to real-time changes for RFIs and RFI messages using Supabase Realtime.
 * Updates React Query cache when new messages are received from other users.
 *
 * @module lib/hooks/use-realtime-rfi
 */

'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'sonner'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface RFIMessagePayload {
  id: string
  rfi_id: string
  author_id: string
  author_name: string
  author_role: string
  message: string
  attachments?: unknown[]
  created_at: string
}

interface RFIPayload {
  id: string
  application_id: string
  section_key?: string
  status: 'OPEN' | 'RESOLVED'
  assignee_role?: string
  created_by: string
  created_at: string
  resolved_at?: string
  updated_at: string
}

interface UseRealtimeRFIOptions {
  /** Whether to enable the subscription */
  enabled?: boolean
  /** Whether to show toast notifications for new messages */
  showNotifications?: boolean
  /** Current user ID to avoid notifying for own messages */
  currentUserId?: string
  /** Callback when a new message is received */
  onNewMessage?: (message: RFIMessagePayload) => void
  /** Callback when RFI status changes */
  onStatusChange?: (rfi: RFIPayload) => void
}

interface UseRealtimeRFIReturn {
  /** Whether the subscription is active */
  isSubscribed: boolean
  /** Any subscription error */
  error: Error | null
  /** Subscription status */
  status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | 'CONNECTING' | null
}

/**
 * Hook to subscribe to real-time updates for a specific RFI
 *
 * @param rfiId - The ID of the RFI to subscribe to
 * @param options - Configuration options for the subscription
 * @returns Subscription status and error information
 *
 * @example
 * ```tsx
 * function RFIThread({ rfiId }) {
 *   const { isSubscribed } = useRealtimeRFI(rfiId, {
 *     showNotifications: true,
 *     currentUserId: user.id,
 *     onNewMessage: (message) => {
 *       console.log('New message:', message)
 *     }
 *   })
 *
 *   return (
 *     <div>
 *       {isSubscribed && <Badge>Live</Badge>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeRFI(
  rfiId: string | undefined,
  options: UseRealtimeRFIOptions = {}
): UseRealtimeRFIReturn {
  const {
    enabled = true,
    showNotifications = true,
    currentUserId,
    onNewMessage,
    onStatusChange
  } = options
  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<UseRealtimeRFIReturn['status']>(null)

  // Keep track of processed message IDs to avoid duplicates
  const processedMessageIds = useRef<Set<string>>(new Set())

  const handleNewMessage = useCallback(
    (payload: RealtimePostgresChangesPayload<RFIMessagePayload>) => {
      if (payload.eventType !== 'INSERT' || !payload.new) return

      const newMessage = payload.new as RFIMessagePayload

      // Skip if we've already processed this message
      if (processedMessageIds.current.has(newMessage.id)) return
      processedMessageIds.current.add(newMessage.id)

      // Update React Query cache - append new message to the list
      queryClient.setQueryData(
        queryKeys.rfis.messages(rfiId!),
        (oldData: RFIMessagePayload[] | undefined) => {
          if (!oldData) return [newMessage]
          // Check if message already exists
          if (oldData.some(m => m.id === newMessage.id)) return oldData
          return [...oldData, newMessage]
        }
      )

      // Also invalidate the RFI detail to get updated message count
      queryClient.invalidateQueries({
        queryKey: queryKeys.rfis.detail(rfiId!),
        refetchType: 'none'
      })

      // Show notification for messages from other users
      if (showNotifications && currentUserId && newMessage.author_id !== currentUserId) {
        toast.info(`New message from ${newMessage.author_name}`, {
          description: newMessage.message.slice(0, 100) + (newMessage.message.length > 100 ? '...' : '')
        })
      }

      // Call the callback if provided
      if (onNewMessage) {
        onNewMessage(newMessage)
      }
    },
    [queryClient, rfiId, showNotifications, currentUserId, onNewMessage]
  )

  const handleRFIUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<RFIPayload>) => {
      if (payload.eventType !== 'UPDATE' || !payload.new) return

      const updatedRFI = payload.new as RFIPayload

      // Update React Query cache
      queryClient.setQueryData(
        queryKeys.rfis.detail(rfiId!),
        (oldData: RFIPayload | undefined) => {
          if (!oldData) return oldData
          return { ...oldData, ...updatedRFI }
        }
      )

      // Notify about status change
      if (showNotifications && payload.old && (payload.old as RFIPayload).status !== updatedRFI.status) {
        toast.info(`RFI ${updatedRFI.status === 'RESOLVED' ? 'resolved' : 'reopened'}`)
      }

      // Call the callback if provided
      if (onStatusChange) {
        onStatusChange(updatedRFI)
      }
    },
    [queryClient, rfiId, showNotifications, onStatusChange]
  )

  useEffect(() => {
    if (!rfiId || !enabled) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    // Clear processed messages when RFI changes
    processedMessageIds.current.clear()

    const setupSubscription = async () => {
      setStatus('CONNECTING')
      setError(null)

      channel = supabase
        .channel(`rfi-${rfiId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'rfi_messages',
            filter: `rfi_id=eq.${rfiId}`
          },
          handleNewMessage
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rfis',
            filter: `id=eq.${rfiId}`
          },
          handleRFIUpdate
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
  }, [rfiId, enabled, handleNewMessage, handleRFIUpdate])

  return { isSubscribed, error, status }
}

/**
 * Hook to subscribe to real-time updates for all RFIs of an application
 *
 * @param applicationId - The ID of the application to watch RFIs for
 * @param options - Configuration options for the subscription
 * @returns Subscription status and error information
 */
export function useRealtimeApplicationRFIs(
  applicationId: string | undefined,
  options: Omit<UseRealtimeRFIOptions, 'onNewMessage' | 'onStatusChange'> & {
    onNewRFI?: (rfi: RFIPayload) => void
    onRFIUpdate?: (rfi: RFIPayload) => void
  } = {}
): UseRealtimeRFIReturn {
  const {
    enabled = true,
    showNotifications = true,
    currentUserId,
    onNewRFI,
    onRFIUpdate
  } = options
  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<UseRealtimeRFIReturn['status']>(null)

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
        .channel(`app-rfis-${applicationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rfis',
            filter: `application_id=eq.${applicationId}`
          },
          (payload: RealtimePostgresChangesPayload<RFIPayload>) => {
            // Invalidate the RFIs list query
            queryClient.invalidateQueries({
              queryKey: queryKeys.rfis.byApplication(applicationId)
            })

            if (payload.eventType === 'INSERT' && payload.new) {
              const newRFI = payload.new as RFIPayload

              if (showNotifications && currentUserId && newRFI.created_by !== currentUserId) {
                toast.info('New RFI created', {
                  description: `Section: ${newRFI.section_key || 'General'}`
                })
              }

              if (onNewRFI) {
                onNewRFI(newRFI)
              }
            }

            if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedRFI = payload.new as RFIPayload

              // Update individual RFI in cache
              queryClient.setQueryData(
                queryKeys.rfis.detail(updatedRFI.id),
                (oldData: RFIPayload | undefined) => {
                  if (!oldData) return oldData
                  return { ...oldData, ...updatedRFI }
                }
              )

              if (onRFIUpdate) {
                onRFIUpdate(updatedRFI)
              }
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
  }, [applicationId, enabled, queryClient, showNotifications, currentUserId, onNewRFI, onRFIUpdate])

  return { isSubscribed, error, status }
}
