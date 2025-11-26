/**
 * Application Real-Time Wrapper
 *
 * Provides real-time updates and presence tracking for application detail pages.
 * Integrates with Supabase Realtime for live collaboration features.
 *
 * @module components/features/applications/application-realtime-wrapper
 */

'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRealtimeApplication } from '@/lib/hooks/use-realtime-application'
import { useRealtimeDocuments } from '@/lib/hooks/use-realtime-documents'
import { useRealtimeApplicationRFIs } from '@/lib/hooks/use-realtime-rfi'
import { usePresence } from '@/lib/hooks/use-presence'
import { PresenceIndicators } from '@/components/shared/presence-indicators'
import { toast } from 'sonner'

interface ApplicationRealtimeWrapperProps {
  applicationId: string
  currentSection?: string
  children: React.ReactNode
  /** Whether to show presence indicators */
  showPresence?: boolean
  /** Whether to enable real-time updates */
  enableRealtime?: boolean
}

/**
 * Wrapper component that adds real-time features to application pages
 */
export function ApplicationRealtimeWrapper({
  applicationId,
  currentSection,
  children,
  showPresence = true,
  enableRealtime = true
}: ApplicationRealtimeWrapperProps) {
  const { user, isLoading: authLoading } = useAuth()

  // Don't enable realtime features until auth is fully loaded
  // This prevents rapid subscribe/unsubscribe cycles during auth initialization
  const shouldEnableRealtime = enableRealtime && !authLoading && !!user

  // Set up presence tracking
  const {
    presentUsers,
    updatePresence
  } = usePresence(`application-${applicationId}`, {
    enabled: shouldEnableRealtime && showPresence,
    currentUser: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    } : undefined,
    currentSection,
    onJoin: (users) => {
      if (users.length > 0 && user) {
        const otherUsers = users.filter(u => u.id !== user.id)
        if (otherUsers.length > 0) {
          toast.info(`${otherUsers[0].name} is now viewing this application`)
        }
      }
    }
  })

  // Set up real-time application updates
  useRealtimeApplication(applicationId, {
    enabled: shouldEnableRealtime,
    onUpdate: (payload) => {
      if (payload.status) {
        toast.info('Application status updated')
      }
    }
  })

  // Set up real-time document updates
  useRealtimeDocuments(applicationId, {
    enabled: shouldEnableRealtime,
    currentUserId: user?.id
  })

  // Set up real-time RFI updates
  useRealtimeApplicationRFIs(applicationId, {
    enabled: shouldEnableRealtime,
    currentUserId: user?.id
  })

  // Update presence when section changes
  useEffect(() => {
    if (currentSection) {
      updatePresence({ currentSection })
    }
  }, [currentSection, updatePresence])

  return (
    <div className="relative">
      {/* Presence indicators in top-right corner */}
      {showPresence && presentUsers.length > 0 && (
        <div className="absolute top-0 right-0 z-10">
          <PresenceIndicators
            users={presentUsers}
            currentUserId={user?.id}
            size="sm"
            maxDisplay={4}
          />
        </div>
      )}

      {children}
    </div>
  )
}

/**
 * Hook to get current online users for an application
 */
export function useApplicationPresence(applicationId: string) {
  const { user } = useAuth()

  const { presentUsers, isConnected, onlineCount, updatePresence } = usePresence(
    `application-${applicationId}`,
    {
      enabled: !!user,
      currentUser: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } : undefined
    }
  )

  return {
    presentUsers: presentUsers.filter(u => u.id !== user?.id),
    isConnected,
    onlineCount,
    updatePresence
  }
}
