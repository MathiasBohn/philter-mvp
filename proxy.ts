/**
 * Next.js Proxy for Route Protection
 *
 * This proxy handles:
 * 1. Session refresh via Supabase Auth
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
  const { response, user } = await updateSession(request)

  const path = request.nextUrl.pathname

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

  // Redirect authenticated users from auth pages to home (or their intended destination)
  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const destination = redirectTo || '/'
    return NextResponse.redirect(new URL(destination, request.url))
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
 * - Auth callback route (needs to set cookies)
 * - API routes (handled by their own auth logic)
 *
 * API routes are excluded because:
 * 1. They have their own auth logic via createClient()
 * 2. The proxy was causing issues with client-side fetch requests
 * 3. Next.js 16 recommends excluding API routes from proxy
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (have their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Image files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     * - auth/callback (needs to set cookies without redirect)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/callback).*)',
  ],
}
