/**
 * Applications API Routes
 *
 * GET /api/applications - Get all applications for current user
 * POST /api/applications - Create a new application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getApplications,
  createApplication,
  type CreateApplicationInput,
} from '@/lib/api/applications'
import { z } from 'zod'
import { TransactionType, Role } from '@/lib/types'
import {
  withErrorHandler,
  assertAuthenticated,
} from '@/lib/api/errors'
import { validateRequestBody } from '@/lib/api/validate'

// Validation schema for creating an application
const createApplicationSchema = z.object({
  buildingId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid building ID'),
  unit: z.string().optional(),
  transactionType: z.nativeEnum(TransactionType),
  // For broker-initiated applications
  primaryApplicantEmail: z.string().email().optional(),
  primaryApplicantName: z.string().optional(),
})

/**
 * GET /api/applications
 * Get all applications for the current user based on their role
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Assert user is authenticated (throws AuthenticationError if not)
  assertAuthenticated(user?.id)

  // Get user profile (respects RLS)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, direct user to recover their profile
  // This handles the edge case where the database trigger failed during signup
  if (!profile || profileError) {
    console.warn(`User profile not found for user ${user.id}. Profile recovery required.`)

    return NextResponse.json(
      {
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found. Please try refreshing the page or contact support.',
        recoveryUrl: '/api/admin/recover-profile',
      },
      { status: 404 }
    )
  }

  // Fetch applications using data access layer
  const applications = await getApplications(user.id, profile.role as Role)

  return NextResponse.json({ applications }, { status: 200 })
})

/**
 * POST /api/applications
 * Create a new application
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Assert user is authenticated (throws AuthenticationError if not)
  assertAuthenticated(user?.id)

  // Validate request body (throws ValidationError if invalid)
  const input = await validateRequestBody(request, createApplicationSchema)

  // Create application using data access layer
  const application = await createApplication(input as CreateApplicationInput)

  return NextResponse.json({ application }, { status: 201 })
})
