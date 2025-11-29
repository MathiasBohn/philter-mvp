/**
 * API Route: /api/applications/[id]/financials
 *
 * Handles CRUD operations for financial entries (assets, liabilities, income, expenses)
 * associated with an application.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getFinancialEntries,
  getFinancialEntriesByType,
  upsertFinancialEntry,
  upsertFinancialEntries,
  getFinancialSummary,
  type FinancialEntryInput,
  type FinancialEntryType,
} from '@/lib/api/financials'
import { validateRouteUUID } from '@/lib/api/validate'

/**
 * GET /api/applications/[id]/financials
 * Fetch all financial entries for an application
 * Query param: ?type=ASSET|LIABILITY|INCOME|EXPENSE (optional)
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

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for type filter
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as FinancialEntryType | null

    // Fetch financial entries
    const financialEntries = type
      ? await getFinancialEntriesByType(id, type)
      : await getFinancialEntries(id)

    // If summary requested, include it
    if (searchParams.get('includeSummary') === 'true') {
      const summary = await getFinancialSummary(id)
      return NextResponse.json({
        entries: financialEntries,
        summary,
      })
    }

    return NextResponse.json(financialEntries)
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/financials:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications/[id]/financials
 * Create or update a financial entry for an application
 */
export async function POST(
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

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const financialData = body as FinancialEntryInput

    // Validate required fields
    if (!financialData.entryType || !financialData.category || financialData.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: entryType, category, amount' },
        { status: 400 }
      )
    }

    // Upsert financial entry
    const financialEntry = await upsertFinancialEntry(id, financialData)

    return NextResponse.json(financialEntry, { status: financialData.id ? 200 : 201 })
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/financials:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/applications/[id]/financials
 * Batch update multiple financial entries
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

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const financialData = body.financialEntries as FinancialEntryInput[]

    if (!Array.isArray(financialData)) {
      return NextResponse.json(
        { error: 'Invalid request body: expected array of financial entries' },
        { status: 400 }
      )
    }

    // Upsert all financial entries
    const results = await upsertFinancialEntries(id, financialData)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]/financials:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
