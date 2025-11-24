/**
 * Document Data Access Layer
 *
 * Provides functions for managing document metadata in the database.
 * Note: Actual file storage operations are handled by lib/supabase-storage.ts
 */

import { createClient } from '@/lib/supabase/server'
import type { Document, DocumentCategory, DocumentStatus } from '@/lib/types'

/**
 * Input type for creating a new document record
 */
export type DocumentMetadata = {
  applicationId: string
  filename: string
  category: DocumentCategory
  size: number
  mimeType: string
  storagePath: string
}

/**
 * Create a document metadata record
 *
 * @param metadata - Document metadata
 * @returns The created document record
 */
export async function createDocument(
  metadata: DocumentMetadata
): Promise<Document> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      application_id: metadata.applicationId,
      filename: metadata.filename,
      category: metadata.category,
      size: metadata.size,
      mime_type: metadata.mimeType,
      storage_path: metadata.storagePath,
      status: 'UPLOADED' as DocumentStatus,
      uploaded_by: user.id,
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw new Error(`Failed to create document: ${error.message}`)
  }

  return {
    id: data.id,
    category: data.category as DocumentCategory,
    filename: data.filename,
    size: data.size,
    mimeType: data.mime_type,
    uploadedAt: new Date(data.uploaded_at),
    uploadedBy: data.uploaded_by,
    status: data.status as DocumentStatus,
  }
}

/**
 * Get all documents for an application
 *
 * @param applicationId - The application ID
 * @returns Array of documents
 */
export async function getDocuments(applicationId: string): Promise<Document[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('application_id', applicationId)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  return (data || []).map(doc => ({
    id: doc.id,
    category: doc.category as DocumentCategory,
    filename: doc.filename,
    size: doc.size,
    mimeType: doc.mime_type,
    uploadedAt: new Date(doc.uploaded_at),
    uploadedBy: doc.uploaded_by,
    status: doc.status as DocumentStatus,
    notes: doc.notes,
  }))
}

/**
 * Get a single document by ID
 *
 * @param id - The document ID
 * @returns The document or null if not found
 */
export async function getDocument(id: string): Promise<Document | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching document:', error)
    throw new Error(`Failed to fetch document: ${error.message}`)
  }

  return {
    id: data.id,
    category: data.category as DocumentCategory,
    filename: data.filename,
    size: data.size,
    mimeType: data.mime_type,
    uploadedAt: new Date(data.uploaded_at),
    uploadedBy: data.uploaded_by,
    status: data.status as DocumentStatus,
    notes: data.notes,
  }
}

/**
 * Update document status
 *
 * @param id - The document ID
 * @param status - The new status
 * @returns The updated document
 */
export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus
): Promise<Document> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating document status:', error)
    throw new Error(`Failed to update document status: ${error.message}`)
  }

  return {
    id: data.id,
    category: data.category as DocumentCategory,
    filename: data.filename,
    size: data.size,
    mimeType: data.mime_type,
    uploadedAt: new Date(data.uploaded_at),
    uploadedBy: data.uploaded_by,
    status: data.status as DocumentStatus,
    notes: data.notes,
  }
}

/**
 * Delete a document (soft delete)
 * Note: This only deletes the metadata. File deletion from storage should be handled separately.
 *
 * @param id - The document ID
 */
export async function deleteDocument(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting document:', error)
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

/**
 * Get the storage path for a document
 *
 * @param id - The document ID
 * @returns The storage path or null if not found
 */
export async function getDocumentStoragePath(id: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching document storage path:', error)
    throw new Error(`Failed to fetch document storage path: ${error.message}`)
  }

  return data.storage_path
}
