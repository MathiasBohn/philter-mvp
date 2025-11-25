/**
 * Transaction RPC Functions
 *
 * Provides type-safe wrappers for Supabase RPC functions that perform
 * atomic database operations within transactions.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Result type for RPC function calls
 */
export type RPCResult<T = Record<string, unknown>> = {
  success: boolean
  error?: string
} & T

/**
 * Submit application result type
 */
export type SubmitApplicationResult = RPCResult<{
  application_id?: string
  status?: string
  submitted_at?: string
}>

/**
 * Record decision result type
 */
export type RecordDecisionResult = RPCResult<{
  decision_id?: string
  application_id?: string
  decision?: string
  status?: string
}>

/**
 * Create document metadata result type
 */
export type CreateDocumentResult = RPCResult<{
  document_id?: string
  filename?: string
  category?: string
}>

/**
 * Delete document result type
 */
export type DeleteDocumentResult = RPCResult<{
  document_id?: string
  storage_path?: string
}>

/**
 * Update financial entries result type
 */
export type UpdateFinancialsResult = RPCResult<{
  application_id?: string
  entries_processed?: number
}>

/**
 * Create RFI result type
 */
export type CreateRFIResult = RPCResult<{
  rfi_id?: string
  message_id?: string
  application_id?: string
}>

/**
 * Submit an application atomically
 *
 * This function:
 * 1. Validates the user has permission
 * 2. Checks application is complete
 * 3. Updates status to SUBMITTED
 * 4. Locks the application
 * 5. Logs the submission
 *
 * All operations happen in a single transaction.
 *
 * @param applicationId - The application ID to submit
 * @returns Result with success/error and application details
 */
export async function submitApplication(
  applicationId: string
): Promise<SubmitApplicationResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('submit_application', {
    p_application_id: applicationId,
  })

  if (error) {
    console.error('Error submitting application:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return data as SubmitApplicationResult
}

/**
 * Record an application decision atomically
 *
 * This function:
 * 1. Validates the user is an admin
 * 2. Creates the decision record
 * 3. Updates application status
 * 4. Locks the application
 * 5. Logs the decision
 *
 * All operations happen in a single transaction.
 *
 * @param params - Decision parameters
 * @returns Result with success/error and decision details
 */
export async function recordApplicationDecision(params: {
  applicationId: string
  decision: 'APPROVE' | 'CONDITIONAL' | 'DENY'
  conditions?: string
  reasonCodes?: string[]
  usesConsumerReport?: boolean
  notes?: string
}): Promise<RecordDecisionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('record_application_decision', {
    p_application_id: params.applicationId,
    p_decision: params.decision,
    p_conditions: params.conditions,
    p_reason_codes: params.reasonCodes ? JSON.stringify(params.reasonCodes) : undefined,
    p_uses_consumer_report: params.usesConsumerReport ?? false,
    p_notes: params.notes,
  })

  if (error) {
    console.error('Error recording decision:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return data as RecordDecisionResult
}

/**
 * Create document metadata after successful storage upload
 *
 * This function:
 * 1. Validates the user has upload permission
 * 2. Creates the document record
 * 3. Logs the upload
 *
 * All operations happen in a single transaction.
 *
 * @param params - Document parameters
 * @returns Result with success/error and document details
 */
export async function createDocumentMetadata(params: {
  applicationId: string
  filename: string
  storagePath: string
  category: string
  size: number
  mimeType: string
}): Promise<CreateDocumentResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('create_document_metadata', {
    p_application_id: params.applicationId,
    p_filename: params.filename,
    p_storage_path: params.storagePath,
    p_category: params.category,
    p_size: params.size,
    p_mime_type: params.mimeType,
  })

  if (error) {
    console.error('Error creating document metadata:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return data as CreateDocumentResult
}

/**
 * Delete a document atomically
 *
 * This function:
 * 1. Validates the user has delete permission
 * 2. Soft deletes the document record
 * 3. Returns the storage path for cleanup
 * 4. Logs the deletion
 *
 * All operations happen in a single transaction.
 *
 * @param documentId - The document ID to delete
 * @returns Result with success/error and storage path
 */
export async function deleteDocumentAtomic(
  documentId: string
): Promise<DeleteDocumentResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('delete_document', {
    p_document_id: documentId,
  })

  if (error) {
    console.error('Error deleting document:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return data as DeleteDocumentResult
}

/**
 * Financial entry for bulk update
 */
export type FinancialEntryInput = {
  entry_type: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  institution?: string
  account_number_last4?: string
  description?: string
  is_liquid?: boolean
  monthly_payment?: number
}

/**
 * Update all financial entries for an application atomically
 *
 * This function:
 * 1. Validates the user has edit permission
 * 2. Deletes all existing financial entries
 * 3. Creates new entries from the provided array
 * 4. Logs the update
 *
 * All operations happen in a single transaction (replace-all pattern).
 *
 * @param applicationId - The application ID
 * @param entries - Array of financial entries
 * @returns Result with success/error and count of processed entries
 */
export async function updateFinancialEntries(
  applicationId: string,
  entries: FinancialEntryInput[]
): Promise<UpdateFinancialsResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('update_financial_entries', {
    p_application_id: applicationId,
    p_entries: entries,
  })

  if (error) {
    console.error('Error updating financial entries:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return data as UpdateFinancialsResult
}

/**
 * Create an RFI with its initial message atomically
 *
 * This function:
 * 1. Validates the user is an admin
 * 2. Creates the RFI record
 * 3. Creates the initial message
 * 4. Updates application status to RFI
 * 5. Logs the creation
 *
 * All operations happen in a single transaction.
 *
 * @param params - RFI parameters
 * @returns Result with success/error and RFI details
 */
export async function createRFIWithMessage(params: {
  applicationId: string
  sectionKey: string
  message: string
  assigneeRole?: 'APPLICANT' | 'BROKER'
}): Promise<CreateRFIResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('create_rfi_with_message', {
    p_application_id: params.applicationId,
    p_section_key: params.sectionKey,
    p_message: params.message,
    p_assignee_role: params.assigneeRole || 'APPLICANT',
  })

  if (error) {
    console.error('Error creating RFI:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return data as CreateRFIResult
}
