/**
 * Application Submit API Route
 *
 * POST /api/applications/[id]/submit - Submit an application for review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitApplication } from '@/lib/api/applications'
import { validateRouteUUID } from '@/lib/api/validate'

/**
 * POST /api/applications/[id]/submit
 * Submit an application for review
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

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Submit application (RLS will ensure user has permission)
    const application = await submitApplication(id)

    return NextResponse.json(
      {
        application,
        message: 'Application submitted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/submit:', error)

    // Handle specific error messages
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('not complete')) {
      return NextResponse.json(
        {
          error: 'Application incomplete',
          message,
        },
        { status: 400 }
      )
    }

    if (message.includes('already been submitted')) {
      return NextResponse.json(
        {
          error: 'Already submitted',
          message,
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to submit application',
        message,
      },
      { status: 500 }
    )
  }
}
