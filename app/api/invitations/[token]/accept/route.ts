/**
 * Invitation Acceptance API Route
 *
 * POST /api/invitations/[token]/accept - Accept an application invitation
 *
 * Rate limited to prevent brute force token guessing attacks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/api/rate-limit'

/**
 * POST /api/invitations/[token]/accept
 * Accept an application invitation and link user to the application
 *
 * Rate limited: 5 requests per minute (auth rate limit)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Apply rate limiting to prevent brute force token guessing
  const { isLimited, remaining, resetTime } = await checkRateLimit(request, {
    ...RATE_LIMITS.auth,
    identifier: 'invitation-accept',
  })

  if (isLimited) {
    return NextResponse.json(
      {
        error: {
          message: 'Too many attempts. Please wait before trying again.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.auth.limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        },
      }
    )
  }
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's email from profile
    const { data: profile } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('application_invitations')
      .select('*, applications(*)')
      .eq('token', token)
      .eq('status', 'PENDING')
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already used' },
        { status: 404 }
      )
    }

    // Verify the email matches
    if (invitation.email !== profile.email) {
      return NextResponse.json(
        {
          error: 'This invitation was sent to a different email address',
          invitedEmail: invitation.email,
          userEmail: profile.email,
        },
        { status: 403 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('application_invitations')
        .update({ status: 'EXPIRED' })
        .eq('id', invitation.id)

      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 410 }
      )
    }

    // Start a transaction-like operation
    // 1. Update the invitation status
    const { error: updateInviteError } = await supabase
      .from('application_invitations')
      .update({
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (updateInviteError) {
      console.error('Error updating invitation:', updateInviteError)
      return NextResponse.json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      )
    }

    // 2. Update the application with primary_applicant_id
    const { error: updateAppError } = await supabase
      .from('applications')
      .update({
        primary_applicant_id: user.id,
      })
      .eq('id', invitation.application_id)

    if (updateAppError) {
      console.error('Error updating application:', updateAppError)
      // Try to rollback invitation status
      await supabase
        .from('application_invitations')
        .update({ status: 'PENDING' })
        .eq('id', invitation.id)

      return NextResponse.json(
        { error: 'Failed to link application' },
        { status: 500 }
      )
    }

    // 3. Add user as participant with APPLICANT role
    const { error: participantError } = await supabase
      .from('application_participants')
      .insert({
        application_id: invitation.application_id,
        user_id: user.id,
        role: 'APPLICANT',
        invited_at: invitation.created_at,
        accepted_at: new Date().toISOString(),
      })

    if (participantError) {
      // Check if already exists (idempotent operation)
      if (!participantError.message?.includes('duplicate')) {
        console.error('Error adding participant:', participantError)
      }
    }

    // 4. Get the updated application
    const { data: application } = await supabase
      .from('applications')
      .select('*, building:buildings(*)')
      .eq('id', invitation.application_id)
      .single()

    return NextResponse.json(
      {
        message: 'Invitation accepted successfully',
        application,
        redirectTo: `/applications/${invitation.application_id}/overview`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/invitations/[token]/accept:', error)

    return NextResponse.json(
      {
        error: 'Failed to accept invitation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/invitations/[token]/accept
 * Get invitation details (for verification before accepting)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get the invitation (no auth required for viewing invitation)
    const { data: invitation, error } = await supabase
      .from('application_invitations')
      .select(`
        *,
        applications(
          *,
          building:buildings(*)
        ),
        invited_by_user:users!application_invitations_invited_by_fkey(
          id,
          name,
          email
        )
      `)
      .eq('token', token)
      .single()

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if expired
    const isExpired = new Date(invitation.expires_at) < new Date()

    return NextResponse.json(
      {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: isExpired ? 'EXPIRED' : invitation.status,
          expiresAt: invitation.expires_at,
          application: invitation.applications,
          invitedBy: invitation.invited_by_user,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/invitations/[token]/accept:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch invitation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
