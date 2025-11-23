/**
 * Application Data Access Layer
 *
 * Provides functions for managing application data in the database.
 * All functions use Supabase client and respect Row-Level Security policies.
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Application,
  ApplicationStatus,
  Role,
  TransactionType,
} from '@/lib/types'

/**
 * Input type for creating a new application
 */
export type CreateApplicationInput = {
  buildingId: string
  unit?: string
  transactionType: TransactionType
}

/**
 * Get all applications for a user based on their role
 *
 * @param userId - The ID of the current user
 * @param role - The role of the current user
 * @returns Array of applications the user has access to
 */
export async function getApplications(
  userId: string,
  role: Role
): Promise<Application[]> {
  const supabase = await createClient()

  // RLS policies will automatically filter based on user's role and permissions
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      building:buildings(*),
      people(*),
      employment_records(*),
      financial_entries(*),
      real_estate_properties(*),
      documents(*),
      disclosures(*),
      rfis(
        *,
        rfi_messages(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw new Error(`Failed to fetch applications: ${error.message}`)
  }

  return (data || []) as unknown as Application[]
}

/**
 * Get a single application by ID
 *
 * @param id - The application ID
 * @returns The application with all embedded entities, or null if not found
 */
export async function getApplication(id: string): Promise<Application | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      building:buildings(*),
      people(*),
      employment_records(*),
      financial_entries(*),
      real_estate_properties(*),
      documents(*),
      disclosures(*),
      rfis(
        *,
        rfi_messages(*)
      ),
      application_participants(
        *,
        user:users(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    console.error('Error fetching application:', error)
    throw new Error(`Failed to fetch application: ${error.message}`)
  }

  return data as unknown as Application
}

/**
 * Create a new application
 *
 * @param data - The application data
 * @returns The created application
 */
export async function createApplication(
  data: CreateApplicationInput
): Promise<Application> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      building_id: data.buildingId,
      unit: data.unit,
      transaction_type: data.transactionType,
      status: 'IN_PROGRESS' as ApplicationStatus,
      created_by: user.id,
      current_section: 'profile',
      completion_percentage: 0,
      is_locked: false,
    })
    .select(`
      *,
      building:buildings(*)
    `)
    .single()

  if (error) {
    console.error('Error creating application:', error)
    throw new Error(`Failed to create application: ${error.message}`)
  }

  return application as unknown as Application
}

/**
 * Update an existing application
 *
 * @param id - The application ID
 * @param data - Partial application data to update
 * @returns The updated application
 */
export async function updateApplication(
  id: string,
  data: Partial<Omit<Application, 'id' | 'createdAt' | 'createdBy'>>
): Promise<Application> {
  const supabase = await createClient()

  // Convert camelCase to snake_case for database
  const dbData: Record<string, unknown> = {}

  if (data.buildingId) dbData.building_id = data.buildingId
  if (data.unit !== undefined) dbData.unit = data.unit
  if (data.transactionType) dbData.transaction_type = data.transactionType
  if (data.status) dbData.status = data.status
  if (data.submittedAt) dbData.submitted_at = data.submittedAt
  if (data.completionPercentage !== undefined) dbData.completion_percentage = data.completionPercentage
  if (data.isLocked !== undefined) dbData.is_locked = data.isLocked
  if (data.coverLetter !== undefined) dbData.metadata = { coverLetter: data.coverLetter }

  const { data: application, error } = await supabase
    .from('applications')
    .update(dbData)
    .eq('id', id)
    .select(`
      *,
      building:buildings(*),
      people(*),
      employment_records(*),
      financial_entries(*),
      real_estate_properties(*),
      documents(*),
      disclosures(*),
      rfis(
        *,
        rfi_messages(*)
      )
    `)
    .single()

  if (error) {
    console.error('Error updating application:', error)
    throw new Error(`Failed to update application: ${error.message}`)
  }

  return application as unknown as Application
}

/**
 * Delete an application (soft delete)
 *
 * @param id - The application ID
 */
export async function deleteApplication(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('applications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting application:', error)
    throw new Error(`Failed to delete application: ${error.message}`)
  }
}

/**
 * Submit an application
 *
 * @param id - The application ID
 * @returns The updated application
 */
export async function submitApplication(id: string): Promise<Application> {
  const supabase = await createClient()

  // First, verify the application is complete
  const application = await getApplication(id)
  if (!application) {
    throw new Error('Application not found')
  }

  if (application.completionPercentage < 100) {
    throw new Error('Application is not complete and cannot be submitted')
  }

  if (application.status === 'SUBMITTED' || application.status === 'IN_REVIEW') {
    throw new Error('Application has already been submitted')
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'SUBMITTED' as ApplicationStatus,
      submitted_at: new Date().toISOString(),
      is_locked: true,
    })
    .eq('id', id)
    .select(`
      *,
      building:buildings(*),
      people(*),
      employment_records(*),
      financial_entries(*),
      real_estate_properties(*),
      documents(*),
      disclosures(*),
      rfis(
        *,
        rfi_messages(*)
      )
    `)
    .single()

  if (error) {
    console.error('Error submitting application:', error)
    throw new Error(`Failed to submit application: ${error.message}`)
  }

  return data as unknown as Application
}
