/**
 * Debug API Route - User Profile Test
 *
 * Tests authenticated profile fetching to help diagnose client-side auth issues.
 * This endpoint:
 * 1. Checks if the user is authenticated
 * 2. Fetches the user profile from the users table
 * 3. Returns diagnostic information
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication status
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({
        success: false,
        step: 'auth_check',
        error: authError.message,
        message: 'Failed to get authenticated user',
      })
    }

    if (!authUser) {
      return NextResponse.json({
        success: false,
        step: 'no_auth_user',
        message: 'No authenticated user found. Please sign in first.',
        hint: 'This usually means cookies are not being sent with the request',
      })
    }

    // Try to fetch the user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profileError) {
      return NextResponse.json({
        success: false,
        step: 'profile_fetch',
        error: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        authUser: {
          id: authUser.id,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at,
        },
        message: 'Failed to fetch user profile from users table',
      })
    }

    if (!profile) {
      return NextResponse.json({
        success: false,
        step: 'no_profile',
        authUser: {
          id: authUser.id,
          email: authUser.email,
        },
        message: 'User profile not found in users table',
        hint: 'The database trigger may not have created the profile on signup',
      })
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: 'User profile fetched successfully!',
      authUser: {
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at: authUser.email_confirmed_at,
      },
      profile: {
        id: profile.id,
        role: profile.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
        created_at: profile.created_at,
      },
      diagnostics: {
        auth_id_matches_profile_id: authUser.id === profile.id,
        has_role: !!profile.role,
        role_value: profile.role,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        step: 'unexpected_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
