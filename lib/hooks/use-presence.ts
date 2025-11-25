/**
 * Presence Indicators Hook
 *
 * Tracks online users viewing an application using Supabase Realtime Presence.
 * Shows who else is currently viewing or editing the same application.
 *
 * @module lib/hooks/use-presence
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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

  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

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

  // Update presence state
  const updatePresence = useCallback(async (updates: Partial<Pick<PresenceUser, 'currentSection'>>) => {
    if (!channelRef.current || !currentUser) return

    try {
      await channelRef.current.track({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl,
        joinedAt: new Date().toISOString(),
        currentSection: updates.currentSection || currentSection
      })
    } catch (err) {
      console.error('Failed to update presence:', err)
    }
  }, [currentUser, currentSection])

  useEffect(() => {
    if (!channelName || !enabled || !currentUser) {
      return
    }

    const supabase = createClient()
    supabaseRef.current = supabase

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser.id
        }
      }
    })

    channelRef.current = channel

    // Handle presence sync (initial state and all changes)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const users = parsePresenceState(state)
      setPresentUsers(users)

      if (onSync) {
        onSync(users)
      }
    })

    // Handle users joining
    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      const users = newPresences.map((p) => p as unknown as PresenceUser)

      if (onJoin) {
        onJoin(users)
      }
    })

    // Handle users leaving
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      const users = leftPresences.map((p) => p as unknown as PresenceUser)

      if (onLeave) {
        onLeave(users)
      }
    })

    // Subscribe and track current user's presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        setError(null)

        // Track our presence
        await channel.track({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          avatarUrl: currentUser.avatarUrl,
          joinedAt: new Date().toISOString(),
          currentSection
        })
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false)
        setError(new Error('Failed to connect to presence channel'))
      } else if (status === 'TIMED_OUT') {
        setIsConnected(false)
        setError(new Error('Connection timed out'))
      } else if (status === 'CLOSED') {
        setIsConnected(false)
      }
    })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
      channelRef.current = null
      setIsConnected(false)
      setPresentUsers([])
    }
  }, [channelName, enabled, currentUser, currentSection, parsePresenceState, onJoin, onLeave, onSync])

  // Update presence when section changes
  useEffect(() => {
    if (isConnected && currentSection !== undefined) {
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
