/**
 * Debug Test Update Application API Route
 *
 * POST /api/debug/test-update-application - Test updating an application
 *
 * This endpoint helps diagnose issues with application updates by
 * providing detailed error information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateApplication, getApplication } from '@/lib/api/applications'

export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: [],
  }

  try {
    const url = new URL(request.url)
    const applicationId = url.searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId query parameter required' }, { status: 400 })
    }

    // Step 1: Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      results.steps = [...(results.steps as unknown[]), { step: 'auth', status: 'failed', error: authError?.message || 'No user' }]
      return NextResponse.json({ ...results, error: 'Not authenticated' }, { status: 401 })
    }

    results.steps = [...(results.steps as unknown[]), { step: 'auth', status: 'success', userId: user.id }]

    // Step 2: Fetch current application state
    const currentApp = await getApplication(applicationId)

    if (!currentApp) {
      results.steps = [...(results.steps as unknown[]), { step: 'fetch_current', status: 'failed', error: 'Application not found' }]
      return NextResponse.json({ ...results, error: 'Application not found' }, { status: 404 })
    }

    results.steps = [...(results.steps as unknown[]), {
      step: 'fetch_current',
      status: 'success',
      currentLeaseTerms: currentApp.leaseTerms,
      hasLeaseTerms: !!currentApp.leaseTerms,
    }]

    // Step 3: Test updating with sample leaseTerms
    const testLeaseTerms = {
      monthlyRent: 5000,
      securityDeposit: 10000,
      leaseLengthYears: 2,
      leaseStartDate: new Date().toISOString(),
      leaseEndDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      moveInDate: new Date().toISOString(),
      specialConditions: 'Test update at ' + new Date().toISOString(),
      annualRent: 60000,
    }

    results.steps = [...(results.steps as unknown[]), {
      step: 'prepare_update',
      status: 'info',
      testData: testLeaseTerms,
    }]

    // Step 4: Perform update
    try {
      const updatedApp = await updateApplication(applicationId, {
        leaseTerms: testLeaseTerms,
      })

      results.steps = [...(results.steps as unknown[]), {
        step: 'update_application',
        status: 'success',
        updatedLeaseTerms: updatedApp.leaseTerms,
      }]
    } catch (updateError) {
      results.steps = [...(results.steps as unknown[]), {
        step: 'update_application',
        status: 'failed',
        error: updateError instanceof Error ? updateError.message : 'Unknown error',
      }]
      return NextResponse.json({
        ...results,
        error: 'Update failed',
        errorDetails: updateError instanceof Error ? updateError.message : 'Unknown error',
      }, { status: 500 })
    }

    // Step 5: Verify the update persisted
    const verifyApp = await getApplication(applicationId)

    results.steps = [...(results.steps as unknown[]), {
      step: 'verify_update',
      status: 'success',
      verifiedLeaseTerms: verifyApp?.leaseTerms,
      dataMatches: JSON.stringify(verifyApp?.leaseTerms) === JSON.stringify(testLeaseTerms) ? 'yes' : 'partial',
    }]

    // Step 6: Check raw database value
    const { data: rawApp, error: rawError } = await supabase
      .from('applications')
      .select('id, metadata')
      .eq('id', applicationId)
      .single()

    results.steps = [...(results.steps as unknown[]), {
      step: 'check_raw_database',
      status: rawError ? 'failed' : 'success',
      rawMetadata: rawApp?.metadata,
      error: rawError?.message,
    }]

    return NextResponse.json({
      ...results,
      success: true,
      message: 'Update test completed successfully',
      finalLeaseTerms: verifyApp?.leaseTerms,
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      ...results,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
