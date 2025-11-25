/**
 * Debug endpoint to check database schema
 * GET /api/debug/database-schema
 *
 * This endpoint checks if required columns exist in the applications table
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkDebugAccess } from '@/lib/api/debug-protection'

export const GET = async (_request: NextRequest) => {
  // Check debug access (admin-only in production)
  const access = await checkDebugAccess()
  if (!access.allowed) return access.response

  try {
    const supabase = await createClient()

    // Query the database schema to check for broker_owned column
    // Try a direct query to verify the column exists
    const { data: testQuery, error: testError } = await supabase
      .from('applications')
      .select('id, created_by, broker_owned, primary_applicant_id')
      .limit(1)

    return NextResponse.json({
      status: testError ? 'error' : 'success',
      message: testError
        ? 'Some columns might not exist in the applications table'
        : 'Schema check passed - required columns exist',
      error: testError?.message || null,
      testQuery: testQuery || null,
    })
  } catch (error) {
    console.error('Database schema check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
