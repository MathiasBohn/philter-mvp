/**
 * Supabase Auth Callback Route
 *
 * This route handles the callback from Supabase Auth flows:
 * - Magic link sign-in
 * - Email verification
 * - OAuth providers (if configured)
 * - Password reset
 *
 * It exchanges the authorization code for a user session and sets
 * the appropriate cookies before redirecting the user.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/my-applications'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      )
    }

    // Get the user to check verification status
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // If email is not confirmed, redirect to verify-email page
      if (!user.email_confirmed_at) {
        return NextResponse.redirect(new URL('/verify-email', requestUrl.origin))
      }

      // Handle production environment with load balancer
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }

      // Successful authentication - redirect to next page
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If no code or other issues, redirect to sign in
  return NextResponse.redirect(
    new URL('/sign-in?error=Invalid authentication callback', requestUrl.origin)
  )
}
