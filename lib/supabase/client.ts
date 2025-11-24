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

export function createClient() {
  // Check if Supabase environment variables are configured
  // If not configured, create a dummy client that will gracefully fail
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  // Log warning in development if env vars are missing
  if ((!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
      process.env.NODE_ENV === 'development') {
    console.warn(
      'Supabase environment variables are not configured. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    )
  }

  return createBrowserClient(url, anonKey)
}
