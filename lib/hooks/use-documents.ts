'use client'

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
    queryKey: queryKeys.documents(applicationId),
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/documents`)
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
    queryKey: queryKeys.document(id),
    queryFn: async () => {
      const response = await fetch(`/api/documents/${id}`)
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
        queryKeys.documents(applicationId),
        (old) => (old ? [...old, newDocument] : [newDocument])
      )

      // Invalidate application query to update document count
      queryClient.invalidateQueries({
        queryKey: queryKeys.application(applicationId)
      })

      toast({
        title: 'Document uploaded',
        description: `${newDocument.filename} has been uploaded successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      })
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
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update document status')
      }

      return response.json()
    },
    onSuccess: (updatedDocument) => {
      // Update documents list across all application queries
      queryClient.invalidateQueries({
        queryKey: ['documents']
      })
    },
  })
}

/**
 * Delete a document
 *
 * @param id - Document ID
 * @param applicationId - Application ID (for cache updates)
 * @returns Mutation result
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
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete document')
      }
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.documents(applicationId)
      })

      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(
        queryKeys.documents(applicationId)
      )

      // Optimistically remove document
      queryClient.setQueryData<Document[]>(
        queryKeys.documents(applicationId),
        (old) => old?.filter((doc) => doc.id !== id) || []
      )

      return { previousDocuments }
    },
    onSuccess: () => {
      // Invalidate application query to update document count
      queryClient.invalidateQueries({
        queryKey: queryKeys.application(applicationId)
      })

      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.',
      })
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents(applicationId),
          context.previousDocuments
        )
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to handle file upload with progress tracking
 *
 * This is a client-side only hook that handles the file upload process
 * including progress tracking and error handling.
 *
 * @param applicationId - Application ID
 * @returns Upload mutation with progress tracking
 */
export function useUploadDocument(applicationId: string) {
  const createDocument = useCreateDocument(applicationId)

  const uploadFile = async (
    file: File,
    category: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    // TODO: Implement actual file upload to Supabase Storage
    // This will be implemented in Phase 4: Document Storage
    // For now, we'll simulate the upload

    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        onProgress(i)
      }
    }

    // Create metadata entry
    const metadata: CreateDocumentInput = {
      filename: file.name,
      category,
      size: file.size,
      mime_type: file.type,
      storage_path: `documents/${applicationId}/${crypto.randomUUID()}-${file.name}`,
    }

    return createDocument.mutateAsync(metadata)
  }

  return {
    uploadFile,
    isUploading: createDocument.isPending,
    error: createDocument.error,
  }
}
