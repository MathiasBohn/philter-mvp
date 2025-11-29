/**
 * Employment Data Access Layer
 *
 * Provides functions for managing employment records in the database.
 * All functions use Supabase client and respect Row-Level Security policies.
 */

import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/database.types'

type EmploymentRecordRow = Database['public']['Tables']['employment_records']['Row']
type EmploymentRecordInsert = Database['public']['Tables']['employment_records']['Insert']

/**
 * Helper to convert null to undefined for optional fields
 */
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value
}

/**
 * Type guard for address JSON structure
 */
function isAddressJson(json: Json | null): json is {
  street: string
  unit?: string
  city: string
  state: string
  zip: string
  country?: string
} {
  if (json === null || typeof json !== 'object' || Array.isArray(json)) return false
  const obj = json as Record<string, unknown>
  return typeof obj.street === 'string' && typeof obj.city === 'string'
}

/**
 * Map database record to EmploymentRecord type
 */
function mapToEmploymentRecord(data: EmploymentRecordRow): EmploymentRecord {
  return {
    id: data.id,
    application_id: data.application_id,
    person_id: nullToUndefined(data.person_id),
    employer_name: data.employer_name,
    job_title: nullToUndefined(data.job_title),
    employment_status: data.employment_status as EmploymentStatus,
    start_date: data.start_date,
    end_date: nullToUndefined(data.end_date),
    is_current: data.is_current,
    annual_income: nullToUndefined(data.annual_income),
    pay_cadence: nullToUndefined(data.pay_cadence) as PayCadence | undefined,
    supervisor_name: nullToUndefined(data.supervisor_name),
    supervisor_phone: nullToUndefined(data.supervisor_phone),
    supervisor_email: nullToUndefined(data.supervisor_email),
    address: isAddressJson(data.address) ? data.address : undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Employment status enum (matches database)
 */
export type EmploymentStatus =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'SELF_EMPLOYED'
  | 'UNEMPLOYED'
  | 'RETIRED'

/**
 * Pay cadence enum (matches database)
 */
export type PayCadence =
  | 'HOURLY'
  | 'WEEKLY'
  | 'BI_WEEKLY'
  | 'SEMI_MONTHLY'
  | 'MONTHLY'
  | 'ANNUALLY'

/**
 * Employment record from database
 */
export type EmploymentRecord = {
  id: string
  application_id: string
  person_id?: string
  employer_name: string
  job_title?: string
  employment_status: EmploymentStatus
  start_date: string // ISO date string
  end_date?: string // ISO date string
  is_current: boolean
  annual_income?: number
  pay_cadence?: PayCadence
  supervisor_name?: string
  supervisor_phone?: string
  supervisor_email?: string
  address?: {
    street: string
    unit?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  created_at: string
  updated_at: string
}

/**
 * Input type for creating/updating employment record
 */
export type EmploymentInput = {
  id?: string // Optional for create, required for update
  personId?: string
  employerName: string
  jobTitle?: string
  employmentStatus: EmploymentStatus
  startDate: string // ISO date string
  endDate?: string // ISO date string
  isCurrent: boolean
  annualIncome?: number
  payCadence?: PayCadence
  supervisorName?: string
  supervisorPhone?: string
  supervisorEmail?: string
  address?: {
    street: string
    unit?: string
    city: string
    state: string
    zip: string
    country?: string
  }
}

/**
 * Get all employment records for an application
 */
export async function getEmploymentRecords(
  applicationId: string
): Promise<EmploymentRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employment_records')
    .select('*')
    .eq('application_id', applicationId)
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching employment records:', error)
    throw new Error(`Failed to fetch employment records: ${error.message}`)
  }

  return (data || []).map(mapToEmploymentRecord)
}

/**
 * Get a single employment record by ID
 */
export async function getEmploymentRecord(
  employmentId: string
): Promise<EmploymentRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employment_records')
    .select('*')
    .eq('id', employmentId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching employment record:', error)
    throw new Error(`Failed to fetch employment record: ${error.message}`)
  }

  return mapToEmploymentRecord(data)
}

/**
 * Create or update an employment record
 */
export async function upsertEmploymentRecord(
  applicationId: string,
  employmentData: EmploymentInput
): Promise<EmploymentRecord> {
  const supabase = await createClient()

  const employmentRecord: EmploymentRecordInsert = {
    application_id: applicationId,
    person_id: employmentData.personId,
    employer_name: employmentData.employerName,
    job_title: employmentData.jobTitle,
    employment_status: employmentData.employmentStatus,
    start_date: employmentData.startDate,
    end_date: employmentData.endDate,
    is_current: employmentData.isCurrent,
    annual_income: employmentData.annualIncome,
    pay_cadence: employmentData.payCadence,
    supervisor_name: employmentData.supervisorName,
    supervisor_phone: employmentData.supervisorPhone,
    supervisor_email: employmentData.supervisorEmail,
    address: employmentData.address as Json,
  }

  if (employmentData.id) {
    // Update existing record
    const { data, error } = await supabase
      .from('employment_records')
      .update(employmentRecord)
      .eq('id', employmentData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating employment record:', error)
      throw new Error(`Failed to update employment record: ${error.message}`)
    }

    return mapToEmploymentRecord(data)
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('employment_records')
      .insert(employmentRecord)
      .select()
      .single()

    if (error) {
      console.error('Error creating employment record:', error)
      throw new Error(`Failed to create employment record: ${error.message}`)
    }

    return mapToEmploymentRecord(data)
  }
}

/**
 * Upsert multiple employment records at once
 * Handles create/update/delete operations
 */
export async function upsertEmploymentRecords(
  applicationId: string,
  employmentRecords: EmploymentInput[]
): Promise<EmploymentRecord[]> {
  const supabase = await createClient()

  // Get existing employment records
  const { data: existing } = await supabase
    .from('employment_records')
    .select('id')
    .eq('application_id', applicationId)

  const existingIds = new Set((existing || []).map(e => e.id))
  const providedIds = new Set(employmentRecords.map(e => e.id).filter(Boolean))

  // Delete removed records
  const toDelete = Array.from(existingIds).filter(id => !providedIds.has(id))
  if (toDelete.length > 0) {
    await supabase
      .from('employment_records')
      .delete()
      .in('id', toDelete)
  }

  // Upsert provided records
  const results: EmploymentRecord[] = []
  for (const employment of employmentRecords) {
    const result = await upsertEmploymentRecord(applicationId, employment)
    results.push(result)
  }

  return results
}

/**
 * Delete an employment record
 */
export async function deleteEmploymentRecord(employmentId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('employment_records')
    .delete()
    .eq('id', employmentId)

  if (error) {
    console.error('Error deleting employment record:', error)
    throw new Error(`Failed to delete employment record: ${error.message}`)
  }
}
