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
  // For broker-initiated applications
  primaryApplicantEmail?: string
  primaryApplicantName?: string
}

/**
 * Get all applications for a user based on their role
 *
 * @param userId - The ID of the current user
 * @param role - The role of the current user
 * @returns Array of applications the user has access to
 */
export async function getApplications(
  _userId: string,
  _role: Role
): Promise<Application[]> {
  const supabase = await createClient()

  // RLS policies will automatically filter based on user's role and permissions
  // Note: Simplified query without joins until RLS policies are set up for all tables
  const { data, error } = await supabase
    .from('applications')
    .select('*, building:buildings(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw new Error(`Failed to fetch applications: ${error.message}`)
  }

  // Transform data to match Application type (with empty arrays for missing relations)
  const applications = (data || []).map(app => ({
    ...app,
    people: [],
    employment_records: [],
    financial_entries: [],
    real_estate_properties: [],
    documents: [],
    disclosures: [],
    rfis: [],
  }))

  return applications as unknown as Application[]
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
      application_participants(*)
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

  // Extract metadata fields to top level for easy access
  const metadata = (data.metadata as Record<string, unknown>) || {}

  // Get people - prefer metadata (for co-applicants/guarantors) over database table
  // Database table is used by Profile page, metadata is used by People page
  const metadataPeople = metadata.people as Array<Record<string, unknown>> | undefined
  const databasePeople = data.people || []

  // Merge: database people (primary applicant from Profile) + metadata people (co-applicants from People page)
  const allPeople = metadataPeople && metadataPeople.length > 0
    ? [...databasePeople, ...metadataPeople.filter(mp => !databasePeople.some((dp: { id?: string }) => dp.id === mp.id))]
    : databasePeople

  // Get disclosures - prefer metadata (with acknowledgments) over database table
  // Metadata disclosures have signatures, acknowledgment status, etc.
  const metadataDisclosures = metadata.disclosures as Array<Record<string, unknown>> | undefined

  // Ensure all arrays exist (for backward compatibility with old data)
  const enrichedApplication = {
    ...data,
    people: allPeople,
    employmentRecords: data.employment_records || [],
    employment_records: data.employment_records || [],
    financialEntries: data.financial_entries || [],
    financial_entries: data.financial_entries || [],
    // Use metadata realEstateProperties if available, otherwise use database table
    realEstateProperties: (metadata.realEstateProperties as Array<Record<string, unknown>>) || data.real_estate_properties || [],
    real_estate_properties: (metadata.realEstateProperties as Array<Record<string, unknown>>) || data.real_estate_properties || [],
    documents: data.documents || [],
    // Use metadata disclosures if available (they have acknowledgment data)
    disclosures: metadataDisclosures || data.disclosures || [],
    rfis: data.rfis || [],
    application_participants: data.application_participants || [],
    sections: data.sections || [],
    // Extract commonly used metadata fields to top level
    leaseTerms: metadata.leaseTerms || null,
    buildingPolicies: metadata.buildingPolicies || null,
    coverLetter: metadata.coverLetter || null,
    // Deal parties (unit owner, attorneys, brokers)
    participants: metadata.participants || [],
  }

  return enrichedApplication as unknown as Application
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

  // Get user's role to determine if this is broker-initiated
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isBroker = profile?.role === 'BROKER'
  const isBrokerOwned = isBroker && !!data.primaryApplicantEmail

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
      broker_owned: isBrokerOwned,
      primary_applicant_email: data.primaryApplicantEmail || null,
      primary_applicant_id: null, // Will be set when applicant accepts invitation
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

  // Add empty arrays for related entities that weren't fetched
  const enrichedApplication = {
    ...application,
    people: [],
    employment_records: [],
    financial_entries: [],
    real_estate_properties: [],
    documents: [],
    disclosures: [],
    rfis: [],
    application_participants: [],
    sections: [],
  }

  return enrichedApplication as unknown as Application
}

/**
 * Update an existing application
 *
 * @param id - The application ID
 * @param data - Partial application data to update
 * @returns The updated application
 */
// Type for update data - allows flexible metadata fields
type UpdateApplicationData = {
  buildingId?: string
  unit?: string
  transactionType?: string
  status?: string
  submittedAt?: string | Date
  completionPercentage?: number
  isLocked?: boolean
  currentSection?: string
  coverLetter?: string
  leaseTerms?: Record<string, unknown>
  buildingPolicies?: Record<string, unknown>
  // Deal parties (unit owner, attorneys, brokers)
  participants?: Array<Record<string, unknown>>
  // Disclosure acknowledgments with signatures and extra data
  disclosures?: Array<Record<string, unknown>>
  // Co-applicants/guarantors added via People page (stored in metadata)
  people?: Array<Record<string, unknown>>
  // Real estate properties
  realEstateProperties?: Array<Record<string, unknown>>
  metadata?: Record<string, unknown>
}

export async function updateApplication(
  id: string,
  data: UpdateApplicationData
): Promise<Application> {
  const supabase = await createClient()

  // First, get the current application to merge metadata
  const { data: currentApp, error: fetchError } = await supabase
    .from('applications')
    .select('metadata')
    .eq('id', id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching current application:', fetchError)
    throw new Error(`Failed to fetch application: ${fetchError.message}`)
  }

  // Convert camelCase to snake_case for database
  const dbData: Record<string, unknown> = {}

  if (data.buildingId) dbData.building_id = data.buildingId
  if (data.unit !== undefined) dbData.unit = data.unit
  if (data.transactionType) dbData.transaction_type = data.transactionType
  if (data.status) dbData.status = data.status
  if (data.submittedAt) dbData.submitted_at = data.submittedAt
  if (data.completionPercentage !== undefined) dbData.completion_percentage = data.completionPercentage
  if (data.isLocked !== undefined) dbData.is_locked = data.isLocked
  if (data.currentSection !== undefined) dbData.current_section = data.currentSection

  // Handle metadata fields - merge with existing metadata
  const existingMetadata = (currentApp?.metadata as Record<string, unknown>) || {}
  const newMetadata: Record<string, unknown> = { ...existingMetadata }

  if (data.coverLetter !== undefined) {
    newMetadata.coverLetter = data.coverLetter
  }
  if (data.leaseTerms !== undefined) {
    newMetadata.leaseTerms = data.leaseTerms
  }
  if (data.buildingPolicies !== undefined) {
    newMetadata.buildingPolicies = data.buildingPolicies
  }
  // Store deal parties (unit owner, attorneys, brokers) in metadata
  if (data.participants !== undefined) {
    newMetadata.participants = data.participants
  }
  // Store disclosure acknowledgments (with signatures, etc.) in metadata
  if (data.disclosures !== undefined) {
    newMetadata.disclosures = data.disclosures
  }
  // Store co-applicants/guarantors from People page in metadata
  if (data.people !== undefined) {
    newMetadata.people = data.people
  }
  // Store real estate properties in metadata
  if (data.realEstateProperties !== undefined) {
    newMetadata.realEstateProperties = data.realEstateProperties
  }
  if (data.metadata !== undefined) {
    Object.assign(newMetadata, data.metadata)
  }

  // Only update metadata if there's something to update
  if (Object.keys(newMetadata).length > 0) {
    dbData.metadata = newMetadata
  }

  const { data: applications, error } = await supabase
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

  if (error) {
    console.error('Error updating application:', error)
    throw new Error(`Failed to update application: ${error.message}`)
  }

  if (!applications || applications.length === 0) {
    throw new Error('Application not found after update')
  }

  const app = applications[0]

  // Extract metadata fields to top level for consistency with getApplication
  const metadata = (app.metadata as Record<string, unknown>) || {}

  // Get people - prefer metadata (for co-applicants/guarantors) over database table
  const metadataPeople = metadata.people as Array<Record<string, unknown>> | undefined
  const databasePeople = app.people || []
  const allPeople = metadataPeople && metadataPeople.length > 0
    ? [...databasePeople, ...metadataPeople.filter(mp => !databasePeople.some((dp: { id?: string }) => dp.id === mp.id))]
    : databasePeople

  // Get disclosures - prefer metadata (with acknowledgments) over database table
  const metadataDisclosures = metadata.disclosures as Array<Record<string, unknown>> | undefined

  const enrichedApplication = {
    ...app,
    people: allPeople,
    employmentRecords: app.employment_records || [],
    employment_records: app.employment_records || [],
    financialEntries: app.financial_entries || [],
    financial_entries: app.financial_entries || [],
    // Use metadata realEstateProperties if available, otherwise use database table
    realEstateProperties: (metadata.realEstateProperties as Array<Record<string, unknown>>) || app.real_estate_properties || [],
    real_estate_properties: (metadata.realEstateProperties as Array<Record<string, unknown>>) || app.real_estate_properties || [],
    documents: app.documents || [],
    // Use metadata disclosures if available (they have acknowledgment data)
    disclosures: metadataDisclosures || app.disclosures || [],
    rfis: app.rfis || [],
    // Extract commonly used metadata fields to top level
    leaseTerms: metadata.leaseTerms || null,
    buildingPolicies: metadata.buildingPolicies || null,
    coverLetter: metadata.coverLetter || null,
    // Deal parties (unit owner, attorneys, brokers)
    participants: metadata.participants || [],
  }

  return enrichedApplication as unknown as Application
}

/**
 * Delete an application and all associated data
 *
 * This function:
 * 1. Deletes all documents from Supabase Storage
 * 2. Deletes document records from database
 * 3. Deletes related records (people, employment, financials, etc.)
 * 4. Soft deletes the application record
 *
 * @param id - The application ID
 */
export async function deleteApplication(id: string): Promise<void> {
  const supabase = await createClient()

  // Get current user for storage path
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Step 1: Get all documents for this application
  const { data: documents } = await supabase
    .from('documents')
    .select('id, storage_path')
    .eq('application_id', id)

  // Step 2: Delete files from Supabase Storage
  if (documents && documents.length > 0) {
    const storagePaths = documents
      .map(doc => doc.storage_path)
      .filter((path): path is string => !!path)

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(storagePaths)

      if (storageError) {
        console.error('Error deleting files from storage:', storageError)
        // Continue with deletion even if storage cleanup fails
      }
    }

    // Step 3: Delete document records from database
    const { error: docsError } = await supabase
      .from('documents')
      .delete()
      .eq('application_id', id)

    if (docsError) {
      console.error('Error deleting document records:', docsError)
    }
  }

  // Step 4: Delete related records (cascade should handle this, but being explicit)
  // Delete people records
  await supabase.from('people').delete().eq('application_id', id)
  // Delete employment records
  await supabase.from('employment_records').delete().eq('application_id', id)
  // Delete financial entries
  await supabase.from('financial_entries').delete().eq('application_id', id)
  // Delete real estate properties
  await supabase.from('real_estate_properties').delete().eq('application_id', id)
  // Delete disclosures
  await supabase.from('disclosures').delete().eq('application_id', id)
  // Delete RFI messages first (foreign key constraint)
  const { data: rfis } = await supabase.from('rfis').select('id').eq('application_id', id)
  if (rfis) {
    for (const rfi of rfis) {
      await supabase.from('rfi_messages').delete().eq('rfi_id', rfi.id)
    }
  }
  // Delete RFIs
  await supabase.from('rfis').delete().eq('application_id', id)
  // Delete application participants
  await supabase.from('application_participants').delete().eq('application_id', id)

  // Step 5: Soft delete the application
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

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

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

  // Check if user has permission to submit
  // For broker-owned applications, only the broker (creator) can submit
  // For applicant-owned applications, the applicant (creator) can submit
  const { data: canSubmitData } = await supabase
    .rpc('can_submit_application', { app_id: id })

  if (!canSubmitData) {
    throw new Error('You do not have permission to submit this application')
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
