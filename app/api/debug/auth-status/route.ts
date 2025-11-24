import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check env vars
    const envVarsConfigured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Try to get user
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    // Get user profile if user exists
    let profile = null
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      envVarsConfigured,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at,
      } : null,
      profile: profile ? {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
      } : null,
      error: error?.message || null,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
