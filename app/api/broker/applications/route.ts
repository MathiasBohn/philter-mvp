/**
 * Broker Applications API Routes
 *
 * POST /api/broker/applications - Create a new broker-owned application and send invitation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { TransactionType } from '@/lib/types'
import { sendInvitationEmail } from '@/lib/email'

// Validation schema for creating a broker-owned application
const createBrokerApplicationSchema = z.object({
  buildingId: z.string().uuid('Invalid building ID'),
  unit: z.string().optional(),
  transactionType: z.nativeEnum(TransactionType),
  // Applicant details are optional - broker can create app first and invite later
  applicantEmail: z.string().email('Invalid email address').optional().nullable(),
  applicantName: z.string().optional().nullable(),
})

/**
 * POST /api/broker/applications
 * Create a new broker-owned application and send invitation to applicant
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and verify they're a broker
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

    // Get user profile to verify broker role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'BROKER') {
      return NextResponse.json(
        { error: 'Only brokers can create broker-owned applications' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validation = createBrokerApplicationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { buildingId, unit, transactionType, applicantEmail, applicantName } =
      validation.data

    // Check if we should send an invitation (only if valid applicant email is provided)
    const shouldSendInvitation = applicantEmail && applicantEmail !== 'placeholder@temp.local'

    // Check if applicant already has a user account (only if email provided)
    let existingUser = null
    if (shouldSendInvitation) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', applicantEmail)
        .single()
      existingUser = data
    }

    // Create the broker-owned application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        building_id: buildingId,
        unit,
        transaction_type: transactionType,
        status: 'IN_PROGRESS',
        broker_owned: true,
        created_by: user.id,
        primary_applicant_email: shouldSendInvitation ? applicantEmail : null,
        primary_applicant_id: existingUser?.id || null,
        current_section: 'profile',
        completion_percentage: 0,
        is_locked: false,
      })
      .select(`
        *,
        building:buildings(*)
      `)
      .single()

    if (appError) {
      console.error('Error creating application:', appError)
      return NextResponse.json(
        { error: 'Failed to create application', details: appError.message },
        { status: 500 }
      )
    }

    // Only handle invitation if applicant email was provided
    if (shouldSendInvitation) {
      // If user already exists, link them to the application
      if (existingUser) {
        await supabase.from('application_participants').insert({
          application_id: application.id,
          user_id: existingUser.id,
          role: 'APPLICANT',
          invited_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        })
      } else {
        // Create invitation for new user
        const { data: invitation, error: inviteError } = await supabase
          .from('application_invitations')
          .insert({
            application_id: application.id,
            email: applicantEmail,
            invited_by: user.id,
            status: 'PENDING',
          })
          .select()
          .single()

        if (inviteError) {
          console.error('Error creating invitation:', inviteError)
          // Application was created, so we don't fail - just log the error
          // TODO: Implement retry mechanism or queue
        }

        // Send invitation email
        if (invitation) {
          console.log(`Invitation created with token: ${invitation.token}`)
          console.log(`Invite URL: ${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${invitation.token}`)

          // Get broker's name for the email
          const { data: brokerProfile } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', user.id)
            .single()

          // Send the email
          const emailResult = await sendInvitationEmail({
            to: applicantEmail,
            applicantName: applicantName || 'Applicant',
            brokerName: brokerProfile?.name || brokerProfile?.email || 'Your broker',
            buildingName: application.building?.name || 'the building',
            buildingAddress: application.building?.address || '',
            transactionType,
            invitationToken: invitation.token,
          })

          if (!emailResult.success) {
            console.warn('Failed to send invitation email:', emailResult.error)
            // We don't fail the request since the invitation was created
            // The broker can manually share the link
          }
        }
      }
    }

    // Determine the appropriate message
    let message = 'Application created'
    if (shouldSendInvitation) {
      message = existingUser
        ? 'Application created and applicant linked'
        : 'Application created and invitation sent'
    }

    return NextResponse.json(
      {
        application: {
          ...application,
          broker_owned: application.broker_owned,
          primary_applicant_email: application.primary_applicant_email,
          primary_applicant_id: application.primary_applicant_id,
        },
        invitationSent: shouldSendInvitation && !existingUser,
        message,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/broker/applications:', error)

    return NextResponse.json(
      {
        error: 'Failed to create broker application',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/broker/applications
 * Get all applications created by the current broker
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and verify they're a broker
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

    // Get broker's applications (including broker-owned ones)
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        building:buildings(*),
        application_invitations(*)
      `)
      .eq('broker_owned', true)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching broker applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ applications }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/broker/applications:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch broker applications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
