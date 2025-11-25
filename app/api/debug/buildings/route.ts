/**
 * Debug Buildings API Route
 *
 * GET /api/debug/buildings - List all buildings with codes for testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user (optional for debug)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get all buildings with their codes
    const { data: buildings, error } = await supabase
      .from('buildings')
      .select('id, name, code, building_type, address')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch buildings',
          details: error.message,
          code: error.code,
          authenticated: !!user,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      authenticated: !!user,
      userId: user?.id || null,
      buildingCount: buildings?.length || 0,
      buildings: buildings?.map(b => ({
        id: b.id,
        name: b.name,
        code: b.code,
        buildingType: b.building_type,
        address: b.address,
      })) || [],
      availableCodes: buildings?.map(b => b.code).filter(Boolean) || [],
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
