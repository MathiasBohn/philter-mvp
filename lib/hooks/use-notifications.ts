/**
 * Notifications Hook
 *
 * Manages user notifications with real-time updates using Supabase Realtime.
 * Provides functions to fetch, mark as read, and listen for new notifications.
 *
 * @module lib/hooks/use-notifications
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'sonner'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'RFI_CREATED'
  | 'RFI_MESSAGE'
  | 'RFI_RESOLVED'
  | 'DECISION_MADE'
  | 'DOCUMENT_UPLOADED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'INVITATION_RECEIVED'
  | 'INVITATION_ACCEPTED'
  | 'SYSTEM_ANNOUNCEMENT'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  link: string | null
  metadata: Record<string, unknown>
  read: boolean
  read_at: string | null
  created_at: string
  application_id: string | null
  rfi_id: string | null
  triggered_by: string | null
}

interface UseNotificationsOptions {
  /** Whether to enable real-time updates */
  realtime?: boolean
  /** Whether to show toast for new notifications */
  showToasts?: boolean
  /** How many notifications to fetch */
  limit?: number
  /** Filter by read status */
  readFilter?: 'all' | 'read' | 'unread'
}

interface UseNotificationsReturn {
  /** List of notifications */
  notifications: Notification[]
  /** Whether notifications are loading */
  isLoading: boolean
  /** Any error that occurred */
  error: Error | null
  /** Unread notification count */
  unreadCount: number
  /** Mark a notification as read */
  markAsRead: (notificationId: string) => Promise<void>
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>
  /** Delete a notification */
  deleteNotification: (notificationId: string) => Promise<void>
  /** Whether real-time is connected */
  isRealtimeConnected: boolean
  /** Refetch notifications */
  refetch: () => void
}

/**
 * Fetch notifications from the database
 */
async function fetchNotifications(
  limit: number,
  readFilter: 'all' | 'read' | 'unread'
): Promise<Notification[]> {
  const supabase = createClient()

  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (readFilter === 'read') {
    query = query.eq('read', true)
  } else if (readFilter === 'unread') {
    query = query.eq('read', false)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data as Notification[]
}

/**
 * Fetch unread notification count
 */
async function fetchUnreadCount(): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  if (error) {
    console.error('Failed to fetch unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * Hook to manage user notifications
 *
 * @param options - Configuration options
 * @returns Notification state and functions
 *
 * @example
 * ```tsx
 * function NotificationBell() {
 *   const {
 *     notifications,
 *     unreadCount,
 *     markAsRead,
 *     markAllAsRead,
 *     isRealtimeConnected
 *   } = useNotifications({
 *     realtime: true,
 *     showToasts: true,
 *     limit: 20
 *   })
 *
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>
 *         <Bell />
 *         {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         {notifications.map(n => (
 *           <NotificationItem
 *             key={n.id}
 *             notification={n}
 *             onRead={() => markAsRead(n.id)}
 *           />
 *         ))}
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   )
 * }
 * ```
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    realtime = true,
    showToasts = true,
    limit = 50,
    readFilter = 'all'
  } = options

  const queryClient = useQueryClient()
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const processedIds = useRef<Set<string>>(new Set())

  // Query for notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKeys.notifications.all, { limit, readFilter }],
    queryFn: () => fetchNotifications(limit, readFilter),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true
  })

  // Query for unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true
  })

  // Mutation to mark as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount })
    }
  })

  // Mutation to mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase.rpc('mark_all_notifications_read')

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount })
    }
  })

  // Mutation to delete notification
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount })
    }
  })

  // Handle new notification from realtime
  const handleNewNotification = useCallback(
    (payload: RealtimePostgresChangesPayload<Notification>) => {
      if (payload.eventType !== 'INSERT' || !payload.new) return

      const newNotification = payload.new as Notification

      // Skip if already processed
      if (processedIds.current.has(newNotification.id)) return
      processedIds.current.add(newNotification.id)

      // Update cache
      queryClient.setQueryData(
        [...queryKeys.notifications.all, { limit, readFilter }],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return [newNotification]
          if (oldData.some(n => n.id === newNotification.id)) return oldData
          return [newNotification, ...oldData].slice(0, limit)
        }
      )

      // Update unread count
      if (!newNotification.read) {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount,
          (oldCount: number | undefined) => (oldCount || 0) + 1
        )
      }

      // Show toast
      if (showToasts) {
        toast.info(newNotification.title, {
          description: newNotification.message || undefined,
          action: newNotification.link
            ? {
                label: 'View',
                onClick: () => {
                  window.location.href = newNotification.link!
                }
              }
            : undefined
        })
      }
    },
    [queryClient, limit, readFilter, showToasts]
  )

  // Set up realtime subscription
  useEffect(() => {
    if (!realtime) return

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupSubscription = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          handleNewNotification
        )
        .subscribe((status) => {
          setIsRealtimeConnected(status === 'SUBSCRIBED')
        })
    }

    setupSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
        supabase.removeChannel(channel)
      }
      setIsRealtimeConnected(false)
    }
  }, [realtime, handleNewNotification])

  return {
    notifications,
    isLoading,
    error: error as Error | null,
    unreadCount,
    markAsRead: (id) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    deleteNotification: (id) => deleteMutation.mutateAsync(id),
    isRealtimeConnected,
    refetch
  }
}

/**
 * Hook for just the unread count (lighter weight)
 */
export function useUnreadNotificationCount(): number {
  const { data = 0 } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true
  })

  return data
}
