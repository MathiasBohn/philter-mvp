/**
 * Debug endpoint to check database schema
 * GET /api/debug/database-schema
 *
 * This endpoint checks if required columns exist in the applications table
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const GET = async (_request: NextRequest) => {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Query the database schema to check for broker_owned column
    const { data: schemaCheck, error: schemaError } = await supabase
      .rpc('check_applications_schema')

    if (schemaError) {
      // If the function doesn't exist, try a direct query
      const { data: testQuery, error: testError } = await supabase
        .from('applications')
        .select('id, created_by, broker_owned, primary_applicant_id')
        .limit(1)

      return NextResponse.json({
        status: testError ? 'error' : 'success',
        message: testError
          ? 'broker_owned column might not exist'
          : 'broker_owned column exists',
        error: testError?.message || null,
        testQuery: testQuery || null,
      })
    }

    return NextResponse.json({
      status: 'success',
      schema: schemaCheck,
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
