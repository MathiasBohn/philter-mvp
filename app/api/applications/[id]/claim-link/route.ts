import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if user has permission to create claim link (must be BROKER or application creator)
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || (userProfile.role !== 'BROKER' && userProfile.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden - Only brokers can create claim links' },
        { status: 403 }
      )
    }

    // Await params in Next.js 16
    const { id: applicationId } = await params

    // Check if application exists and user has access
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, building_id')
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Generate unique claim token
    const claimToken = crypto.randomUUID()

    // Set expiration date (30 days from now for claim links)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create a claim link invitation (no specific email)
    const { data: claimLink, error: claimError } = await supabase
      .from('application_invitations')
      .insert({
        application_id: applicationId,
        email: '', // Empty email for claim links
        token: claimToken,
        invited_by: user.id,
        status: 'PENDING',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (claimError) {
      console.error('Error creating claim link:', claimError)
      return NextResponse.json(
        { error: 'Failed to create claim link' },
        { status: 500 }
      )
    }

    // Generate the shareable URL
    const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/claim/${claimToken}`

    return NextResponse.json({
      success: true,
      claim_link: claimLink,
      claim_url: claimUrl,
      message: 'Claim link created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in claim link creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
