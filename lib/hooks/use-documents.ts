'use client'

import { useState, useEffect } from 'react'
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
 * @deprecated Use useDeleteDocumentMutation for more flexibility
 */
export function useDeleteDocument(
  id: string,
  applicationId: string
): UseMutationResult<void, Error, void> {
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
      console.error('Upload failed:', error)
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
 * Hook to fetch and manage signed URLs for documents with automatic expiration handling
 *
 * Features:
 * - Fetches signed URLs for all documents on mount
 * - Automatically refreshes URLs before they expire (5 minutes before expiration)
 * - Provides manual refresh function for individual documents
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
  const [urlMap, setUrlMap] = useState<Map<string, { url: string; expiresAt: Date }>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const refreshBuffer = options?.refreshBuffer ?? 5 * 60 * 1000 // 5 minutes default
  const autoRefresh = options?.autoRefresh ?? true

  // Fetch all signed URLs on mount or when documents change
  useEffect(() => {
    if (!documents || documents.length === 0) {
      setUrlMap(new Map())
      return
    }

    const fetchSignedURLs = async () => {
      setIsLoading(true)
      const newUrlMap = new Map<string, { url: string; expiresAt: Date }>()

      try {
        await Promise.all(
          documents.map(async (doc) => {
            try {
              const response = await fetch(`/api/documents/${doc.id}`, {
                credentials: 'include',
              })
              if (response.ok) {
                const data = await response.json()
                newUrlMap.set(doc.id, {
                  url: data.url,
                  expiresAt: new Date(data.expiresAt),
                })
              } else {
                console.error(`Failed to fetch signed URL for document ${doc.id}`)
              }
            } catch (error) {
              console.error(`Error fetching signed URL for document ${doc.id}:`, error)
            }
          })
        )

        setUrlMap(newUrlMap)
      } catch (error) {
        console.error('Error fetching signed URLs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignedURLs()
  }, [documents])

  /**
   * Refresh all URLs that are expired or about to expire
   */
  const refreshExpiredURLs = async () => {
    const now = new Date()
    const expirationThreshold = new Date(now.getTime() + refreshBuffer)

    const expiredDocs: string[] = []
    urlMap.forEach((urlData, docId) => {
      if (urlData.expiresAt <= expirationThreshold) {
        expiredDocs.push(docId)
      }
    })

    if (expiredDocs.length === 0) return

    // Refresh all expired URLs in parallel
    await Promise.all(expiredDocs.map((docId) => refreshURL(docId)))
  }

  // Auto-refresh URLs before they expire
  useEffect(() => {
    if (!autoRefresh || urlMap.size === 0) {
      return
    }

    // Find the earliest expiration time
    let earliestExpiration: Date | null = null
    let documentToRefresh: string | null = null

    urlMap.forEach((urlData, docId) => {
      if (!earliestExpiration || urlData.expiresAt < earliestExpiration) {
        earliestExpiration = urlData.expiresAt
        documentToRefresh = docId
      }
    })

    if (!earliestExpiration || !documentToRefresh) {
      return
    }

    // Calculate time until we need to refresh (refresh before expiration)
    const now = new Date()
    // TypeScript needs help here since the narrowing from null check doesn't persist
    const expirationTime = earliestExpiration as Date
    const timeUntilRefresh = expirationTime.getTime() - now.getTime() - refreshBuffer

    // If already expired or about to expire, refresh immediately
    if (timeUntilRefresh <= 0) {
      // Use inline refresh logic to avoid dependency issues
      const refreshNow = async () => {
        const threshold = new Date(Date.now() + refreshBuffer)
        const expiredDocs: string[] = []
        urlMap.forEach((urlData, docId) => {
          if (urlData.expiresAt <= threshold) {
            expiredDocs.push(docId)
          }
        })
        if (expiredDocs.length > 0) {
          for (const docId of expiredDocs) {
            try {
              const response = await fetch(`/api/documents/${docId}`, {
                credentials: 'include',
              })
              if (response.ok) {
                const data = await response.json()
                setUrlMap((prev) => {
                  const newMap = new Map(prev)
                  newMap.set(docId, {
                    url: data.url,
                    expiresAt: new Date(data.expiresAt),
                  })
                  return newMap
                })
              }
            } catch (error) {
              console.error(`Error refreshing signed URL for document ${docId}:`, error)
            }
          }
        }
      }
      refreshNow()
      return
    }

    // Set timer to refresh before expiration
    const timerId = setTimeout(() => {
      // Use inline refresh logic in timeout to avoid stale closure
      const refreshOnTimeout = async () => {
        const threshold = new Date(Date.now() + refreshBuffer)
        const expiredDocs: string[] = []
        urlMap.forEach((urlData, docId) => {
          if (urlData.expiresAt <= threshold) {
            expiredDocs.push(docId)
          }
        })
        if (expiredDocs.length > 0) {
          for (const docId of expiredDocs) {
            try {
              const response = await fetch(`/api/documents/${docId}`, {
                credentials: 'include',
              })
              if (response.ok) {
                const data = await response.json()
                setUrlMap((prev) => {
                  const newMap = new Map(prev)
                  newMap.set(docId, {
                    url: data.url,
                    expiresAt: new Date(data.expiresAt),
                  })
                  return newMap
                })
              }
            } catch (error) {
              console.error(`Error refreshing signed URL for document ${docId}:`, error)
            }
          }
        }
      }
      refreshOnTimeout()
    }, timeUntilRefresh)

    return () => clearTimeout(timerId)
  }, [urlMap, autoRefresh, refreshBuffer])

  /**
   * Refresh a single document's signed URL (e.g., when it expires or on error)
   */
  const refreshURL = async (documentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUrlMap((prev) => {
          const newMap = new Map(prev)
          newMap.set(documentId, {
            url: data.url,
            expiresAt: new Date(data.expiresAt),
          })
          return newMap
        })
        return true
      }
      return false
    } catch (error) {
      console.error(`Error refreshing signed URL for document ${documentId}:`, error)
      return false
    }
  }

  /**
   * Check if a URL is expired or about to expire
   */
  const isURLExpired = (documentId: string): boolean => {
    const urlData = urlMap.get(documentId)
    if (!urlData) return true

    const now = new Date()
    return urlData.expiresAt <= new Date(now.getTime() + refreshBuffer)
  }

  return {
    urlMap,
    isLoading,
    refreshURL,
    refreshExpiredURLs,
    isURLExpired,
  }
}
