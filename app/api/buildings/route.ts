/**
 * Buildings API Routes
 *
 * GET /api/buildings - Get all buildings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/buildings
 * Get all buildings for dropdowns/selects
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all buildings (RLS policies will handle access control)
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('id, name, code, address, building_type')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching buildings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch buildings' },
        { status: 500 }
      )
    }

    // Format address for display (address is a JSONB column)
    const formattedBuildings = buildings.map(building => {
      const addr = building.address as { street?: string; city?: string; state?: string; zip?: string } | null
      return {
        id: building.id,
        name: building.name,
        code: building.code,
        address: addr ? `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}` : '',
        buildingType: building.building_type,
      }
    })

    return NextResponse.json({ buildings: formattedBuildings }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/buildings:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch buildings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
