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
import { TransactionType } from '@/lib/types'
import {
  withErrorHandler,
  assertAuthenticated,
  assertExists,
} from '@/lib/api/errors'
import { validateRequestBody } from '@/lib/api/validate'

// Validation schema for creating an application
const createApplicationSchema = z.object({
  buildingId: z.string().uuid('Invalid building ID'),
  unit: z.string().optional(),
  transactionType: z.nativeEnum(TransactionType),
})

/**
 * GET /api/applications
 * Get all applications for the current user based on their role
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Assert user is authenticated (throws AuthenticationError if not)
  assertAuthenticated(user?.id)

  // Get user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Assert profile exists (throws NotFoundError if not)
  assertExists(profile, 'User profile')

  // Fetch applications using data access layer
  const applications = await getApplications(user.id, profile.role)

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
    error: authError,
  } = await supabase.auth.getUser()

  // Assert user is authenticated (throws AuthenticationError if not)
  assertAuthenticated(user?.id)

  // Validate request body (throws ValidationError if invalid)
  const input = await validateRequestBody(request, createApplicationSchema)

  // Create application using data access layer
  const application = await createApplication(input as CreateApplicationInput)

  return NextResponse.json({ application }, { status: 201 })
})
