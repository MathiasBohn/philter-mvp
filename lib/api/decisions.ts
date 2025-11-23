/**
 * Decision Data Access Layer
 *
 * Provides functions for managing application decisions.
 */

import { createClient } from '@/lib/supabase/server'
import type { DecisionRecord, Decision } from '@/lib/types'

/**
 * Input type for creating a new decision
 */
export type CreateDecisionInput = {
  applicationId: string
  decision: Decision
  reasonCodes?: string[]
  notes?: string
  conditions?: string
  usesConsumerReport: boolean
}

/**
 * Create a decision record
 *
 * @param data - Decision data
 * @returns The created decision record
 */
export async function createDecision(
  data: CreateDecisionInput
): Promise<DecisionRecord> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Determine if adverse action notice is required
  // Adverse action is required if decision is DENY or CONDITIONAL and uses consumer report
  const adverseActionRequired =
    data.usesConsumerReport &&
    (data.decision === 'DENY' || data.decision === 'CONDITIONAL')

  // Create the decision record
  const { data: decisionRecord, error } = await supabase
    .from('decision_records')
    .insert({
      application_id: data.applicationId,
      decision: data.decision,
      reason_codes: data.reasonCodes || [],
      notes: data.notes,
      conditions: data.conditions,
      uses_consumer_report: data.usesConsumerReport,
      adverse_action_required: adverseActionRequired,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating decision:', error)
    throw new Error(`Failed to create decision: ${error.message}`)
  }

  // Update application status based on decision
  let newStatus: string
  switch (data.decision) {
    case 'APPROVE':
      newStatus = 'APPROVED'
      break
    case 'CONDITIONAL':
      newStatus = 'CONDITIONAL'
      break
    case 'DENY':
      newStatus = 'DENIED'
      break
    default:
      newStatus = 'IN_REVIEW'
  }

  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', data.applicationId)

  if (updateError) {
    console.error('Error updating application status:', updateError)
    // Don't throw - decision is created, status update is secondary
  }

  return {
    id: decisionRecord.id,
    applicationId: decisionRecord.application_id,
    decision: decisionRecord.decision as Decision,
    reasonCodes: decisionRecord.reason_codes || [],
    notes: decisionRecord.notes,
    usesConsumerReport: decisionRecord.uses_consumer_report,
    adverseActionRequired: decisionRecord.adverse_action_required,
    decidedBy: decisionRecord.decided_by,
    decidedAt: new Date(decisionRecord.decided_at),
  }
}

/**
 * Get the decision for an application
 *
 * @param applicationId - The application ID
 * @returns The decision record or null if not found
 */
export async function getDecision(
  applicationId: string
): Promise<DecisionRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('decision_records')
    .select('*')
    .eq('application_id', applicationId)
    .order('decided_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching decision:', error)
    throw new Error(`Failed to fetch decision: ${error.message}`)
  }

  return {
    id: data.id,
    applicationId: data.application_id,
    decision: data.decision as Decision,
    reasonCodes: data.reason_codes || [],
    notes: data.notes,
    usesConsumerReport: data.uses_consumer_report,
    adverseActionRequired: data.adverse_action_required,
    decidedBy: data.decided_by,
    decidedAt: new Date(data.decided_at),
  }
}

/**
 * Get all decisions (for compliance reports)
 *
 * @param filters - Optional filters for decisions
 * @returns Array of decision records
 */
export async function getDecisions(filters?: {
  adverseActionRequired?: boolean
  fromDate?: Date
  toDate?: Date
}): Promise<DecisionRecord[]> {
  const supabase = await createClient()

  let query = supabase
    .from('decision_records')
    .select('*')
    .order('decided_at', { ascending: false })

  if (filters?.adverseActionRequired !== undefined) {
    query = query.eq('adverse_action_required', filters.adverseActionRequired)
  }

  if (filters?.fromDate) {
    query = query.gte('decided_at', filters.fromDate.toISOString())
  }

  if (filters?.toDate) {
    query = query.lte('decided_at', filters.toDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching decisions:', error)
    throw new Error(`Failed to fetch decisions: ${error.message}`)
  }

  return (data || []).map(record => ({
    id: record.id,
    applicationId: record.application_id,
    decision: record.decision as Decision,
    reasonCodes: record.reason_codes || [],
    notes: record.notes,
    usesConsumerReport: record.uses_consumer_report,
    adverseActionRequired: record.adverse_action_required,
    decidedBy: record.decided_by,
    decidedAt: new Date(record.decided_at),
  }))
}
