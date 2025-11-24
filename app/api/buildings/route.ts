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
      .select('id, name, address, city, state, zip, building_type')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching buildings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch buildings' },
        { status: 500 }
      )
    }

    // Format address for display
    const formattedBuildings = buildings.map(building => ({
      id: building.id,
      name: building.name,
      address: `${building.address}, ${building.city}, ${building.state} ${building.zip}`,
      buildingType: building.building_type,
    }))

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
