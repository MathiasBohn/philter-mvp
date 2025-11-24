import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const invitationSchema = z.object({
  application_id: z.string().uuid(),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = invitationSchema.parse(body)

    // Check if user has permission to invite (must be BROKER or application creator)
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || (userProfile.role !== 'BROKER' && userProfile.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden - Only brokers can send invitations' },
        { status: 403 }
      )
    }

    // Check if application exists and user has access
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, building_id')
      .eq('id', validatedData.application_id)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Generate secure token (UUID)
    const token = crypto.randomUUID()

    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Check if invitation already exists for this email and application
    const { data: existingInvitation } = await supabase
      .from('application_invitations')
      .select('id, status')
      .eq('application_id', validatedData.application_id)
      .eq('email', validatedData.email)
      .eq('status', 'PENDING')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email for this application' },
        { status: 409 }
      )
    }

    // Insert invitation into database
    const { data: invitation, error: inviteError } = await supabase
      .from('application_invitations')
      .insert({
        application_id: validatedData.application_id,
        email: validatedData.email,
        token,
        invited_by: user.id,
        status: 'PENDING',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // TODO: Trigger Edge Function to send email notification
    // This will be implemented when we set up Supabase Edge Functions
    // For now, return the invitation with instructions to use the token manually

    return NextResponse.json({
      success: true,
      invitation,
      // Include the invitation URL for testing purposes
      invitation_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://philter-mvp.vercel.app'}/accept-invitation/${token}`,
      message: 'Invitation created successfully. Email sending will be implemented in the next phase.'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in invitation creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to list invitations for an application
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get application_id from query params
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('application_id')

    if (!applicationId) {
      return NextResponse.json(
        { error: 'application_id query parameter is required' },
        { status: 400 }
      )
    }

    // Get invitations for this application
    const { data: invitations, error } = await supabase
      .from('application_invitations')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invitations
    })

  } catch (error) {
    console.error('Error in invitation fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
