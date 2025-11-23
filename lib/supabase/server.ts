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

export async function createClient() {
  const cookieStore = await cookies()

  // Check if Supabase environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase environment variables are not configured. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    )
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
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
  // Check if Supabase environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase environment variables are not configured. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    )
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
