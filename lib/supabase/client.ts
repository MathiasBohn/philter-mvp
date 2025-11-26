/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in browser/client components.
 * Uses @supabase/ssr for automatic session management via cookies.
 *
 * IMPORTANT: This uses a singleton pattern to prevent creating multiple
 * client instances, which can cause infinite re-renders and connection issues.
 *
 * Usage:
 * ```typescript
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data, error } = await supabase.from('applications').select('*')
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { validatePublicEnvVars } from './env-validation'
import type { Database } from '@/lib/database.types'

// Singleton instance - prevents multiple client creation and infinite re-renders
let browserClient: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  // Return existing client if already created
  if (browserClient) {
    return browserClient
  }

  // Validate environment variables (throws in production if missing)
  validatePublicEnvVars()

  // Get environment variables (fallback to placeholders for graceful degradation in dev)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  // Create and cache the client
  browserClient = createBrowserClient<Database>(url, anonKey)

  return browserClient
}
