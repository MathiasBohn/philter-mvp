/**
 * Current User API Routes
 *
 * GET /api/users/me - Get current user profile
 * PATCH /api/users/me - Update current user profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile, updateUserProfile } from '@/lib/api/users'
import { z } from 'zod'

// Validation schema for updating user profile
const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  // Note: role cannot be updated via this endpoint for security
})

/**
 * GET /api/users/me
 * Get current user profile
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile
    const profile = await getUserProfile(user.id)

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/users/me:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/me
 * Update current user profile
 */
export async function PATCH(request: NextRequest) {
  try {
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
    const validationResult = updateUserProfileSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    // Update user profile
    const profile = await updateUserProfile(user.id, validationResult.data)

    return NextResponse.json(
      {
        profile,
        message: 'Profile updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in PATCH /api/users/me:', error)
    return NextResponse.json(
      {
        error: 'Failed to update user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
