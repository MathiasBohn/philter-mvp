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
  ApplicationSection,
  Role,
  TransactionType,
} from '@/lib/types'
import type { Json } from '@/lib/database.types'
import { isNotFoundError } from '@/lib/constants/supabase-errors'

// =============================================================================
// Strict Metadata Types (3.5)
// =============================================================================

/**
 * Person data from metadata or database
 */
interface PersonData {
  id?: string
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: string
}

/**
 * Employment record data
 */
interface EmploymentData {
  id?: string
  employer?: string
  employer_name?: string
  title?: string
  job_title?: string
  annualIncome?: number
  annual_income?: number
}

/**
 * Financial entry data
 */
interface FinancialEntryData {
  id?: string
  entry_type?: string
  category?: string
  amount?: number
}

/**
 * Document data
 */
interface DocumentData {
  id?: string
  category?: string
  filename?: string
}

/**
 * Disclosure data
 */
interface DisclosureData {
  id?: string
  type?: string
  acknowledged?: boolean
}

/**
 * Participant data for deal parties
 */
interface ParticipantData {
  id?: string
  role?: string
  name?: string
  email?: string
}

/**
 * Lease terms metadata
 */
interface LeaseTermsData {
  monthlyRent?: number
  leaseDuration?: number
  startDate?: string
}

/**
 * Building policies metadata
 */
interface BuildingPoliciesData {
  acknowledgedAt?: string
  policies?: string[]
}

/**
 * Real estate property data
 */
interface RealEstatePropertyData {
  id?: string
  address?: object
  propertyType?: string
  marketValue?: number
}

/**
 * Application metadata structure
 */
export interface ApplicationMetadata {
  participants?: ParticipantData[]
  disclosures?: DisclosureData[]
  coverLetter?: string
  leaseTerms?: LeaseTermsData
  buildingPolicies?: BuildingPoliciesData
  people?: PersonData[]
  realEstateProperties?: RealEstatePropertyData[]
}

// =============================================================================
// Type Guards for Safe Array Handling (3.4)
// =============================================================================

/**
 * Type guard to check if value is an array
 */
function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * Safely extract array from unknown data with type coercion
 */
function safeArray<T>(value: unknown): T[] {
  if (isArray<T>(value)) {
    return value
  }
  return []
}

/**
 * Safely extract metadata from JSON
 */
function safeMetadata(json: Json | null | undefined): ApplicationMetadata {
  if (json === null || json === undefined) return {}
  if (typeof json !== 'object' || Array.isArray(json)) return {}
  return json as unknown as ApplicationMetadata
}

/**
 * Default sections for applications
 * These are computed dynamically based on application data
 */
const DEFAULT_SECTIONS = [
  { key: 'profile', label: 'Profile' },
  { key: 'parties', label: 'Deal Parties' },
  { key: 'people', label: 'People' },
  { key: 'income', label: 'Employment & Income' },
  { key: 'financials', label: 'Financial Summary' },
  { key: 'real-estate', label: 'Real Estate Holdings' },
  { key: 'lease-terms', label: 'Lease Terms' },
  { key: 'building-policies', label: 'Building Policies' },
  { key: 'documents', label: 'Documents' },
  { key: 'cover-letter', label: 'Cover Letter' },
  { key: 'disclosures', label: 'Disclosures' },
  { key: 'review', label: 'Review & Submit' },
] as const

/**
 * Compute section completion status from application data
 */
function computeSections(app: Record<string, unknown>): ApplicationSection[] {
  // Safely extract arrays with proper typing
  const people = safeArray<PersonData>(app.people)
  const employmentRecords = safeArray<EmploymentData>(app.employment_records)
  const financialEntries = safeArray<FinancialEntryData>(app.financial_entries)
  const realEstateProperties = safeArray<RealEstatePropertyData>(app.real_estate_properties)
  const documents = safeArray<DocumentData>(app.documents)
  const disclosures = safeArray<DisclosureData>(app.disclosures)

  // Safely extract metadata with proper typing
  const metadata = safeMetadata(app.metadata as Json)
  const participants = safeArray<ParticipantData>(metadata.participants)
  const metadataDisclosures = safeArray<DisclosureData>(metadata.disclosures)
  const coverLetter = typeof metadata.coverLetter === 'string' ? metadata.coverLetter : ''
  const leaseTerms = metadata.leaseTerms
  const buildingPolicies = metadata.buildingPolicies
  const status = typeof app.status === 'string' ? app.status : ''

  return DEFAULT_SECTIONS.map(section => {
    let isComplete = false

    switch (section.key) {
      case 'profile':
        if (people.length > 0) {
          const primary = people[0]
          // Check both camelCase and database field naming conventions
          const hasName = primary.fullName || (primary.firstName && primary.lastName)
          isComplete = !!(hasName && primary.email && primary.phone)
        }
        break
      case 'parties':
        isComplete = participants.length > 0
        break
      case 'people':
        // Optional section - complete if at least one co-applicant/guarantor exists
        isComplete = people.length > 1
        break
      case 'income':
        isComplete = employmentRecords.some(
          (r) => {
            const hasEmployer = r.employer || r.employer_name
            const hasTitle = r.title || r.job_title
            const hasIncome = r.annualIncome || r.annual_income
            return hasEmployer && hasTitle && hasIncome
          }
        )
        break
      case 'financials':
        isComplete = financialEntries.length > 0
        break
      case 'real-estate':
        // Optional section
        isComplete = realEstateProperties.length > 0
        break
      case 'lease-terms':
        isComplete = !!(leaseTerms && Object.keys(leaseTerms).length > 0)
        break
      case 'building-policies':
        isComplete = !!(buildingPolicies && buildingPolicies.acknowledgedAt)
        break
      case 'documents': {
        // Check for required document categories
        const requiredCategories = ['GOVERNMENT_ID', 'BANK_STATEMENT', 'TAX_RETURN']
        const uploadedCategories = new Set(
          documents.map((doc) => doc.category).filter(Boolean)
        )
        isComplete = requiredCategories.every(cat => uploadedCategories.has(cat))
        break
      }
      case 'cover-letter':
        // Optional section - complete if there's meaningful content
        isComplete = coverLetter.length >= 100
        break
      case 'disclosures': {
        // Must have acknowledged all required disclosures
        const allDisclosures = metadataDisclosures.length > 0 ? metadataDisclosures : disclosures
        isComplete = allDisclosures.length >= 8
        break
      }
      case 'review':
        isComplete = ['SUBMITTED', 'IN_REVIEW', 'RFI', 'APPROVED', 'CONDITIONAL', 'DENIED'].includes(status)
        break
    }

    return {
      key: section.key,
      label: section.label,
      isComplete,
    }
  })
}

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
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw new Error(`Failed to fetch applications: ${error.message}`)
  }

  // Transform data to match Application type (with camelCase fields and empty arrays for missing relations)
  const applications = (data || []).map(app => ({
    // Core identification
    id: app.id,
    // Transform snake_case to camelCase for main fields
    buildingId: app.building_id,
    building: app.building,
    unit: app.unit,
    transactionType: app.transaction_type as TransactionType,
    status: app.status as ApplicationStatus,
    createdBy: app.created_by,
    createdAt: app.created_at,
    updatedAt: app.updated_at,
    submittedAt: app.submitted_at,
    brokerOwned: app.broker_owned,
    primaryApplicantEmail: app.primary_applicant_email,
    primaryApplicantId: app.primary_applicant_id,
    completionPercentage: app.completion_percentage ?? 0,
    currentSection: app.current_section,
    isLocked: app.is_locked ?? false,
    deletedAt: app.deleted_at,
    metadata: app.metadata,
    // Also keep snake_case versions for backward compatibility
    building_id: app.building_id,
    transaction_type: app.transaction_type,
    created_by: app.created_by,
    created_at: app.created_at,
    updated_at: app.updated_at,
    submitted_at: app.submitted_at,
    broker_owned: app.broker_owned,
    primary_applicant_email: app.primary_applicant_email,
    primary_applicant_id: app.primary_applicant_id,
    completion_percentage: app.completion_percentage,
    current_section: app.current_section,
    is_locked: app.is_locked,
    deleted_at: app.deleted_at,
    // Empty arrays for related entities
    people: [],
    employmentRecords: [],
    employment_records: [],
    financialEntries: [],
    financial_entries: [],
    realEstateProperties: [],
    real_estate_properties: [],
    documents: [],
    disclosures: [],
    rfis: [],
    sections: [],
  }))

  return applications as unknown as Application[]
}

// =============================================================================
// Explicit Return Types for Helper Functions (Type Safety Fix 3.7)
// =============================================================================

/**
 * Address entry in address history
 */
interface TransformedAddressEntry {
  id?: unknown
  street: string
  unit?: string
  city: string
  state: string
  zip: string
  fromDate: Date
  toDate?: Date
  isCurrent: boolean
}

/**
 * Emergency contact entry
 */
interface TransformedEmergencyContact {
  id?: unknown
  name?: unknown
  relationship?: unknown
  phone?: unknown
  email?: unknown
}

/**
 * Transformed person record from database to frontend format
 */
interface TransformedPerson {
  id?: unknown
  fullName: string
  firstName: string
  lastName: string
  email?: unknown
  phone?: unknown
  dob?: unknown
  ssnLast4?: unknown
  ssnFull?: undefined
  addressHistory: TransformedAddressEntry[]
  emergencyContacts: TransformedEmergencyContact[]
  role?: unknown
  [key: string]: unknown // Allow additional properties from dbPerson spread
}

/**
 * Transform a database person record to the frontend Person format
 */
function transformPersonRecord(dbPerson: Record<string, unknown>): TransformedPerson {
  // If already has fullName (from metadata), return with type coercion
  if (dbPerson.fullName) {
    return {
      ...dbPerson,
      fullName: dbPerson.fullName as string,
      firstName: (dbPerson.firstName as string) || '',
      lastName: (dbPerson.lastName as string) || '',
      addressHistory: (dbPerson.addressHistory as TransformedAddressEntry[]) || [],
      emergencyContacts: (dbPerson.emergencyContacts as TransformedEmergencyContact[]) || [],
    }
  }

  // Transform database snake_case to frontend camelCase
  const firstName = (dbPerson.first_name as string) || ''
  const lastName = (dbPerson.last_name as string) || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return {
    ...dbPerson,
    fullName,
    firstName,
    lastName,
    email: dbPerson.email,
    phone: dbPerson.phone,
    dob: dbPerson.date_of_birth,
    ssnLast4: dbPerson.ssn_last4,
    ssnFull: dbPerson.ssn_encrypted ? undefined : undefined, // Don't expose encrypted SSN
    // Transform address history if present
    addressHistory: dbPerson.address_history
      ? (dbPerson.address_history as Array<Record<string, unknown>>).map(addr => {
          const addrData = addr.address as Record<string, unknown> | undefined
          return {
            id: addr.id,
            street: String(addrData?.street || ''),
            unit: addrData?.unit !== undefined ? String(addrData.unit) : undefined,
            city: String(addrData?.city || ''),
            state: String(addrData?.state || ''),
            zip: String(addrData?.zip || ''),
            fromDate: addr.move_in_date ? new Date(addr.move_in_date as string) : new Date(),
            toDate: addr.move_out_date ? new Date(addr.move_out_date as string) : undefined,
            isCurrent: Boolean(addr.is_current),
          }
        })
      : [],
    // Transform emergency contacts if present
    emergencyContacts: dbPerson.emergency_contacts
      ? (dbPerson.emergency_contacts as Array<Record<string, unknown>>).map(contact => ({
          id: contact.id,
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email,
        }))
      : [],
  }
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
      people(*, address_history(*), emergency_contacts(*)),
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
    .is('deleted_at', null)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
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
  const databasePeople = (data.people || []).map(transformPersonRecord)

  // Merge: database people (primary applicant from Profile) + metadata people (co-applicants from People page)
  // Type Safety Fix 3.12: Added null safety to ID comparison
  const allPeople = metadataPeople && metadataPeople.length > 0
    ? [
        ...databasePeople,
        ...metadataPeople.filter(mp => {
          // If metadata person has no ID, include it (new person)
          if (!mp.id) return true
          // Only exclude if database person with same ID exists
          return !databasePeople.some(dp => dp.id && dp.id === mp.id)
        })
      ]
    : databasePeople

  // Get disclosures - prefer metadata (with acknowledgments) over database table
  // Metadata disclosures have signatures, acknowledgment status, etc.
  const metadataDisclosures = metadata.disclosures as Array<Record<string, unknown>> | undefined

  // Compute sections dynamically from application data
  const computedSections = computeSections(data)

  // Ensure all arrays exist (for backward compatibility with old data)
  // Transform snake_case database fields to camelCase for frontend
  const enrichedApplication = {
    // Core identification
    id: data.id,
    // Transform snake_case to camelCase for main fields
    buildingId: data.building_id,
    building: data.building,
    unit: data.unit,
    transactionType: data.transaction_type as TransactionType,
    status: data.status as ApplicationStatus,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    submittedAt: data.submitted_at,
    brokerOwned: data.broker_owned,
    primaryApplicantEmail: data.primary_applicant_email,
    primaryApplicantId: data.primary_applicant_id,
    completionPercentage: data.completion_percentage ?? 0,
    currentSection: data.current_section,
    isLocked: data.is_locked ?? false,
    deletedAt: data.deleted_at,
    metadata: data.metadata,
    // Also keep snake_case versions for backward compatibility
    building_id: data.building_id,
    transaction_type: data.transaction_type,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    submitted_at: data.submitted_at,
    broker_owned: data.broker_owned,
    primary_applicant_email: data.primary_applicant_email,
    primary_applicant_id: data.primary_applicant_id,
    completion_percentage: data.completion_percentage,
    current_section: data.current_section,
    is_locked: data.is_locked,
    deleted_at: data.deleted_at,
    // Related entities with camelCase names
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
    // Always use computed sections for accurate completion status
    sections: computedSections,
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

  // Transform snake_case to camelCase and add empty arrays for related entities
  const enrichedApplication = {
    // Core identification
    id: application.id,
    // Transform snake_case to camelCase for main fields
    buildingId: application.building_id,
    building: application.building,
    unit: application.unit,
    transactionType: application.transaction_type as TransactionType,
    status: application.status as ApplicationStatus,
    createdBy: application.created_by,
    createdAt: application.created_at,
    updatedAt: application.updated_at,
    submittedAt: application.submitted_at,
    brokerOwned: application.broker_owned,
    primaryApplicantEmail: application.primary_applicant_email,
    primaryApplicantId: application.primary_applicant_id,
    completionPercentage: application.completion_percentage ?? 0,
    currentSection: application.current_section,
    isLocked: application.is_locked ?? false,
    deletedAt: application.deleted_at,
    metadata: application.metadata,
    // Also keep snake_case versions for backward compatibility
    building_id: application.building_id,
    transaction_type: application.transaction_type,
    created_by: application.created_by,
    created_at: application.created_at,
    updated_at: application.updated_at,
    submitted_at: application.submitted_at,
    broker_owned: application.broker_owned,
    primary_applicant_email: application.primary_applicant_email,
    primary_applicant_id: application.primary_applicant_id,
    completion_percentage: application.completion_percentage,
    current_section: application.current_section,
    is_locked: application.is_locked,
    deleted_at: application.deleted_at,
    // Empty arrays for related entities
    people: [],
    employmentRecords: [],
    employment_records: [],
    financialEntries: [],
    financial_entries: [],
    realEstateProperties: [],
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
      people(*, address_history(*), emergency_contacts(*)),
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
  // Transform database people to frontend format
  const metadataPeople = metadata.people as Array<Record<string, unknown>> | undefined
  const databasePeople = (app.people || []).map(transformPersonRecord)
  // Type Safety Fix 3.12: Added null safety to ID comparison
  const allPeople = metadataPeople && metadataPeople.length > 0
    ? [
        ...databasePeople,
        ...metadataPeople.filter(mp => {
          // If metadata person has no ID, include it (new person)
          if (!mp.id) return true
          // Only exclude if database person with same ID exists
          return !databasePeople.some(dp => dp.id && dp.id === mp.id)
        })
      ]
    : databasePeople

  // Get disclosures - prefer metadata (with acknowledgments) over database table
  const metadataDisclosures = metadata.disclosures as Array<Record<string, unknown>> | undefined

  // Compute sections dynamically from application data
  const computedSections = computeSections(app)

  // Transform snake_case database fields to camelCase for frontend
  const enrichedApplication = {
    // Core identification
    id: app.id,
    // Transform snake_case to camelCase for main fields
    buildingId: app.building_id,
    building: app.building,
    unit: app.unit,
    transactionType: app.transaction_type as TransactionType,
    status: app.status as ApplicationStatus,
    createdBy: app.created_by,
    createdAt: app.created_at,
    updatedAt: app.updated_at,
    submittedAt: app.submitted_at,
    brokerOwned: app.broker_owned,
    primaryApplicantEmail: app.primary_applicant_email,
    primaryApplicantId: app.primary_applicant_id,
    completionPercentage: app.completion_percentage ?? 0,
    currentSection: app.current_section,
    isLocked: app.is_locked ?? false,
    deletedAt: app.deleted_at,
    metadata: app.metadata,
    // Also keep snake_case versions for backward compatibility
    building_id: app.building_id,
    transaction_type: app.transaction_type,
    created_by: app.created_by,
    created_at: app.created_at,
    updated_at: app.updated_at,
    submitted_at: app.submitted_at,
    broker_owned: app.broker_owned,
    primary_applicant_email: app.primary_applicant_email,
    primary_applicant_id: app.primary_applicant_id,
    completion_percentage: app.completion_percentage,
    current_section: app.current_section,
    is_locked: app.is_locked,
    deleted_at: app.deleted_at,
    // Related entities with camelCase names
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
    // Always use computed sections for accurate completion status
    sections: computedSections,
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
