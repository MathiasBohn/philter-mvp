/**
 * Environment Variable Validation for Supabase
 *
 * Validates required environment variables and throws errors in production
 * if they are missing. In development, logs warnings instead.
 *
 * IMPORTANT: Environment variables must be accessed with literal strings
 * (e.g., process.env.NEXT_PUBLIC_SUPABASE_URL) for Next.js to inline them
 * at build time. Dynamic access (process.env[key]) will NOT be inlined.
 */

interface EnvironmentValidationResult {
  isValid: boolean
  missingVars: string[]
}

/**
 * Validates that required public environment variables are set.
 * These are needed for both client and server Supabase clients.
 *
 * Uses direct access to env vars so Next.js can inline them at build time.
 *
 * @param throwOnMissing - Whether to throw an error if vars are missing (default: true in production)
 * @returns Validation result with list of missing variables
 */
export function validatePublicEnvVars(throwOnMissing?: boolean): EnvironmentValidationResult {
  const shouldThrow = throwOnMissing ?? process.env.NODE_ENV === 'production'

  // IMPORTANT: Access env vars directly with literal strings for Next.js inlining
  const missingVars: string[] = []

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

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

  // Check server-side env vars directly
  const missingServerVars: string[] = []

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missingServerVars.push('SUPABASE_SERVICE_ROLE_KEY')
  }

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
