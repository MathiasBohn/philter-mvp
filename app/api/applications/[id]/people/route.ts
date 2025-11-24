/**
 * API Route: /api/applications/[id]/people
 *
 * Handles CRUD operations for people (applicants, co-applicants, guarantors)
 * associated with an application.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPeople, upsertPerson, type PersonInput } from '@/lib/api/people'

/**
 * GET /api/applications/[id]/people
 * Fetch all people for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch people records
    const people = await getPeople(id)

    return NextResponse.json(people)
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/people:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications/[id]/people
 * Create or update a person record for an application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    const personData = body as PersonInput

    // Validate required fields
    if (!personData.role || !personData.firstName || !personData.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: role, firstName, lastName' },
        { status: 400 }
      )
    }

    // Upsert person record
    const person = await upsertPerson(id, personData)

    return NextResponse.json(person, { status: personData.id ? 200 : 201 })
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/people:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/applications/[id]/people
 * Batch update multiple people records
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    const peopleData = body.people as PersonInput[]

    if (!Array.isArray(peopleData)) {
      return NextResponse.json(
        { error: 'Invalid request body: expected array of people' },
        { status: 400 }
      )
    }

    // Upsert all people records
    const results = []
    for (const personData of peopleData) {
      const person = await upsertPerson(id, personData)
      results.push(person)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]/people:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
