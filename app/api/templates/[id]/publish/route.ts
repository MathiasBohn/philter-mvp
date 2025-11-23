/**
 * Template Publish API Route
 *
 * POST /api/templates/[id]/publish - Publish a template (requires ADMIN role)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishTemplate } from '@/lib/api/templates'

/**
 * POST /api/templates/[id]/publish
 * Publish a template (makes it active for use)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Verify user is admin/agent
    if (profile.role !== 'ADMIN' && profile.role !== 'TRANSACTION_AGENT') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Publish template
    const template = await publishTemplate(id)

    return NextResponse.json(
      {
        template,
        message: 'Template published successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/templates/[id]/publish:', error)
    return NextResponse.json(
      {
        error: 'Failed to publish template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
