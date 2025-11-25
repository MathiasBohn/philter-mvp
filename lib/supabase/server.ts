/**
 * Supabase Server Client
 *
 * Creates a Supabase client for use in Server Components and Route Handlers.
 * Uses @supabase/ssr for automatic session management via cookies.
 *
 * Usage in Server Components:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server'
 *
 * async function MyServerComponent() {
 *   const supabase = await createClient()
 *   const { data, error } = await supabase.from('applications').select('*')
 *   return <div>{data?.length} applications</div>
 * }
 * ```
 *
 * Usage in Route Handlers:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server'
 * import { NextResponse } from 'next/server'
 *
 * export async function GET() {
 *   const supabase = await createClient()
 *   const { data, error } = await supabase.from('applications').select('*')
 *   return NextResponse.json({ data, error })
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validatePublicEnvVars, validateServerEnvVars } from './env-validation'
import type { Database } from '@/lib/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  // Validate environment variables (throws in production if missing)
  validatePublicEnvVars()

  // Get environment variables (fallback to placeholders for graceful degradation in dev)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware/proxy refreshing user sessions.
            // Log in development for debugging purposes.
            if (process.env.NODE_ENV === 'development') {
              console.debug(
                '[Supabase Server] Cookie setAll called from Server Component context. ' +
                'This is expected behavior when using Server Components with Supabase Auth. ' +
                'The proxy.ts handles session refresh.',
                { cookieCount: cookiesToSet.length, error }
              )
            }
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase admin client with service role key
 * for server-side operations that bypass RLS.
 *
 * ⚠️ WARNING: This client bypasses Row Level Security.
 * Only use for admin operations where RLS needs to be bypassed.
 * Never expose this client to the browser.
 *
 * Usage:
 * ```typescript
 * import { createAdminClient } from '@/lib/supabase/server'
 *
 * const supabase = createAdminClient()
 * const { data } = await supabase.from('applications').select('*') // Bypasses RLS
 * ```
 */
export function createAdminClient() {
  // Validate all server environment variables (always throws if missing)
  validateServerEnvVars()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for admin client
        },
      },
    }
  )
}
