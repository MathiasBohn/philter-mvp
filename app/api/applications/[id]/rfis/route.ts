/**
 * Application RFIs API Routes
 *
 * GET /api/applications/[id]/rfis - Get all RFIs for an application
 * POST /api/applications/[id]/rfis - Create a new RFI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getRFIs,
  createRFI,
  type CreateRFIInput,
} from '@/lib/api/rfis'
import { validateRouteUUID } from '@/lib/api/validate'
import { z } from 'zod'
import { Role } from '@/lib/types'

// Validation schema for creating an RFI
const createRFISchema = z.object({
  sectionKey: z.string().min(1, 'Section key is required'),
  assigneeRole: z.enum([Role.APPLICANT, Role.BROKER]),
  initialMessage: z.string().min(1, 'Initial message is required'),
})

/**
 * GET /api/applications/[id]/rfis
 * Get all RFIs for an application
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

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch RFIs (RLS will ensure user has access)
    const rfis = await getRFIs(id)

    return NextResponse.json({ rfis }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/rfis:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch RFIs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications/[id]/rfis
 * Create a new RFI
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createRFISchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    // Create RFI
    const input: CreateRFIInput = {
      applicationId: id,
      ...validationResult.data,
    }

    const rfi = await createRFI(input)

    // TODO: Trigger notification (Phase 5: Real-Time Features)
    // - Send email to assignee
    // - Create in-app notification
    // - Trigger real-time update

    return NextResponse.json({ rfi }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/rfis:', error)
    return NextResponse.json(
      {
        error: 'Failed to create RFI',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
