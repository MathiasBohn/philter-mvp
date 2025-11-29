/**
 * Next.js Proxy for Route Protection
 *
 * This proxy handles:
 * 1. Session refresh via Supabase Auth (for ALL routes including API)
 * 2. Route protection for authenticated routes
 * 3. Redirect logic for auth pages when already logged in
 * 4. Preserves original URL for post-login redirect
 *
 * Protected routes: All routes under /applications, /broker, /agent, /board, /my-applications, /settings
 * Public routes: Landing page, auth pages (/sign-in, /sign-up, etc.)
 * Auth routes: /sign-in, /sign-up, /forgot-password, /reset-password, /verify-email
 *
 * Note: In Next.js 16, the "middleware" file convention was deprecated in favor of "proxy"
 */

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Define route patterns
const protectedRoutes = [
  '/applications',
  '/broker',
  '/agent',
  '/board',
  '/my-applications',
  '/settings',
]

const authRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export default async function proxy(request: NextRequest) {
  // Update session and get user info
  // This refreshes the auth token and updates cookies for ALL requests
  const { response, user } = await updateSession(request)

  const path = request.nextUrl.pathname

  // For API routes, just return the response with refreshed cookies
  // API routes handle their own auth logic, we just ensure cookies are fresh
  if (path.startsWith('/api')) {
    return response
  }

  // Check if current route matches any protected pattern
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )

  // Check if current route is an auth page
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))

  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !user) {
    const url = new URL('/sign-in', request.url)
    // Preserve the original URL for redirect after login
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from auth pages to their intended destination
  // Note: We don't redirect to a default dashboard here since we don't have the user's role
  // in the proxy. Instead, we let the client-side handle role-based redirects.
  // Only redirect if there's an explicit redirectTo parameter.
  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    // If no redirectTo, let the sign-in page handle the redirect based on role
    // This allows the client-side auth context to determine the appropriate dashboard
  }

  return response
}

/**
 * Configure which routes proxy runs on
 *
 * This matcher excludes:
 * - Static files (_next/static)
 * - Image optimization files (_next/image)
 * - Favicon and other image assets
 * - Auth callback route (needs to set cookies without redirect)
 *
 * API routes are NOW INCLUDED to ensure session cookies are refreshed.
 * The proxy function handles API routes specially - it refreshes cookies
 * but skips redirect logic, allowing API routes to handle their own auth.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Image files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     * - auth/callback (needs to set cookies without redirect)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/callback).*)',
  ],
}
