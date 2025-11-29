/**
 * API Route: /api/applications/[id]/employment
 *
 * Handles CRUD operations for employment records associated with an application.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getEmploymentRecords,
  upsertEmploymentRecord,
  upsertEmploymentRecords,
  type EmploymentInput,
} from '@/lib/api/employment'
import { validateRouteUUID } from '@/lib/api/validate'

/**
 * GET /api/applications/[id]/employment
 * Fetch all employment records for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate UUID format
    const validation = await validateRouteUUID(params)
    if (validation.error) {
      return validation.error
    }
    const { id } = validation

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch employment records
    const employmentRecords = await getEmploymentRecords(id)

    return NextResponse.json(employmentRecords)
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/employment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications/[id]/employment
 * Create or update an employment record for an application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate UUID format
    const validation = await validateRouteUUID(params)
    if (validation.error) {
      return validation.error
    }
    const { id } = validation

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const employmentData = body as EmploymentInput

    // Validate required fields
    if (!employmentData.employerName || !employmentData.employmentStatus || !employmentData.startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: employerName, employmentStatus, startDate' },
        { status: 400 }
      )
    }

    // Upsert employment record
    const employmentRecord = await upsertEmploymentRecord(id, employmentData)

    return NextResponse.json(employmentRecord, { status: employmentData.id ? 200 : 201 })
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/employment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/applications/[id]/employment
 * Batch update multiple employment records
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate UUID format
    const validation = await validateRouteUUID(params)
    if (validation.error) {
      return validation.error
    }
    const { id } = validation

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const employmentData = body.employmentRecords as EmploymentInput[]

    if (!Array.isArray(employmentData)) {
      return NextResponse.json(
        { error: 'Invalid request body: expected array of employment records' },
        { status: 400 }
      )
    }

    // Upsert all employment records
    const results = await upsertEmploymentRecords(id, employmentData)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]/employment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
