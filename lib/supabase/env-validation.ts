/**
 * Environment Variable Validation for Supabase
 *
 * Validates required environment variables and throws errors in production
 * if they are missing. In development, logs warnings instead.
 */

interface EnvironmentValidationResult {
  isValid: boolean
  missingVars: string[]
}

const REQUIRED_PUBLIC_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const REQUIRED_SERVER_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

/**
 * Validates that required public environment variables are set.
 * These are needed for both client and server Supabase clients.
 *
 * @param throwOnMissing - Whether to throw an error if vars are missing (default: true in production)
 * @returns Validation result with list of missing variables
 */
export function validatePublicEnvVars(throwOnMissing?: boolean): EnvironmentValidationResult {
  const shouldThrow = throwOnMissing ?? process.env.NODE_ENV === 'production'

  const missingVars = REQUIRED_PUBLIC_VARS.filter(
    (key) => !process.env[key]
  )

  if (missingVars.length > 0) {
    const message = `Missing required environment variables: ${missingVars.join(', ')}`

    if (shouldThrow) {
      throw new Error(message)
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`[Supabase] ${message}`)
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  }
}

/**
 * Validates that required server-side environment variables are set.
 * These are needed for admin operations that bypass RLS.
 *
 * @param throwOnMissing - Whether to throw an error if vars are missing (default: true)
 * @returns Validation result with list of missing variables
 */
export function validateServerEnvVars(throwOnMissing = true): EnvironmentValidationResult {
  // First validate public vars
  const publicResult = validatePublicEnvVars(throwOnMissing)

  const missingServerVars = REQUIRED_SERVER_VARS.filter(
    (key) => !process.env[key]
  )

  const allMissingVars = [...publicResult.missingVars, ...missingServerVars]

  if (missingServerVars.length > 0) {
    const message = `Missing required server environment variables: ${missingServerVars.join(', ')}`

    if (throwOnMissing) {
      throw new Error(message)
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`[Supabase Admin] ${message}`)
    }
  }

  return {
    isValid: allMissingVars.length === 0,
    missingVars: allMissingVars,
  }
}

/**
 * Check if Supabase is properly configured (non-throwing)
 * Useful for conditional rendering or feature flags
 */
export function isSupabaseConfigured(): boolean {
  return validatePublicEnvVars(false).isValid
}

/**
 * Check if Supabase admin features are available (non-throwing)
 * Useful for conditional rendering or feature flags
 */
export function isSupabaseAdminConfigured(): boolean {
  return validateServerEnvVars(false).isValid
}
