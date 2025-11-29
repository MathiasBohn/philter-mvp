/**
 * Document Data Access Layer
 *
 * Provides functions for managing document metadata in the database.
 * Note: Actual file storage operations are handled by lib/supabase-storage.ts
 */

import { createClient } from '@/lib/supabase/server'
import type { Document, DocumentCategory, DocumentStatus } from '@/lib/types'
import type { Database } from '@/lib/database.types'
import { isNotFoundError } from '@/lib/constants/supabase-errors'

type DbDocumentCategory = Database['public']['Enums']['document_category_enum']
type DbDocumentStatus = Database['public']['Enums']['document_status_enum']

/**
 * Valid database document categories
 */
const VALID_DB_CATEGORIES: readonly DbDocumentCategory[] = [
  'GOVERNMENT_ID',
  'BANK_STATEMENT',
  'TAX_RETURN',
  'PAY_STUB',
  'EMPLOYMENT_LETTER',
  'REFERENCE_LETTER',
  'OTHER_FINANCIAL',
  'OTHER',
] as const

/**
 * Valid database document statuses
 */
const VALID_DB_STATUSES: readonly DbDocumentStatus[] = [
  'UPLOADING',
  'PROCESSING',
  'COMPLETE',
  'ERROR',
] as const

/**
 * Map application DocumentCategory to database category
 * Falls back to 'OTHER' for categories not in the database enum
 */
function toDbCategory(category: DocumentCategory): DbDocumentCategory {
  const categoryStr = category as string
  if (VALID_DB_CATEGORIES.includes(categoryStr as DbDocumentCategory)) {
    return categoryStr as DbDocumentCategory
  }
  // Map application-specific categories to database equivalents
  const categoryMapping: Record<string, DbDocumentCategory> = {
    'PAYSTUB': 'PAY_STUB',
    'W2': 'OTHER_FINANCIAL',
    'BUILDING_FORM': 'OTHER',
  }
  return categoryMapping[categoryStr] || 'OTHER'
}

/**
 * Map application DocumentStatus to database status
 * Falls back to 'PROCESSING' for unknown statuses
 */
function toDbStatus(status: DocumentStatus): DbDocumentStatus {
  const statusStr = status as string
  // Map from application status to DB status
  const statusMapping: Record<string, DbDocumentStatus> = {
    'PENDING': 'PROCESSING',
    'UPLOADED': 'COMPLETE',
    'VERIFIED': 'COMPLETE',
    'REJECTED': 'ERROR',
  }
  if (VALID_DB_STATUSES.includes(statusStr as DbDocumentStatus)) {
    return statusStr as DbDocumentStatus
  }
  return statusMapping[statusStr] || 'PROCESSING'
}

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
      category: toDbCategory(metadata.category),
      size: metadata.size,
      mime_type: metadata.mimeType,
      storage_path: metadata.storagePath,
      status: 'COMPLETE',
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
    if (isNotFoundError(error)) {
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
    .update({ status: toDbStatus(status) })
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
    if (isNotFoundError(error)) {
      return null
    }
    console.error('Error fetching document storage path:', error)
    throw new Error(`Failed to fetch document storage path: ${error.message}`)
  }

  return data.storage_path
}
