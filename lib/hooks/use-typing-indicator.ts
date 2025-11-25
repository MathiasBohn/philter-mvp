/**
 * Typing Indicator Hook
 *
 * Broadcasts typing status to other users in a channel using Supabase Realtime Broadcast.
 * Shows "User is typing..." indicators in real-time message threads.
 *
 * @module lib/hooks/use-typing-indicator
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface TypingUser {
  id: string
  name: string
  timestamp: number
}

interface UseTypingIndicatorOptions {
  /** Whether to enable the typing indicator */
  enabled?: boolean
  /** Current user info */
  currentUser?: {
    id: string
    name: string
  }
  /** Debounce delay for broadcasting typing status (ms) */
  debounceMs?: number
  /** How long to show typing indicator after last activity (ms) */
  timeoutMs?: number
}

interface UseTypingIndicatorReturn {
  /** List of users currently typing */
  typingUsers: TypingUser[]
  /** Whether any users are typing */
  isAnyoneTyping: boolean
  /** Function to call when user starts typing */
  startTyping: () => void
  /** Function to call when user stops typing */
  stopTyping: () => void
  /** Whether the indicator channel is connected */
  isConnected: boolean
}

/**
 * Hook to show typing indicators in message threads
 *
 * @param channelName - Unique channel name (e.g., `rfi-${id}-typing`)
 * @param options - Configuration options
 * @returns Typing state and functions
 *
 * @example
 * ```tsx
 * function MessageInput({ rfiId, user }) {
 *   const { typingUsers, isAnyoneTyping, startTyping, stopTyping } = useTypingIndicator(
 *     `rfi-${rfiId}-typing`,
 *     {
 *       currentUser: { id: user.id, name: user.name }
 *     }
 *   )
 *
 *   return (
 *     <div>
 *       {isAnyoneTyping && (
 *         <TypingIndicator users={typingUsers} />
 *       )}
 *       <textarea
 *         onKeyDown={startTyping}
 *         onBlur={stopTyping}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export function useTypingIndicator(
  channelName: string | undefined,
  options: UseTypingIndicatorOptions = {}
): UseTypingIndicatorReturn {
  const {
    enabled = true,
    currentUser,
    debounceMs = 500,
    timeoutMs = 3000
  } = options

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastBroadcastRef = useRef<number>(0)

  // Clean up stale typing indicators
  const cleanupStaleTypers = useCallback(() => {
    const now = Date.now()
    setTypingUsers(prev =>
      prev.filter(user => now - user.timestamp < timeoutMs)
    )
  }, [timeoutMs])

  // Broadcast typing status
  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!channelRef.current || !currentUser) return

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          id: currentUser.id,
          name: currentUser.name,
          isTyping,
          timestamp: Date.now()
        }
      })
    } catch (err) {
      console.error('Failed to broadcast typing status:', err)
    }
  }, [currentUser])

  // Start typing (debounced)
  const startTyping = useCallback(() => {
    if (!enabled || !currentUser) return

    const now = Date.now()

    // Don't broadcast too frequently
    if (now - lastBroadcastRef.current < debounceMs) return

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Broadcast typing
    broadcastTyping(true)
    lastBroadcastRef.current = now

    // Set timer to stop typing after timeout
    debounceTimerRef.current = setTimeout(() => {
      broadcastTyping(false)
    }, timeoutMs)
  }, [enabled, currentUser, debounceMs, timeoutMs, broadcastTyping])

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!enabled || !currentUser) return

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    // Broadcast stop typing
    broadcastTyping(false)
  }, [enabled, currentUser, broadcastTyping])

  useEffect(() => {
    if (!channelName || !enabled) {
      return
    }

    const supabase = createClient()
    supabaseRef.current = supabase

    const channel = supabase.channel(channelName)
    channelRef.current = channel

    // Handle typing broadcasts from other users
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      const { id, name, isTyping, timestamp } = payload as {
        id: string
        name: string
        isTyping: boolean
        timestamp: number
      }

      // Ignore our own broadcasts
      if (currentUser && id === currentUser.id) return

      setTypingUsers(prev => {
        if (isTyping) {
          // Add or update typing user
          const existing = prev.find(u => u.id === id)
          if (existing) {
            return prev.map(u =>
              u.id === id ? { ...u, timestamp } : u
            )
          }
          return [...prev, { id, name, timestamp }]
        } else {
          // Remove typing user
          return prev.filter(u => u.id !== id)
        }
      })
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false)
      }
    })

    // Set up cleanup interval for stale typers
    cleanupTimerRef.current = setInterval(cleanupStaleTypers, 1000)

    return () => {
      // Broadcast stop typing before leaving
      if (currentUser) {
        broadcastTyping(false)
      }

      // Clear timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current)
      }

      // Clean up channel
      channel.unsubscribe()
      supabase.removeChannel(channel)
      channelRef.current = null
      setIsConnected(false)
      setTypingUsers([])
    }
  }, [channelName, enabled, currentUser, cleanupStaleTypers, broadcastTyping])

  return {
    typingUsers,
    isAnyoneTyping: typingUsers.length > 0,
    startTyping,
    stopTyping,
    isConnected
  }
}
