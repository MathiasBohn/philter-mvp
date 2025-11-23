/**
 * RFI Resolve API Route
 *
 * PATCH /api/rfis/[id]/resolve - Mark an RFI as resolved
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveRFI } from '@/lib/api/rfis'

/**
 * PATCH /api/rfis/[id]/resolve
 * Mark an RFI as resolved
 */
export async function PATCH(
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

    // Resolve RFI (RLS will ensure user has permission)
    const rfi = await resolveRFI(id)

    // TODO: Trigger notifications (Phase 5: Real-Time Features)
    // - Notify all participants that RFI is resolved
    // - Update application status if all RFIs are resolved

    return NextResponse.json(
      {
        rfi,
        message: 'RFI resolved successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in PATCH /api/rfis/[id]/resolve:', error)
    return NextResponse.json(
      {
        error: 'Failed to resolve RFI',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
