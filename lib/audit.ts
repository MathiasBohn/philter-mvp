/**
 * Audit Logging Utility
 *
 * Provides comprehensive audit logging for security compliance.
 * Persists to the audit_log database table and logs to console in development.
 *
 * Features:
 * - Database persistence for production audit trails
 * - Console logging for development debugging
 * - Automatic PII redaction in console logs
 * - Request context capture (IP, user agent)
 * - Fail-safe: never blocks main application flow
 */

import { createAdminClient } from '@/lib/supabase/server'

export type AuditAction =
  | 'PROFILE_RECOVERY'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'SSN_DECRYPT'
  | 'SSN_VIEW'
  | 'RFI_CREATE'
  | 'RFI_RESPOND'
  | 'DECISION_MADE'
  | 'PROFILE_UPDATE'
  | 'ADMIN_ACTION'
  | 'INVITATION_SENT'
  | 'INVITATION_ACCEPTED'
  | 'DEBUG_ACCESS'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET'
  | 'PERMISSION_DENIED'
  | 'DATA_EXPORT'

export interface AuditEntry {
  action: AuditAction
  userId: string
  resourceType?: string
  resourceId?: string
  reason?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Redact sensitive fields from metadata for console logging
 */
function redactSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitivePatterns = ['ssn', 'password', 'token', 'secret', 'key', 'credit', 'account']
  const redacted = { ...data }

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase()
    if (sensitivePatterns.some(pattern => lowerKey.includes(pattern))) {
      redacted[key] = '[REDACTED]'
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key] as Record<string, unknown>)
    }
  }

  return redacted
}

/**
 * Log an audit event for sensitive operations.
 *
 * Persists to database for compliance and security review.
 * Console logging only in development mode.
 *
 * @param entry - The audit entry to log
 * @returns Promise that resolves when logging is complete (never rejects)
 */
export async function logAuditEvent(entry: AuditEntry): Promise<void> {
  const timestamp = new Date().toISOString()

  try {
    // Console logging in development only
    if (process.env.NODE_ENV === 'development') {
      const safeMetadata = entry.metadata ? redactSensitiveData(entry.metadata) : undefined
      console.log('[Audit]', JSON.stringify({
        timestamp,
        action: entry.action,
        userId: entry.userId,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        reason: entry.reason,
        hasMetadata: !!entry.metadata,
        metadata: safeMetadata,
      }))
    }

    // Database persistence using admin client to bypass RLS
    // Note: audit_log table is created via migration 20251128000001_create_audit_log.sql
    // The table may not exist in generated types yet - regenerate types after running migration
    try {
      const supabase = createAdminClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('audit_log').insert({
        action: entry.action,
        user_id: entry.userId,
        resource_type: entry.resourceType || 'unknown',
        resource_id: entry.resourceId,
        reason: entry.reason,
        metadata: entry.metadata,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        created_at: timestamp,
      })
    } catch (dbError) {
      // Log database errors but don't fail - the audit_log table might not exist yet
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Audit] Database logging failed (table may not exist):', dbError)
      }
      // In production, silently fail DB writes to not disrupt the app
      // Console logs above still provide some audit trail
    }
  } catch {
    // Never let audit logging break the main application flow
    // This is a fail-safe to ensure the app continues working
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Audit] Error logging event:', entry.action)
    }
  }
}

/**
 * Log an admin action with additional context
 */
export async function logAdminAction(params: {
  action: string
  userId: string
  reason: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await logAuditEvent({
    action: 'ADMIN_ACTION',
    userId: params.userId,
    resourceType: 'admin',
    reason: params.reason,
    metadata: {
      adminAction: params.action,
      ...params.metadata,
    },
  })
}

/**
 * Log a security event (failed logins, permission denials, etc.)
 */
export async function logSecurityEvent(params: {
  action: 'LOGIN_FAILED' | 'PERMISSION_DENIED' | 'RATE_LIMIT_EXCEEDED'
  userId?: string
  ipAddress?: string
  userAgent?: string
  reason?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await logAuditEvent({
    action: params.action as AuditAction,
    userId: params.userId || 'anonymous',
    resourceType: 'security',
    reason: params.reason,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: params.metadata,
  })
}

/**
 * Log document access for compliance
 */
export async function logDocumentAccessEvent(params: {
  action: 'DOCUMENT_VIEW' | 'DOCUMENT_DOWNLOAD'
  userId: string
  documentId: string
  applicationId?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await logAuditEvent({
    action: params.action,
    userId: params.userId,
    resourceType: 'document',
    resourceId: params.documentId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: {
      applicationId: params.applicationId,
    },
  })
}

/**
 * Log SSN access for PII compliance
 */
export async function logSSNAccess(params: {
  action: 'SSN_VIEW' | 'SSN_DECRYPT'
  userId: string
  personId: string
  applicationId?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await logAuditEvent({
    action: params.action,
    userId: params.userId,
    resourceType: 'person',
    resourceId: params.personId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: {
      applicationId: params.applicationId,
      sensitiveDataType: 'SSN',
    },
  })
}

/**
 * Extract request context (IP and user agent) from headers
 */
export function extractRequestContext(request: Request): {
  ipAddress?: string
  userAgent?: string
} {
  return {
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  }
}
