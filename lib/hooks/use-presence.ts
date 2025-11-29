/**
 * Presence Indicators Hook
 *
 * Tracks online users viewing an application using Supabase Realtime Presence.
 * Shows who else is currently viewing or editing the same application.
 *
 * Uses useReducer for cleaner state management and to avoid complex ref patterns.
 *
 * @module lib/hooks/use-presence
 */

'use client'

import { useEffect, useCallback, useRef, useReducer, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'

export interface PresenceUser {
  /** User ID */
  id: string
  /** User's display name */
  name: string
  /** User's email */
  email?: string
  /** User's role */
  role?: string
  /** Avatar URL (if available) */
  avatarUrl?: string
  /** When the user joined */
  joinedAt: string
  /** What section/page the user is on */
  currentSection?: string
  /** Unique presence key */
  presenceKey?: string
}

interface UsePresenceOptions {
  /** Whether to enable presence tracking */
  enabled?: boolean
  /** Current user info to broadcast */
  currentUser?: {
    id: string
    name: string
    email?: string
    role?: string
    avatarUrl?: string
  }
  /** Current section the user is viewing */
  currentSection?: string
  /** Callback when users join */
  onJoin?: (users: PresenceUser[]) => void
  /** Callback when users leave */
  onLeave?: (users: PresenceUser[]) => void
  /** Callback when presence state syncs */
  onSync?: (users: PresenceUser[]) => void
}

interface UsePresenceReturn {
  /** List of currently present users */
  presentUsers: PresenceUser[]
  /** Whether the presence channel is active */
  isConnected: boolean
  /** Any connection error */
  error: Error | null
  /** Total number of online users (including self) */
  onlineCount: number
  /** Update current user's presence state (e.g., change section) */
  updatePresence: (updates: Partial<Pick<PresenceUser, 'currentSection'>>) => Promise<void>
}

// ============================================================================
// Reducer State Management
// ============================================================================

interface PresenceState {
  presentUsers: PresenceUser[]
  isConnected: boolean
  error: Error | null
}

type PresenceAction =
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED' }
  | { type: 'DISCONNECTED' }
  | { type: 'SYNC'; users: PresenceUser[] }
  | { type: 'ERROR'; error: Error }
  | { type: 'RESET' }

const initialState: PresenceState = {
  presentUsers: [],
  isConnected: false,
  error: null,
}

function presenceReducer(state: PresenceState, action: PresenceAction): PresenceState {
  switch (action.type) {
    case 'CONNECTING':
      return { ...state, error: null }
    case 'CONNECTED':
      return { ...state, isConnected: true, error: null }
    case 'DISCONNECTED':
      return { ...state, isConnected: false }
    case 'SYNC':
      return { ...state, presentUsers: action.users }
    case 'ERROR':
      return { ...state, isConnected: false, error: action.error }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

/**
 * Hook to track presence of users viewing an application
 *
 * @param channelName - Unique channel name (e.g., `application-${id}`)
 * @param options - Configuration options
 * @returns Presence state and functions
 *
 * @example
 * ```tsx
 * function ApplicationHeader({ applicationId, user }) {
 *   const { presentUsers, onlineCount, updatePresence } = usePresence(
 *     `application-${applicationId}`,
 *     {
 *       currentUser: {
 *         id: user.id,
 *         name: user.name,
 *         email: user.email,
 *         role: user.role
 *       },
 *       currentSection: 'profile'
 *     }
 *   )
 *
 *   // Update when section changes
 *   useEffect(() => {
 *     updatePresence({ currentSection: currentSection })
 *   }, [currentSection])
 *
 *   return (
 *     <div className="flex items-center gap-2">
 *       <span>{onlineCount} online</span>
 *       <PresenceAvatars users={presentUsers} />
 *     </div>
 *   )
 * }
 * ```
 */
export function usePresence(
  channelName: string | undefined,
  options: UsePresenceOptions = {}
): UsePresenceReturn {
  const {
    enabled = true,
    currentUser,
    currentSection,
    onJoin,
    onLeave,
    onSync
  } = options

  // Use reducer for cleaner state management
  const [state, dispatch] = useReducer(presenceReducer, initialState)
  const { presentUsers, isConnected, error } = state

  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  // Use refs for callbacks to avoid triggering effect re-runs
  const onJoinRef = useRef(onJoin)
  const onLeaveRef = useRef(onLeave)
  const onSyncRef = useRef(onSync)

  // Update refs when callbacks change
  useEffect(() => {
    onJoinRef.current = onJoin
    onLeaveRef.current = onLeave
    onSyncRef.current = onSync
  }, [onJoin, onLeave, onSync])

  // Store stable user reference - only changes when user ID changes
  // This prevents re-subscriptions when parent component re-renders with same user
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableCurrentUser = useMemo(() => currentUser, [currentUser?.id])

  // Track if we're currently subscribed to prevent state updates after unmount
  const isSubscribedRef = useRef(false)

  // Parse presence state into our user format
  const parsePresenceState = useCallback((state: RealtimePresenceState): PresenceUser[] => {
    const users: PresenceUser[] = []

    Object.entries(state).forEach(([key, presences]) => {
      // Each key can have multiple presences (same user in multiple tabs)
      presences.forEach((presence) => {
        const user = presence as unknown as PresenceUser & { presence_ref?: string }
        users.push({
          ...user,
          presenceKey: key
        })
      })
    })

    // Deduplicate by user ID (keep most recent)
    const uniqueUsers = users.reduce((acc, user) => {
      const existing = acc.find(u => u.id === user.id)
      if (!existing || new Date(user.joinedAt) > new Date(existing.joinedAt)) {
        return [...acc.filter(u => u.id !== user.id), user]
      }
      return acc
    }, [] as PresenceUser[])

    return uniqueUsers
  }, [])

  // Store currentSection in a ref for use in updatePresence without triggering re-subscriptions
  const currentSectionRef = useRef(currentSection)
  useEffect(() => {
    currentSectionRef.current = currentSection
  }, [currentSection])

  // Update presence state
  const updatePresence = useCallback(async (updates: Partial<Pick<PresenceUser, 'currentSection'>>) => {
    if (!channelRef.current || !stableCurrentUser) return

    try {
      await channelRef.current.track({
        id: stableCurrentUser.id,
        name: stableCurrentUser.name,
        email: stableCurrentUser.email,
        role: stableCurrentUser.role,
        avatarUrl: stableCurrentUser.avatarUrl,
        joinedAt: new Date().toISOString(),
        currentSection: updates.currentSection || currentSectionRef.current
      })
    } catch (err) {
      console.error('Failed to update presence:', err)
    }
  }, [stableCurrentUser])

  useEffect(() => {
    // Only subscribe when we have all required data
    if (!channelName || !enabled || !stableCurrentUser) {
      return
    }

    // Mark as subscribed
    isSubscribedRef.current = true

    const supabase = createClient()
    supabaseRef.current = supabase

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: stableCurrentUser.id
        }
      }
    })

    channelRef.current = channel

    // Handle presence sync (initial state and all changes)
    channel.on('presence', { event: 'sync' }, () => {
      if (!isSubscribedRef.current) return

      const presenceState = channel.presenceState()
      const users = parsePresenceState(presenceState)
      dispatch({ type: 'SYNC', users })

      if (onSyncRef.current) {
        onSyncRef.current(users)
      }
    })

    // Handle users joining
    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      if (!isSubscribedRef.current) return

      const users = newPresences.map((p) => p as unknown as PresenceUser)

      if (onJoinRef.current) {
        onJoinRef.current(users)
      }
    })

    // Handle users leaving
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      if (!isSubscribedRef.current) return

      const users = leftPresences.map((p) => p as unknown as PresenceUser)

      if (onLeaveRef.current) {
        onLeaveRef.current(users)
      }
    })

    // Subscribe and track current user's presence
    channel.subscribe(async (status) => {
      if (!isSubscribedRef.current) return

      if (status === 'SUBSCRIBED') {
        dispatch({ type: 'CONNECTED' })

        // Track our presence
        await channel.track({
          id: stableCurrentUser.id,
          name: stableCurrentUser.name,
          email: stableCurrentUser.email,
          role: stableCurrentUser.role,
          avatarUrl: stableCurrentUser.avatarUrl,
          joinedAt: new Date().toISOString(),
          currentSection: currentSectionRef.current
        })
      } else if (status === 'CHANNEL_ERROR') {
        dispatch({ type: 'ERROR', error: new Error('Could not connect to real-time updates. Please refresh the page to try again.') })
      } else if (status === 'TIMED_OUT') {
        dispatch({ type: 'ERROR', error: new Error('Connection timed out. Check your internet connection and refresh.') })
      } else if (status === 'CLOSED') {
        // Only update state if we're still subscribed (not during cleanup)
        if (isSubscribedRef.current) {
          dispatch({ type: 'DISCONNECTED' })
        }
      }
    })

    return () => {
      // Mark as unsubscribed FIRST to prevent state updates
      isSubscribedRef.current = false
      channelRef.current = null

      // Then cleanup the channel
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [channelName, enabled, stableCurrentUser, parsePresenceState])

  // Update presence when section changes (but don't re-subscribe)
  useEffect(() => {
    if (isConnected && currentSection !== undefined && isSubscribedRef.current) {
      updatePresence({ currentSection })
    }
  }, [currentSection, isConnected, updatePresence])

  return {
    presentUsers,
    isConnected,
    error,
    onlineCount: presentUsers.length,
    updatePresence
  }
}

/**
 * Simplified hook for just getting online count
 */
export function useOnlineCount(
  channelName: string | undefined,
  currentUser?: UsePresenceOptions['currentUser']
): number {
  const { onlineCount } = usePresence(channelName, {
    enabled: !!channelName,
    currentUser
  })
  return onlineCount
}
