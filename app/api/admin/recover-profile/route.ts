/**
 * Profile Recovery API Route
 *
 * POST /api/admin/recover-profile
 *
 * This endpoint handles the edge case where a user's profile wasn't created
 * by the database trigger during signup. Uses admin client with audit logging.
 *
 * Security: Only creates a profile for the currently authenticated user,
 * and only if no profile already exists.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if profile truly doesn't exist
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    return NextResponse.json(
      { error: 'Profile already exists' },
      { status: 400 }
    )
  }

  // Log this admin action before proceeding
  await logAuditEvent({
    action: 'PROFILE_RECOVERY',
    userId: user.id,
    reason: 'Missing profile after auth signup - trigger may have failed',
    metadata: {
      email: user.email,
      createdAt: user.created_at,
    },
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  })

  // Only now use admin client to bypass RLS for profile creation
  const adminClient = createAdminClient()
  const { data: newProfile, error } = await adminClient
    .from('users')
    .insert({
      id: user.id,
      role: 'APPLICANT',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      phone: user.user_metadata?.phone || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Profile recovery failed:', error)
    return NextResponse.json(
      { error: 'Profile recovery failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ profile: newProfile })
}
