/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in browser/client components.
 * Uses @supabase/ssr for automatic session management via cookies.
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
import { validatePublicEnvVars } from './env-validation'
import type { Database } from '@/lib/database.types'

export function createClient() {
  // Validate environment variables (throws in production if missing)
  validatePublicEnvVars()

  // Get environment variables (fallback to placeholders for graceful degradation in dev)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createBrowserClient<Database>(url, anonKey)
}
