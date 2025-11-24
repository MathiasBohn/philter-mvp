import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

/**
 * Activity Log Utilities
 *
 * Provides functions for logging and querying user activities and system events
 * for compliance, security, and debugging purposes.
 */

/**
 * Supported action types for audit logging
 */
export type AuditAction =
  // Application actions
  | 'APPLICATION_CREATED'
  | 'APPLICATION_UPDATED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_DELETED'
  | 'APPLICATION_VIEWED'
  // Document actions
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_DELETED'
  // RFI actions
  | 'RFI_CREATED'
  | 'RFI_MESSAGE_SENT'
  | 'RFI_RESOLVED'
  // Decision actions
  | 'DECISION_CREATED'
  | 'DECISION_VIEWED'
  // User actions
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTERED'
  | 'USER_PROFILE_UPDATED'
  // Sensitive data access
  | 'SSN_DECRYPTED'
  | 'SSN_VIEWED'
  // Other
  | 'UNKNOWN'

/**
 * Entity types that can be audited
 */
export type EntityType =
  | 'application'
  | 'document'
  | 'rfi'
  | 'rfi_message'
  | 'decision'
  | 'user'
  | 'person'
  | 'other'

/**
 * Activity log entry structure
 */
export interface ActivityLogEntry {
  id: string
  user_id: string
  application_id?: string
  action: string
  entity_type: string
  entity_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

/**
 * Input for creating an activity log entry
 */
export interface CreateActivityLogInput {
  action: AuditAction
  entity_type?: EntityType
  entity_id?: string
  application_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Filters for querying activity logs
 */
export interface ActivityLogFilters {
  user_id?: string
  application_id?: string
  action?: AuditAction
  entity_type?: EntityType
  entity_id?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

/**
 * Log an activity to the database
 *
 * This function captures the current user, IP address, and user agent
 * automatically and creates an entry in the activity_log table.
 *
 * @param input - Activity log data
 * @returns Promise resolving to the created log entry
 *
 * @example
 * await logActivity({
 *   action: 'DOCUMENT_DOWNLOADED',
 *   entity_type: 'document',
 *   entity_id: documentId,
 *   application_id: applicationId,
 * })
 */
export async function logActivity(
  input: CreateActivityLogInput
): Promise<ActivityLogEntry | null> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('Attempted to log activity without authenticated user')
      return null
    }

    // Get request metadata
    const headersList = await headers()
    const ip_address = headersList.get('x-forwarded-for') || 'unknown'
    const user_agent = headersList.get('user-agent') || 'unknown'

    // Prepare log entry
    const logEntry = {
      user_id: user.id,
      action: input.action,
      entity_type: input.entity_type || 'other',
      entity_id: input.entity_id || null,
      application_id: input.application_id || null,
      old_values: input.old_values || null,
      new_values: input.new_values || null,
      ip_address,
      user_agent,
      created_at: new Date().toISOString(),
    }

    // Insert into activity_log table
    const { data, error } = await supabase
      .from('activity_log')
      .insert(logEntry)
      .select()
      .single()

    if (error) {
      console.error('Failed to log activity:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in logActivity:', error)
    return null
  }
}

/**
 * Query activity logs with filters
 *
 * Returns a paginated list of activity log entries based on the provided filters.
 * This function respects RLS policies and will only return logs the current user
 * is authorized to view.
 *
 * @param filters - Query filters
 * @returns Promise resolving to an array of log entries
 *
 * @example
 * // Get all logs for a specific application
 * const logs = await queryActivityLogs({
 *   application_id: 'app-123',
 *   limit: 50,
 * })
 *
 * @example
 * // Get document access logs for an application
 * const logs = await queryActivityLogs({
 *   application_id: 'app-123',
 *   action: 'DOCUMENT_DOWNLOADED',
 * })
 */
export async function queryActivityLogs(
  filters: ActivityLogFilters = {}
): Promise<ActivityLogEntry[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters.application_id) {
      query = query.eq('application_id', filters.application_id)
    }

    if (filters.action) {
      query = query.eq('action', filters.action)
    }

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type)
    }

    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id)
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date)
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date)
    }

    // Apply pagination
    const limit = filters.limit || 100
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Failed to query activity logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in queryActivityLogs:', error)
    return []
  }
}

/**
 * Get activity logs for a specific application
 *
 * Convenience function to get all logs related to an application.
 *
 * @param application_id - Application ID
 * @param limit - Maximum number of entries to return (default: 100)
 * @returns Promise resolving to an array of log entries
 */
export async function getApplicationActivityLogs(
  application_id: string,
  limit: number = 100
): Promise<ActivityLogEntry[]> {
  return queryActivityLogs({ application_id, limit })
}

/**
 * Get activity logs for a specific user
 *
 * Convenience function to get all logs for a user.
 *
 * @param user_id - User ID
 * @param limit - Maximum number of entries to return (default: 100)
 * @returns Promise resolving to an array of log entries
 */
export async function getUserActivityLogs(
  user_id: string,
  limit: number = 100
): Promise<ActivityLogEntry[]> {
  return queryActivityLogs({ user_id, limit })
}

/**
 * Get recent activity across the system
 *
 * Returns the most recent activity logs. Only accessible to admin users.
 *
 * @param limit - Maximum number of entries to return (default: 50)
 * @returns Promise resolving to an array of log entries
 */
export async function getRecentActivity(
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  return queryActivityLogs({ limit })
}

/**
 * Log a document access event
 *
 * Helper function specifically for logging document downloads/views.
 *
 * @param document_id - Document ID
 * @param application_id - Application ID
 * @param action - Type of access (DOWNLOADED or VIEWED)
 * @returns Promise resolving to the created log entry
 */
export async function logDocumentAccess(
  document_id: string,
  application_id: string,
  action: 'DOCUMENT_DOWNLOADED' | 'DOCUMENT_VIEWED'
): Promise<ActivityLogEntry | null> {
  return logActivity({
    action,
    entity_type: 'document',
    entity_id: document_id,
    application_id,
  })
}

/**
 * Log SSN access event
 *
 * Helper function specifically for logging SSN decryption/viewing.
 * This is critical for compliance and audit purposes.
 *
 * @param person_id - Person ID whose SSN was accessed
 * @param application_id - Application ID
 * @param action - Type of access (DECRYPTED or VIEWED)
 * @returns Promise resolving to the created log entry
 */
export async function logSSNAccess(
  person_id: string,
  application_id: string,
  action: 'SSN_DECRYPTED' | 'SSN_VIEWED'
): Promise<ActivityLogEntry | null> {
  return logActivity({
    action,
    entity_type: 'person',
    entity_id: person_id,
    application_id,
  })
}

/**
 * Log a decision event
 *
 * Helper function specifically for logging application decisions.
 *
 * @param decision_id - Decision record ID
 * @param application_id - Application ID
 * @param decision_type - Type of decision (approve, conditional, deny)
 * @returns Promise resolving to the created log entry
 */
export async function logDecision(
  decision_id: string,
  application_id: string,
  decision_type: string
): Promise<ActivityLogEntry | null> {
  return logActivity({
    action: 'DECISION_CREATED',
    entity_type: 'decision',
    entity_id: decision_id,
    application_id,
    new_values: { decision: decision_type },
  })
}
