/**
 * RFI Messages API Routes
 *
 * GET /api/rfis/[id]/messages - Get all messages for an RFI
 * POST /api/rfis/[id]/messages - Add a message to an RFI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getRFIMessages,
  addRFIMessage,
} from '@/lib/api/rfis'
import { z } from 'zod'

// Validation schema for adding an RFI message
const createRFIMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  attachments: z.array(z.string().uuid()).optional(),
})

/**
 * GET /api/rfis/[id]/messages
 * Get all messages for an RFI
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

    // Fetch RFI messages (RLS will ensure user has access)
    const messages = await getRFIMessages(id)

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/rfis/[id]/messages:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch RFI messages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rfis/[id]/messages
 * Add a message to an RFI
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createRFIMessageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    // Add RFI message
    const message = await addRFIMessage(id, validationResult.data)

    // TODO: Trigger real-time update (Phase 5: Real-Time Features)
    // - Broadcast message to all RFI participants
    // - Send notification to other participants

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/rfis/[id]/messages:', error)
    return NextResponse.json(
      {
        error: 'Failed to add RFI message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
