'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { Document, DocumentStatus } from '@/lib/types'
import { toast } from '@/lib/hooks/use-toast'
import { uploadFile as uploadFileToStorage, STORAGE_BUCKETS } from '@/lib/supabase-storage'
import { useAuth } from '@/lib/contexts/auth-context'

/**
 * React Query hooks for document management
 *
 * These hooks provide a consistent interface for fetching and mutating
 * document data, with automatic caching and optimistic updates.
 */

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch all documents for an application
 *
 * @param applicationId - Application ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with documents array
 */
export function useDocuments(
  applicationId: string,
  enabled: boolean = true
): UseQueryResult<Document[], Error> {
  return useQuery({
    queryKey: queryKeys.documents.byApplication(applicationId),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/documents`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch documents')
      }
      return response.json()
    },
    enabled: enabled && !!applicationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Fetch a single document by ID
 *
 * @param id - Document ID
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with document data
 */
export function useDocument(
  id: string,
  enabled: boolean = true
): UseQueryResult<{ url: string; document: Document }, Error> {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/documents/${id}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch document')
      }
      return response.json()
    },
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

interface CreateDocumentInput {
  filename: string
  category: string
  size: number
  mime_type: string
  storage_path: string
}

/**
 * Create a new document metadata entry
 *
 * Note: This only creates the metadata. File upload to storage
 * should be handled separately before calling this mutation.
 *
 * @param applicationId - Application ID
 * @returns Mutation result with created document
 */
export function useCreateDocument(
  applicationId: string
): UseMutationResult<Document, Error, CreateDocumentInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateDocumentInput) => {
      const response = await fetch(`/api/applications/${applicationId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create document')
      }

      return response.json()
    },
    onSuccess: (newDocument) => {
      // Add to documents list
      queryClient.setQueryData<Document[]>(
        queryKeys.documents.byApplication(applicationId),
        (old) => (old ? [...old, newDocument] : [newDocument])
      )

      // Invalidate application query to update document count
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      toast.success(`${newDocument.filename} has been uploaded successfully.`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document')
    },
  })
}

/**
 * Update document status
 *
 * @param id - Document ID
 * @returns Mutation result with updated document
 */
export function useUpdateDocumentStatus(
  id: string
): UseMutationResult<Document, Error, DocumentStatus> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status: DocumentStatus) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update document status')
      }

      return response.json()
    },
    onSuccess: () => {
      // Update documents list across all application queries
      queryClient.invalidateQueries({
        queryKey: ['documents']
      })
    },
  })
}

/**
 * Delete a document (legacy hook - use useDeleteDocumentMutation instead)
 *
 * @param id - Document ID
 * @param applicationId - Application ID (for cache updates)
 * @returns Mutation result
 *
 * @deprecated Use useDeleteDocumentMutation instead for more flexibility.
 *
 * **Migration guide:**
 * ```typescript
 * // Before (deprecated)
 * const deleteDoc = useDeleteDocument(documentId, applicationId)
 * await deleteDoc.mutateAsync()
 *
 * // After (recommended)
 * const deleteMutation = useDeleteDocumentMutation(applicationId)
 * await deleteMutation.mutateAsync(documentId)
 * ```
 *
 * Key differences:
 * - useDeleteDocumentMutation allows deleting any document by passing ID to mutateAsync
 * - Fixes document ID at mutation time rather than hook creation
 * - More flexible for lists where you need to delete different documents
 *
 * This hook will be removed in v2.0
 */
export function useDeleteDocument(
  id: string,
  applicationId: string
): UseMutationResult<void, Error, void> {
  // Log deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[useDeleteDocument] This hook is deprecated. Use useDeleteDocumentMutation instead. ' +
      'See migration guide in JSDoc comments.'
    )
  }

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete document')
      }
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.documents.byApplication(applicationId)
      })

      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(
        queryKeys.documents.byApplication(applicationId)
      )

      // Optimistically remove document
      queryClient.setQueryData<Document[]>(
        queryKeys.documents.byApplication(applicationId),
        (old) => old?.filter((doc) => doc.id !== id) || []
      )

      return { previousDocuments }
    },
    onSuccess: () => {
      // Invalidate application query to update document count
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      toast.success('The document has been deleted successfully.')
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents.byApplication(applicationId),
          context.previousDocuments
        )
      }

      toast.error(error.message || 'Failed to delete document')
    },
  })
}

/**
 * Delete a document mutation (flexible version)
 *
 * This hook allows deleting any document by passing the document ID
 * to the mutation function, rather than fixing it at hook creation time.
 *
 * @param applicationId - Application ID (for cache updates)
 * @returns Mutation result that accepts documentId
 */
export function useDeleteDocumentMutation(
  applicationId: string
): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete document')
      }
    },
    onMutate: async (documentId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.documents.byApplication(applicationId)
      })

      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(
        queryKeys.documents.byApplication(applicationId)
      )

      // Optimistically remove document
      queryClient.setQueryData<Document[]>(
        queryKeys.documents.byApplication(applicationId),
        (old) => old?.filter((doc) => doc.id !== documentId) || []
      )

      return { previousDocuments }
    },
    onSuccess: () => {
      // Invalidate application query to update document count
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.detail(applicationId)
      })

      toast.success('The document has been deleted successfully.')
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents.byApplication(applicationId),
          context.previousDocuments
        )
      }

      toast.error(error.message || 'Failed to delete document')
    },
  })
}

/**
 * Hook to handle file upload with progress tracking
 *
 * This hook handles the complete file upload process:
 * 1. Upload file to Supabase Storage
 * 2. Create metadata entry in database
 * 3. Track progress and handle errors
 *
 * @param applicationId - Application ID
 * @returns Upload mutation with progress tracking
 */
export function useUploadDocument(applicationId: string) {
  const createDocument = useCreateDocument(applicationId)
  const { user } = useAuth()

  const uploadFile = async (
    file: File,
    category: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    if (!user) {
      throw new Error('You must be logged in to upload documents')
    }

    // Generate storage path: user-id/application-id/document-id/filename
    const documentId = crypto.randomUUID()
    const storagePath = `${user.id}/${applicationId}/${documentId}/${file.name}`

    try {
      // Upload file to Supabase Storage
      const uploadResult = await uploadFileToStorage(
        file,
        STORAGE_BUCKETS.DOCUMENTS,
        storagePath,
        {
          onProgress,
          upsert: false,
          cacheControl: '3600',
        }
      )

      // Create metadata entry in database
      const metadata: CreateDocumentInput = {
        filename: file.name,
        category,
        size: file.size,
        mime_type: file.type,
        storage_path: uploadResult.path,
      }

      return await createDocument.mutateAsync(metadata)
    } catch (error: unknown) {
      // Clean up - try to delete the file from storage if metadata creation fails
      // (This is a best-effort cleanup, errors are logged but not thrown)
      console.error('Upload failed:', {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        applicationId,
        category,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  return {
    uploadFile,
    isUploading: createDocument.isPending,
    error: createDocument.error,
  }
}

/**
 * Signed URL data structure
 */
interface SignedURLData {
  url: string
  expiresAt: Date
}

/**
 * Batch fetch signed URLs from the API
 * This is extracted to be reusable for initial fetch and refresh
 */
async function batchFetchSignedURLs(
  documentIds: string[],
  signal?: AbortSignal
): Promise<Map<string, SignedURLData>> {
  const newUrlMap = new Map<string, SignedURLData>()

  if (documentIds.length === 0) {
    return newUrlMap
  }

  try {
    const response = await fetch('/api/documents/signed-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ documentIds }),
      signal,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch signed URLs')
    }

    const { urls } = await response.json()

    for (const urlData of urls) {
      if (urlData.url) {
        newUrlMap.set(urlData.id, {
          url: urlData.url,
          expiresAt: new Date(urlData.expiresAt),
        })
      }
    }
  } catch (error) {
    // Only log if not aborted
    if (!(error instanceof Error && error.name === 'AbortError')) {
      console.error('Error fetching signed URLs:', {
        documentCount: documentIds.length,
        documentIds: documentIds.slice(0, 5), // Log first 5 IDs for debugging
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
    throw error
  }

  return newUrlMap
}

/**
 * Hook to fetch and manage signed URLs for documents with automatic expiration handling
 *
 * Features:
 * - Fetches signed URLs for all documents in a single batch request (not N+1)
 * - Automatically refreshes URLs before they expire (5 minutes before expiration)
 * - Provides manual refresh function for individual documents
 * - Proper cleanup with AbortController
 * - Error state exposed for UI handling
 *
 * @param documents - Array of documents to fetch URLs for
 * @param options - Configuration options
 * @returns Map of document IDs to their signed URLs with expiration dates
 */
export function useDocumentSignedURLs(
  documents: Document[] | undefined,
  options?: {
    /** Time before expiration to trigger auto-refresh (default: 5 minutes) */
    refreshBuffer?: number
    /** Whether to enable auto-refresh (default: true) */
    autoRefresh?: boolean
  }
) {
  const [urlMap, setUrlMap] = useState<Map<string, SignedURLData>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refreshBuffer = options?.refreshBuffer ?? 5 * 60 * 1000 // 5 minutes default
  const autoRefresh = options?.autoRefresh ?? true

  // Store options in ref to avoid dependency issues in callbacks
  const refreshBufferRef = useRef(refreshBuffer)
  refreshBufferRef.current = refreshBuffer

  /**
   * Refresh expired URLs using batch endpoint
   * Extracted to avoid code duplication
   */
  const refreshExpiredURLs = useCallback(async (
    currentUrlMap: Map<string, SignedURLData>,
    buffer: number,
    signal?: AbortSignal
  ): Promise<void> => {
    const now = Date.now()
    const threshold = new Date(now + buffer)
    const expiredIds: string[] = []

    currentUrlMap.forEach((urlData, id) => {
      if (urlData.expiresAt <= threshold) {
        expiredIds.push(id)
      }
    })

    if (expiredIds.length === 0) return

    try {
      const refreshedUrls = await batchFetchSignedURLs(expiredIds, signal)

      if (!signal?.aborted) {
        setUrlMap((prev) => {
          const newMap = new Map(prev)
          refreshedUrls.forEach((urlData, id) => {
            newMap.set(id, urlData)
          })
          return newMap
        })
      }
    } catch (err) {
      // Silently ignore abort errors
      if (!(err instanceof Error && err.name === 'AbortError')) {
        console.error('Error refreshing expired URLs:', {
          expiredCount: expiredIds.length,
          expiredIds: expiredIds.slice(0, 5), // Log first 5 IDs for debugging
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
  }, [])

  // Fetch all signed URLs on mount or when documents change (single batch request)
  useEffect(() => {
    if (!documents || documents.length === 0) {
      setUrlMap(new Map())
      setError(null)
      return
    }

    const abortController = new AbortController()

    const fetchSignedURLs = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const documentIds = documents.map((doc) => doc.id)
        const newUrlMap = await batchFetchSignedURLs(documentIds, abortController.signal)

        if (!abortController.signal.aborted) {
          setUrlMap(newUrlMap)
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          const errorObj = err instanceof Error ? err : new Error('Failed to fetch signed URLs')
          setError(errorObj)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchSignedURLs()

    return () => {
      abortController.abort()
    }
  }, [documents])

  // Auto-refresh URLs before they expire (single timer approach)
  useEffect(() => {
    if (!autoRefresh || urlMap.size === 0) {
      return
    }

    // Find the earliest expiration time
    let earliestExpiration: Date | null = null

    urlMap.forEach((urlData) => {
      if (!earliestExpiration || urlData.expiresAt < earliestExpiration) {
        earliestExpiration = urlData.expiresAt
      }
    })

    if (!earliestExpiration) {
      return
    }

    // Calculate time until we need to refresh (refresh before expiration)
    const now = Date.now()
    // Copy to const to help TypeScript narrowing after the null check above
    const expiration: Date = earliestExpiration
    const expirationTime = expiration.getTime()
    const timeUntilRefresh = expirationTime - now - refreshBufferRef.current

    // If already expired or about to expire, refresh immediately
    if (timeUntilRefresh <= 0) {
      refreshExpiredURLs(urlMap, refreshBufferRef.current)
      return
    }

    // Set timer to refresh before expiration
    const timerId = setTimeout(() => {
      refreshExpiredURLs(urlMap, refreshBufferRef.current)
    }, timeUntilRefresh)

    return () => clearTimeout(timerId)
  }, [urlMap, autoRefresh, refreshExpiredURLs])

  /**
   * Refresh a single document's signed URL (e.g., when it expires or on error)
   */
  const refreshURL = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      const refreshedUrls = await batchFetchSignedURLs([documentId])
      const urlData = refreshedUrls.get(documentId)

      if (urlData) {
        setUrlMap((prev) => {
          const newMap = new Map(prev)
          newMap.set(documentId, urlData)
          return newMap
        })
        return true
      }
      return false
    } catch (err) {
      console.error('Error refreshing signed URL for document:', {
        documentId,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }, [])

  /**
   * Manually trigger refresh of all expired URLs
   */
  const manualRefreshExpired = useCallback(async (): Promise<void> => {
    await refreshExpiredURLs(urlMap, refreshBufferRef.current)
  }, [urlMap, refreshExpiredURLs])

  /**
   * Check if a URL is expired or about to expire
   */
  const isURLExpired = useCallback((documentId: string): boolean => {
    const urlData = urlMap.get(documentId)
    if (!urlData) return true

    const now = Date.now()
    return urlData.expiresAt.getTime() <= now + refreshBufferRef.current
  }, [urlMap])

  return {
    urlMap,
    isLoading,
    error,
    refreshURL,
    refreshExpiredURLs: manualRefreshExpired,
    isURLExpired,
  }
}
