/**
 * Debug endpoint for applications query
 * GET /api/debug/applications
 *
 * This endpoint provides detailed debugging information about why
 * the applications query might be failing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const GET = async (_request: NextRequest) => {
  try {
    const supabase = await createClient()

    // Step 1: Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        step: 'authentication',
        status: 'failed',
        error: 'User not authenticated',
      })
    }

    // Step 2: Check user profile
    const adminClient = createAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        step: 'user_profile',
        status: 'failed',
        error: profileError?.message || 'Profile not found',
        userId: user.id,
      })
    }

    // Step 3: Try simple applications query
    const { data: simpleApps, error: simpleError } = await supabase
      .from('applications')
      .select('id, created_by')
      .limit(5)

    // Step 4: Try full applications query (as used in the API)
    const { data: fullApps, error: fullError } = await supabase
      .from('applications')
      .select('*, building:buildings(*)')
      .order('created_at', { ascending: false })

    // Step 5: Check if broker_owned column exists
    const { data: columnTest, error: columnError } = await supabase
      .from('applications')
      .select('id, broker_owned')
      .limit(1)

    // Step 6: Check RLS policies (admin query to see all)
    const { data: allApps, error: adminError } = await adminClient
      .from('applications')
      .select('id, created_by, broker_owned, primary_applicant_id')
      .limit(5)

    return NextResponse.json({
      authentication: {
        status: 'success',
        userId: user.id,
        email: user.email,
      },
      userProfile: {
        status: 'success',
        profile,
      },
      simpleQuery: {
        status: simpleError ? 'failed' : 'success',
        error: simpleError?.message || null,
        count: simpleApps?.length || 0,
        data: simpleApps || null,
      },
      fullQuery: {
        status: fullError ? 'failed' : 'success',
        error: fullError?.message || null,
        count: fullApps?.length || 0,
        data: fullApps || null,
      },
      columnCheck: {
        status: columnError ? 'failed' : 'success',
        error: columnError?.message || null,
        message: columnError
          ? 'broker_owned column might not exist'
          : 'broker_owned column exists',
      },
      adminQuery: {
        status: adminError ? 'failed' : 'success',
        error: adminError?.message || null,
        count: allApps?.length || 0,
        totalApplicationsInDb: allApps?.length || 0,
      },
      diagnosis: fullError
        ? 'Query failed - check the fullQuery error above'
        : fullApps && fullApps.length === 0
          ? 'Query succeeded but no applications found for this user (this is expected for new users)'
          : 'Query succeeded and returned applications',
    })
  } catch (error) {
    console.error('Debug applications error:', error)
    return NextResponse.json(
      {
        step: 'unknown',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
