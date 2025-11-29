/**
 * Supabase/PostgreSQL Error Code Constants (Type Safety Fix 3.8)
 *
 * Provides typed constants for common Supabase and PostgreSQL error codes
 * to replace magic strings throughout the codebase.
 */

/**
 * Common Supabase PostgREST and PostgreSQL error codes
 */
export const SUPABASE_ERROR_CODES = {
  /** Row not found - PostgREST returns this when .single() finds no rows */
  NOT_FOUND: 'PGRST116',

  /** Unique constraint violation - e.g., duplicate key */
  UNIQUE_VIOLATION: '23505',

  /** Foreign key constraint violation */
  FK_VIOLATION: '23503',

  /** Permission denied - RLS policy blocked the operation */
  PERMISSION_DENIED: '42501',

  /** Invalid input syntax */
  INVALID_INPUT: '22P02',

  /** Check constraint violation */
  CHECK_VIOLATION: '23514',

  /** Not null violation */
  NOT_NULL_VIOLATION: '23502',

  /** String data right truncation */
  STRING_DATA_TRUNCATION: '22001',

  /** Numeric value out of range */
  NUMERIC_OUT_OF_RANGE: '22003',

  /** Division by zero */
  DIVISION_BY_ZERO: '22012',

  /** Insufficient privilege */
  INSUFFICIENT_PRIVILEGE: '42501',
} as const

/**
 * Type for Supabase error codes
 */
export type SupabaseErrorCode = typeof SUPABASE_ERROR_CODES[keyof typeof SUPABASE_ERROR_CODES]

/**
 * Interface for Supabase error objects
 */
export interface SupabaseError {
  code?: string
  message?: string
  details?: string
  hint?: string
}

/**
 * Check if error is a "not found" error (PGRST116)
 */
export function isNotFoundError(error: SupabaseError | null | undefined): boolean {
  return error?.code === SUPABASE_ERROR_CODES.NOT_FOUND
}

/**
 * Check if error is a unique constraint violation (23505)
 */
export function isUniqueViolationError(error: SupabaseError | null | undefined): boolean {
  return error?.code === SUPABASE_ERROR_CODES.UNIQUE_VIOLATION
}

/**
 * Check if error is a foreign key violation (23503)
 */
export function isForeignKeyViolationError(error: SupabaseError | null | undefined): boolean {
  return error?.code === SUPABASE_ERROR_CODES.FK_VIOLATION
}

/**
 * Check if error is a permission denied error (42501)
 */
export function isPermissionDeniedError(error: SupabaseError | null | undefined): boolean {
  return error?.code === SUPABASE_ERROR_CODES.PERMISSION_DENIED
}

/**
 * Check if error is an invalid input error (22P02)
 */
export function isInvalidInputError(error: SupabaseError | null | undefined): boolean {
  return error?.code === SUPABASE_ERROR_CODES.INVALID_INPUT
}

/**
 * Get a user-friendly message for common Supabase errors
 */
export function getErrorMessage(error: SupabaseError | null | undefined): string {
  if (!error) {
    return 'An unknown error occurred'
  }

  switch (error.code) {
    case SUPABASE_ERROR_CODES.NOT_FOUND:
      return 'The requested resource was not found'
    case SUPABASE_ERROR_CODES.UNIQUE_VIOLATION:
      return 'A record with this information already exists'
    case SUPABASE_ERROR_CODES.FK_VIOLATION:
      return 'This operation references a resource that does not exist'
    case SUPABASE_ERROR_CODES.PERMISSION_DENIED:
      return 'You do not have permission to perform this action'
    case SUPABASE_ERROR_CODES.INVALID_INPUT:
      return 'Invalid input provided'
    case SUPABASE_ERROR_CODES.NOT_NULL_VIOLATION:
      return 'A required field is missing'
    default:
      return error.message || 'An error occurred'
  }
}
