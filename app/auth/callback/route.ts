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

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // If "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/my-applications'
  if (!next.startsWith('/')) {
    // If "next" is not a relative URL, use the default
    next = '/my-applications'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // In local dev, no load balancer, so use origin directly
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // In production with load balancer, use forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    console.error('Auth callback error:', error)
  }

  // Return the user to sign-in page with error indication
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
