/**
 * Debug Test Create Application API Route
 *
 * POST /api/debug/test-create-application - Test creating an application
 *
 * This endpoint helps diagnose issues with application creation by
 * providing detailed error information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: [],
  }

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { buildingCode, transactionType } = body
    results.input = { buildingCode, transactionType }

    // Step 1: Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      results.steps = [...(results.steps as unknown[]), { step: 'auth', status: 'failed', error: authError?.message || 'No user' }]
      return NextResponse.json({ ...results, error: 'Not authenticated' }, { status: 401 })
    }

    results.steps = [...(results.steps as unknown[]), { step: 'auth', status: 'success', userId: user.id, email: user.email }]

    // Step 2: Check user profile
    const adminClient = createAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('users')
      .select('id, role, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      results.steps = [...(results.steps as unknown[]), {
        step: 'profile',
        status: 'failed',
        error: profileError?.message || 'No profile',
        code: profileError?.code
      }]
    } else {
      results.steps = [...(results.steps as unknown[]), { step: 'profile', status: 'success', profile }]
    }

    // Step 3: Look up building by code (if provided)
    let buildingId: string | null = null
    if (buildingCode) {
      const { data: building, error: buildingError } = await supabase
        .from('buildings')
        .select('id, name, code')
        .eq('code', buildingCode.toUpperCase())
        .single()

      if (buildingError || !building) {
        results.steps = [...(results.steps as unknown[]), {
          step: 'building_lookup',
          status: 'failed',
          error: buildingError?.message || 'Building not found',
          code: buildingError?.code
        }]
      } else {
        buildingId = building.id
        results.steps = [...(results.steps as unknown[]), { step: 'building_lookup', status: 'success', building }]
      }
    } else {
      // Use first available building for testing
      const { data: buildings } = await supabase
        .from('buildings')
        .select('id, name, code')
        .limit(1)

      if (buildings && buildings.length > 0) {
        buildingId = buildings[0].id
        results.steps = [...(results.steps as unknown[]), { step: 'building_fallback', status: 'success', building: buildings[0] }]
      } else {
        results.steps = [...(results.steps as unknown[]), { step: 'building_fallback', status: 'failed', error: 'No buildings found' }]
      }
    }

    // Step 4: Note about RLS policies
    results.steps = [...(results.steps as unknown[]), {
      step: 'check_policies',
      status: 'info',
      note: 'RLS policies should allow INSERT when created_by = auth.uid()'
    }]

    // Step 5: Try to create application
    if (!buildingId) {
      return NextResponse.json({
        ...results,
        error: 'No building ID available for test',
        cannotProceed: true
      }, { status: 400 })
    }

    const applicationData = {
      building_id: buildingId,
      transaction_type: transactionType || 'COOP_PURCHASE',
      status: 'IN_PROGRESS',
      created_by: user.id,
      current_section: 'profile',
      completion_percentage: 0,
      is_locked: false,
      broker_owned: false,
    }

    results.applicationData = applicationData

    const { data: application, error: createError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select('id, building_id, status, created_by, created_at')
      .single()

    if (createError) {
      results.steps = [...(results.steps as unknown[]), {
        step: 'create_application',
        status: 'failed',
        error: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      }]
      return NextResponse.json({
        ...results,
        error: `Failed to create application: ${createError.message}`,
        errorCode: createError.code,
        errorDetails: createError.details,
        errorHint: createError.hint
      }, { status: 500 })
    }

    results.steps = [...(results.steps as unknown[]), { step: 'create_application', status: 'success', application }]

    // Step 6: Clean up - delete the test application
    if (application) {
      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id)

      results.steps = [...(results.steps as unknown[]), {
        step: 'cleanup',
        status: deleteError ? 'failed' : 'success',
        note: 'Test application deleted',
        error: deleteError?.message
      }]
    }

    return NextResponse.json({
      ...results,
      success: true,
      message: 'Application creation test successful! The test application was created and deleted.'
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      ...results,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

// Also support GET for easy browser testing
export async function GET(request: NextRequest) {
  // Convert GET to POST with default values
  const url = new URL(request.url)
  const buildingCode = url.searchParams.get('buildingCode') || 'DAKOTA'
  const transactionType = url.searchParams.get('transactionType') || 'COOP_PURCHASE'

  // Create a mock request with the body
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ buildingCode, transactionType }),
  })

  return POST(mockRequest)
}
