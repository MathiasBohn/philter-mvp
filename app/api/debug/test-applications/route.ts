import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        userError: userError?.message,
      })
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({
        error: 'Profile not found',
        profileError: profileError?.message,
      })
    }

    // Try to fetch applications with simplified query
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*, building:buildings(*)')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        role: profile.role,
        firstName: profile.first_name,
      },
      applications: applications || [],
      applicationsCount: applications?.length || 0,
      error: appsError?.message || null,
      rawError: appsError,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({
      error: errorMessage,
      stack: errorStack,
    }, { status: 500 })
  }
}
