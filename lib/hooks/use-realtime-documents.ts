/**
 * Real-Time Document Updates Hook
 *
 * Subscribes to real-time changes for documents using Supabase Realtime.
 * Shows notifications when new documents are uploaded by other users.
 *
 * @module lib/hooks/use-realtime-documents
 */

'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'sonner'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface DocumentPayload {
  id: string
  application_id: string
  filename: string
  storage_path: string
  category: string
  size: number
  mime_type: string
  status: string
  uploaded_by: string
  uploaded_at: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface UseRealtimeDocumentsOptions {
  /** Whether to enable the subscription */
  enabled?: boolean
  /** Whether to show toast notifications for new uploads */
  showNotifications?: boolean
  /** Current user ID to avoid notifying for own uploads */
  currentUserId?: string
  /** Callback when a new document is uploaded */
  onNewDocument?: (document: DocumentPayload) => void
  /** Callback when a document is deleted */
  onDocumentDeleted?: (document: DocumentPayload) => void
  /** Callback when a document status changes */
  onDocumentUpdated?: (document: DocumentPayload) => void
}

interface UseRealtimeDocumentsReturn {
  /** Whether the subscription is active */
  isSubscribed: boolean
  /** Any subscription error */
  error: Error | null
  /** Subscription status */
  status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | 'CONNECTING' | null
}

/**
 * Hook to subscribe to real-time document updates for an application
 *
 * @param applicationId - The ID of the application to subscribe to
 * @param options - Configuration options for the subscription
 * @returns Subscription status and error information
 *
 * @example
 * ```tsx
 * function DocumentsPage({ applicationId }) {
 *   const { isSubscribed } = useRealtimeDocuments(applicationId, {
 *     showNotifications: true,
 *     currentUserId: user.id,
 *     onNewDocument: (doc) => {
 *       console.log('New document uploaded:', doc.filename)
 *     }
 *   })
 *
 *   return (
 *     <div>
 *       {isSubscribed && <Badge variant="outline">Live Updates</Badge>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeDocuments(
  applicationId: string | undefined,
  options: UseRealtimeDocumentsOptions = {}
): UseRealtimeDocumentsReturn {
  const {
    enabled = true,
    showNotifications = true,
    currentUserId,
    onNewDocument,
    onDocumentDeleted,
    onDocumentUpdated
  } = options
  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<UseRealtimeDocumentsReturn['status']>(null)

  // Keep track of processed document IDs to avoid duplicates
  const processedDocumentIds = useRef<Set<string>>(new Set())

  const handleInsert = useCallback(
    (payload: RealtimePostgresChangesPayload<DocumentPayload>) => {
      if (payload.eventType !== 'INSERT' || !payload.new) return

      const newDocument = payload.new as DocumentPayload

      // Skip if we've already processed this document
      if (processedDocumentIds.current.has(newDocument.id)) return
      processedDocumentIds.current.add(newDocument.id)

      // Update React Query cache - add new document to the list
      queryClient.setQueryData(
        queryKeys.documents.byApplication(applicationId!),
        (oldData: DocumentPayload[] | undefined) => {
          if (!oldData) return [newDocument]
          // Check if document already exists
          if (oldData.some(d => d.id === newDocument.id)) return oldData
          return [...oldData, newDocument]
        }
      )

      // Show notification for uploads from other users
      if (showNotifications && currentUserId && newDocument.uploaded_by !== currentUserId) {
        toast.success('New document uploaded', {
          description: newDocument.filename,
          duration: 4000
        })
      }

      // Call the callback if provided
      if (onNewDocument) {
        onNewDocument(newDocument)
      }
    },
    [queryClient, applicationId, showNotifications, currentUserId, onNewDocument]
  )

  const handleUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<DocumentPayload>) => {
      if (payload.eventType !== 'UPDATE' || !payload.new) return

      const updatedDocument = payload.new as DocumentPayload

      // Check if this is a soft delete
      if (updatedDocument.deleted_at && (!payload.old || !(payload.old as DocumentPayload).deleted_at)) {
        // Document was soft-deleted
        queryClient.setQueryData(
          queryKeys.documents.byApplication(applicationId!),
          (oldData: DocumentPayload[] | undefined) => {
            if (!oldData) return oldData
            return oldData.filter(d => d.id !== updatedDocument.id)
          }
        )

        if (showNotifications && currentUserId && updatedDocument.uploaded_by !== currentUserId) {
          toast.info('Document removed', {
            description: updatedDocument.filename
          })
        }

        if (onDocumentDeleted) {
          onDocumentDeleted(updatedDocument)
        }
      } else {
        // Regular update (e.g., status change)
        queryClient.setQueryData(
          queryKeys.documents.byApplication(applicationId!),
          (oldData: DocumentPayload[] | undefined) => {
            if (!oldData) return oldData
            return oldData.map(d => d.id === updatedDocument.id ? { ...d, ...updatedDocument } : d)
          }
        )

        if (onDocumentUpdated) {
          onDocumentUpdated(updatedDocument)
        }
      }
    },
    [queryClient, applicationId, showNotifications, currentUserId, onDocumentDeleted, onDocumentUpdated]
  )

  const handleDelete = useCallback(
    (payload: RealtimePostgresChangesPayload<DocumentPayload>) => {
      if (payload.eventType !== 'DELETE' || !payload.old) return

      const deletedDocument = payload.old as DocumentPayload

      // Remove from React Query cache
      queryClient.setQueryData(
        queryKeys.documents.byApplication(applicationId!),
        (oldData: DocumentPayload[] | undefined) => {
          if (!oldData) return oldData
          return oldData.filter(d => d.id !== deletedDocument.id)
        }
      )

      // Also remove individual document query
      queryClient.removeQueries({
        queryKey: queryKeys.documents.detail(deletedDocument.id)
      })

      if (showNotifications && currentUserId && deletedDocument.uploaded_by !== currentUserId) {
        toast.info('Document removed', {
          description: deletedDocument.filename
        })
      }

      if (onDocumentDeleted) {
        onDocumentDeleted(deletedDocument)
      }
    },
    [queryClient, applicationId, showNotifications, currentUserId, onDocumentDeleted]
  )

  useEffect(() => {
    if (!applicationId || !enabled) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    // Clear processed documents when application changes
    processedDocumentIds.current.clear()

    const setupSubscription = async () => {
      setStatus('CONNECTING')
      setError(null)

      channel = supabase
        .channel(`documents-${applicationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'documents',
            filter: `application_id=eq.${applicationId}`
          },
          handleInsert
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'documents',
            filter: `application_id=eq.${applicationId}`
          },
          handleUpdate
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'documents',
            filter: `application_id=eq.${applicationId}`
          },
          handleDelete
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
  }, [applicationId, enabled, handleInsert, handleUpdate, handleDelete])

  return { isSubscribed, error, status }
}
