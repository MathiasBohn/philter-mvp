/**
 * Templates API Routes
 *
 * GET /api/templates - Get all templates (requires ADMIN role)
 * POST /api/templates - Create a new template (requires ADMIN role)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTemplates,
  createTemplate,
  type CreateTemplateInput,
} from '@/lib/api/templates'
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

// Validation schema for creating a template
const createTemplateSchema = z.object({
  buildingId: z.string().uuid('Invalid building ID'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  requiredSections: z.array(z.string()),
  optionalSections: z.array(z.string()),
  requiredDocuments: z.array(z.nativeEnum(DocumentCategory)),
  optionalDocuments: z.array(z.nativeEnum(DocumentCategory)),
  enabledDisclosures: z.array(z.nativeEnum(DisclosureType)),
  buildingPolicies: buildingPoliciesSchema,
})

/**
 * GET /api/templates
 * Get all templates (agent/admin only)
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

    // Fetch templates
    const templates = await getTemplates()

    return NextResponse.json({ templates }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/templates:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/templates
 * Create a new template (agent/admin only)
 */
export async function POST(request: NextRequest) {
  try {
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
    const validationResult = createTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    const input: CreateTemplateInput = validationResult.data as CreateTemplateInput

    // Create template
    const template = await createTemplate(input)

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/templates:', error)
    return NextResponse.json(
      {
        error: 'Failed to create template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
