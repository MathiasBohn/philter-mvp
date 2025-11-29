/**
 * Template Detail API Routes
 *
 * GET /api/templates/[id] - Get a single template
 * PATCH /api/templates/[id] - Update a template (requires ADMIN role)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTemplate,
  updateTemplate,
  type CreateTemplateInput,
} from '@/lib/api/templates'
import { validateRouteUUID } from '@/lib/api/validate'
import { z } from 'zod'
import { DocumentCategory, DisclosureType } from '@/lib/types'

// Validation schema for building policies
const buildingPoliciesSchema = z.object({
  maxFinancePercent: z.number(),
  allowGuarantors: z.boolean(),
  alterationPolicies: z.string().optional(),
  insuranceRequirements: z.string().optional(),
  allowCorpOwnership: z.boolean(),
}).optional()

// Validation schema for updating a template
const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  requiredSections: z.array(z.string()).optional(),
  optionalSections: z.array(z.string()).optional(),
  requiredDocuments: z.array(z.nativeEnum(DocumentCategory)).optional(),
  optionalDocuments: z.array(z.nativeEnum(DocumentCategory)).optional(),
  enabledDisclosures: z.array(z.nativeEnum(DisclosureType)).optional(),
  buildingPolicies: buildingPoliciesSchema,
})

/**
 * GET /api/templates/[id]
 * Get a single template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate UUID format
    const validation = await validateRouteUUID(params)
    if (validation.error) {
      return validation.error
    }
    const { id } = validation

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch template
    const template = await getTemplate(id)

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/templates/[id]:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/templates/[id]
 * Update a template (agent/admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate UUID format
    const validation = await validateRouteUUID(params)
    if (validation.error) {
      return validation.error
    }
    const { id } = validation

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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    // Update template
    const template = await updateTemplate(
      id,
      validationResult.data as Partial<CreateTemplateInput>
    )

    return NextResponse.json({ template }, { status: 200 })
  } catch (error) {
    console.error('Error in PATCH /api/templates/[id]:', error)
    return NextResponse.json(
      {
        error: 'Failed to update template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
