/**
 * Applications API Routes
 *
 * GET /api/applications - Get all applications for current user
 * POST /api/applications - Create a new application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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

  // Get user profile to determine role (use admin client to bypass RLS)
  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create it with default APPLICANT role
  if (!profile || profileError) {
    console.warn(`User profile not found for user ${user.id}, creating default profile`)

    // Create user profile with APPLICANT role as fallback
    const { data: newProfile, error: createError } = await adminClient
      .from('users')
      .insert({
        id: user.id,
        role: 'APPLICANT',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || null,
      })
      .select('role')
      .single()

    if (createError || !newProfile) {
      console.error('Failed to create user profile:', createError)
      throw new Error('User profile not found and could not be created')
    }

    // Use newly created profile
    const applications = await getApplications(user.id, newProfile.role)
    return NextResponse.json({ applications }, { status: 200 })
  }

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
  } = await supabase.auth.getUser()

  // Assert user is authenticated (throws AuthenticationError if not)
  assertAuthenticated(user?.id)

  // Validate request body (throws ValidationError if invalid)
  const input = await validateRequestBody(request, createApplicationSchema)

  // Create application using data access layer
  const application = await createApplication(input as CreateApplicationInput)

  return NextResponse.json({ application }, { status: 201 })
})
