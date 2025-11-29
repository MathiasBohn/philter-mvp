/**
 * Application Decision API Routes
 *
 * GET /api/applications/[id]/decision - Get decision for an application
 * POST /api/applications/[id]/decision - Create a decision for an application (requires ADMIN role)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getDecision,
  createDecision,
  type CreateDecisionInput,
} from '@/lib/api/decisions'
import { validateRouteUUID } from '@/lib/api/validate'
import { z } from 'zod'
import { Decision } from '@/lib/types'
import { logActivity, logDecision } from '@/lib/api/audit'

// Validation schema for creating a decision
const createDecisionSchema = z.object({
  decision: z.nativeEnum(Decision),
  conditions: z.string().optional(),
  reasonCodes: z.array(z.string()).optional(),
  usesConsumerReport: z.boolean().default(false),
  notes: z.string().optional(),
})

/**
 * GET /api/applications/[id]/decision
 * Get the decision for an application
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

    // Fetch decision (RLS will ensure user has access)
    const decision = await getDecision(id)

    if (!decision) {
      return NextResponse.json(
        { error: 'No decision found for this application' },
        { status: 404 }
      )
    }

    // Log decision access
    await logActivity({
      action: 'DECISION_VIEWED',
      entity_type: 'decision',
      entity_id: decision.id,
      application_id: id,
    })

    return NextResponse.json({ decision }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/decision:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch decision',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications/[id]/decision
 * Create a decision for an application (agent/admin only)
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

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Verify user is admin/agent
    if (profile.role !== 'ADMIN' && profile.role !== 'TRANSACTION_AGENT') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createDecisionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    // Check if decision already exists
    const existingDecision = await getDecision(id)
    if (existingDecision) {
      return NextResponse.json(
        { error: 'Decision already exists for this application' },
        { status: 409 }
      )
    }

    // Create decision
    const input: CreateDecisionInput = {
      applicationId: id,
      ...validationResult.data,
    }

    const decision = await createDecision(input)

    // Log decision creation
    await logDecision(decision.id, id, validationResult.data.decision)

    // TODO: Phase 5 - Real-Time Features
    // - Generate adverse action notice if decision is DENY and usesConsumerReport is true
    // - Send notifications to applicant and broker
    // - Update application status based on decision
    // - Trigger real-time update

    return NextResponse.json(
      {
        decision,
        message: 'Decision created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/decision:', error)
    return NextResponse.json(
      {
        error: 'Failed to create decision',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
