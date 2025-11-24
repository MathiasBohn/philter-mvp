/**
 * Supabase Proxy Utilities
 *
 * Handles automatic session refresh and cookie management for authenticated users.
 * This should be called from the root proxy.ts file.
 *
 * Note: Next.js 16 deprecated "middleware" in favor of "proxy" convention.
 *
 * The updateSession function:
 * 1. Refreshes the user's auth session if needed
 * 2. Updates cookies with new session tokens
 * 3. Makes the updated session available to Server Components
 * 4. Returns both the response object and user object
 *
 * Usage in /proxy.ts:
 * ```typescript
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function proxy(request: NextRequest) {
 *   const { response, user } = await updateSession(request)
 *
 *   // Check if user is authenticated
 *   if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
 *     return NextResponse.redirect(new URL('/sign-in', request.url))
 *   }
 *
 *   return response
 * }
 *
 * export const config = {
 *   matcher: [
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create a response object that we can modify
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase environment variables are configured
  // If not (e.g., during build or local dev without Supabase), skip auth check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      response: supabaseResponse,
      user: null,
    }
  }

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for Server Components)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          // Create a new response to update cookies
          supabaseResponse = NextResponse.next({
            request,
          })

          // Set cookies on the response (for browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refreshing the auth token is important for keeping the user's session alive
  // This should be called before any auth-dependent operations
  // Add timeout to prevent hanging on invalid credentials
  let user: { id: string } | null = null
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )
    const authPromise = supabase.auth.getUser()

    const result = await Promise.race([authPromise, timeoutPromise]) as { data: { user: { id: string } | null } }
    user = result.data.user
  } catch (error) {
    console.error('Error getting user in middleware:', error)
    // Continue with null user - let the app handle unauthenticated state
  }

  // Optional: Add user info to request headers for easy access in Server Components
  if (user) {
    supabaseResponse.headers.set('x-user-id', user.id)
  }

  return {
    response: supabaseResponse,
    user,
  }
}

/**
 * Helper function to check if a user is authenticated
 * Can be used in proxy to protect routes
 *
 * Note: This is an alternative to using updateSession() directly.
 * The main proxy.ts uses updateSession() which returns both response and user.
 *
 * Usage:
 * ```typescript
 * import { isAuthenticated } from '@/lib/supabase/middleware'
 *
 * export async function proxy(request: NextRequest) {
 *   const { response, authenticated } = await isAuthenticated(request)
 *
 *   // Redirect to login if not authenticated
 *   if (!authenticated && request.nextUrl.pathname.startsWith('/dashboard')) {
 *     return NextResponse.redirect(new URL('/sign-in', request.url))
 *   }
 *
 *   return response
 * }
 * ```
 */
export async function isAuthenticated(request: NextRequest) {
  let authenticated = false
  let userId: string | undefined

  // Create a response object
  const response = NextResponse.next({
    request,
  })

  // Check if Supabase environment variables are configured
  // If not (e.g., during build or local dev without Supabase), return unauthenticated
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      response,
      authenticated: false,
      userId: undefined,
    }
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    authenticated = true
    userId = user.id
  }

  return {
    response,
    authenticated,
    userId,
  }
}
