/**
 * Building Template API Route
 *
 * GET /api/buildings/[id]/template - Get the published template for a building
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBuildingTemplate } from '@/lib/api/templates'

/**
 * GET /api/buildings/[id]/template
 * Get the published template for a specific building
 */
export async function GET(
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

    // Fetch published template for building
    const template = await getBuildingTemplate(id)

    if (!template) {
      return NextResponse.json(
        { error: 'No published template found for this building' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/buildings/[id]/template:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch building template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
