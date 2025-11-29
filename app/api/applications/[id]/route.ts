/**
 * Application Detail API Routes
 *
 * GET /api/applications/[id] - Get a single application
 * PATCH /api/applications/[id] - Update an application
 * DELETE /api/applications/[id] - Delete an application (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getApplication,
  updateApplication,
  deleteApplication,
} from '@/lib/api/applications'
import { validateRouteUUID } from '@/lib/api/validate'
import { z } from 'zod'
import { ApplicationStatus } from '@/lib/types'

// Lease terms schema
const leaseTermsSchema = z.object({
  monthlyRent: z.number().optional(),
  securityDeposit: z.number().optional(),
  leaseLengthYears: z.number().optional(),
  leaseStartDate: z.union([z.string(), z.date()]).optional(),
  leaseEndDate: z.union([z.string(), z.date()]).optional(),
  moveInDate: z.union([z.string(), z.date()]).optional(),
  specialConditions: z.string().optional(),
  annualRent: z.number().optional(),
}).optional()

// Building policies schema
const buildingPoliciesSchema = z.object({
  petsAllowed: z.boolean().optional(),
  petTypes: z.array(z.string()).optional(),
  petDeposit: z.number().optional(),
  smokingAllowed: z.boolean().optional(),
  smokingAreas: z.string().optional(),
  renovationsAllowed: z.boolean().optional(),
  renovationApprovalRequired: z.boolean().optional(),
  sublettingAllowed: z.boolean().optional(),
  sublettingTerms: z.string().optional(),
  additionalPolicies: z.string().optional(),
  acknowledgedAt: z.union([z.string(), z.date()]).optional(),
}).optional()

// Participant schema for deal parties (unit owner, attorneys, brokers)
const participantSchema = z.object({
  id: z.string().optional(),
  role: z.string(),
  name: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

// Disclosure acknowledgment schema
const disclosureAcknowledgmentSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  pdfUrl: z.string().optional(),
  acknowledged: z.boolean(),
  requiresUpload: z.boolean().optional(),
  requiresSignature: z.boolean().optional(),
  signature: z.string().optional(),
  floodOptions: z.array(z.string()).optional(),
  hasPets: z.boolean().optional(),
  pets: z.array(z.record(z.string(), z.unknown())).optional(),
  consumerReportData: z.record(z.string(), z.unknown()).optional(),
  signedDocument: z.record(z.string(), z.unknown()).optional(),
})

// People schema for co-applicants/guarantors saved via updateApplication
const personSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  ssnLast4: z.string().optional(),
})

// Real estate property schema
const realEstatePropertySchema = z.object({
  id: z.string().optional(),
  propertyType: z.string().optional(),
  marketValue: z.number().optional(),
  mortgageBalance: z.number().optional(),
  monthlyMortgagePayment: z.number().optional(),
  monthlyMaintenanceHOA: z.number().optional(),
  monthlyRealEstateTaxes: z.number().optional(),
  monthlyInsurance: z.number().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
})

// Validation schema for updating an application
const updateApplicationSchema = z.object({
  unit: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  coverLetter: z.string().optional(),
  currentSection: z.string().optional(),
  isLocked: z.boolean().optional(),
  // Additional metadata fields
  leaseTerms: leaseTermsSchema,
  buildingPolicies: buildingPoliciesSchema,
  // Deal parties (unit owner, attorneys, brokers)
  participants: z.array(participantSchema).optional(),
  // Disclosure acknowledgments with signatures and extra data
  disclosures: z.array(disclosureAcknowledgmentSchema).optional(),
  // Co-applicants/guarantors added via People page
  people: z.array(personSchema).optional(),
  // Real estate properties
  realEstateProperties: z.array(realEstatePropertySchema).optional(),
  // Allow arbitrary metadata for flexibility
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * GET /api/applications/[id]
 * Get a single application by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate UUID format
    const validation = await validateRouteUUID(params)
    if (validation.error) {
      console.log('[GET /api/applications/[id]] UUID validation failed')
      return validation.error
    }
    const { id } = validation
    console.log('[GET /api/applications/[id]] Fetching application:', id)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[GET /api/applications/[id]] Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    })

    if (authError || !user) {
      console.log('[GET /api/applications/[id]] Returning 401 - authError:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
    }

    // Fetch application (RLS will ensure user has access)
    console.log('[GET /api/applications/[id]] Calling getApplication...')
    const application = await getApplication(id)

    if (!application) {
      console.log('[GET /api/applications/[id]] Application not found')
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    console.log('[GET /api/applications/[id]] Success - returning application')
    return NextResponse.json({ application }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/applications/[id]] Caught error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch application',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/applications/[id]
 * Update an application
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateApplicationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    // Update application (RLS will ensure user has permission)
    const application = await updateApplication(id, validationResult.data)

    return NextResponse.json({ application }, { status: 200 })
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]:', error)
    return NextResponse.json(
      {
        error: 'Failed to update application',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/applications/[id]
 * Soft delete an application
 */
export async function DELETE(
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

    // Delete application (RLS will ensure user has permission)
    await deleteApplication(id)

    return NextResponse.json(
      { message: 'Application deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/applications/[id]:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete application',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
