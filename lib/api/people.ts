/**
 * People Data Access Layer
 *
 * Provides functions for managing person records, address history, and emergency contacts.
 * Handles SSN encryption/decryption and all related database operations.
 */

import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'
import type { Database, Json } from '@/lib/database.types'
import CryptoJS from 'crypto-js'

type PersonInsert = Database['public']['Tables']['people']['Insert']

/**
 * Helper to convert null to undefined for optional fields
 */
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value
}

/**
 * Map database record to PersonRecord type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToPersonRecord(data: any): PersonRecord {
  return {
    id: data.id,
    application_id: data.application_id,
    role: data.role as Role,
    first_name: data.first_name,
    last_name: data.last_name,
    email: nullToUndefined(data.email),
    phone: nullToUndefined(data.phone),
    date_of_birth: nullToUndefined(data.date_of_birth),
    ssn_encrypted: nullToUndefined(data.ssn_encrypted),
    ssn_last4: nullToUndefined(data.ssn_last4),
    current_address: data.current_address as PersonRecord['current_address'],
    created_at: data.created_at,
    updated_at: data.updated_at,
    address_history: data.address_history?.map((ah: Record<string, unknown>) => ({
      id: ah.id,
      person_id: ah.person_id,
      address: ah.address as AddressHistoryRecord['address'],
      move_in_date: ah.move_in_date,
      move_out_date: nullToUndefined(ah.move_out_date as string | null),
      is_current: ah.is_current,
      landlord_name: nullToUndefined(ah.landlord_name as string | null),
      landlord_phone: nullToUndefined(ah.landlord_phone as string | null),
      landlord_email: nullToUndefined(ah.landlord_email as string | null),
      monthly_rent: nullToUndefined(ah.monthly_rent as number | null),
      created_at: ah.created_at,
      updated_at: ah.updated_at,
    })),
    emergency_contacts: data.emergency_contacts?.map((ec: Record<string, unknown>) => ({
      id: ec.id,
      person_id: ec.person_id,
      name: ec.name,
      relationship: ec.relationship,
      phone: ec.phone,
      email: nullToUndefined(ec.email as string | null),
      created_at: ec.created_at,
      updated_at: ec.updated_at,
    })),
  }
}

/**
 * Encrypt SSN for storage
 */
function encryptSSN(ssn: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production'
  return CryptoJS.AES.encrypt(ssn, key).toString()
}

/**
 * Decrypt SSN for display
 */
function decryptSSN(encryptedSSN: string): string {
  try {
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production'
    const bytes = CryptoJS.AES.decrypt(encryptedSSN, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Failed to decrypt SSN:', error)
    return ''
  }
}

/**
 * Person record from database
 */
export type PersonRecord = {
  id: string
  application_id: string
  role: Role
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  ssn_encrypted?: string
  ssn_last4?: string
  current_address?: {
    street: string
    unit?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  created_at: string
  updated_at: string
  address_history?: AddressHistoryRecord[]
  emergency_contacts?: EmergencyContactRecord[]
}

export type AddressHistoryRecord = {
  id: string
  person_id: string
  address: {
    street: string
    unit?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  move_in_date: string
  move_out_date?: string
  is_current: boolean
  landlord_name?: string
  landlord_phone?: string
  landlord_email?: string
  monthly_rent?: number
  created_at: string
  updated_at: string
}

export type EmergencyContactRecord = {
  id: string
  person_id: string
  name: string
  relationship: string
  phone: string
  email?: string
  created_at: string
  updated_at: string
}

/**
 * Input type for creating/updating a person
 */
export type PersonInput = {
  id?: string // Optional for create, required for update
  role: Role
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: string // ISO date string
  ssn?: string // Full SSN (will be encrypted)
  currentAddress?: {
    street: string
    unit?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  addressHistory?: Array<{
    id?: string
    address: {
      street: string
      unit?: string
      city: string
      state: string
      zip: string
      country?: string
    }
    moveInDate: string // ISO date string
    moveOutDate?: string // ISO date string
    isCurrent: boolean
    landlordName?: string
    landlordPhone?: string
    landlordEmail?: string
    monthlyRent?: number
  }>
  emergencyContacts?: Array<{
    id?: string
    name: string
    relationship: string
    phone: string
    email?: string
  }>
}

/**
 * Get all people for an application
 */
export async function getPeople(applicationId: string): Promise<PersonRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select(`
      *,
      address_history (*),
      emergency_contacts (*)
    `)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching people:', error)
    throw new Error(`Failed to fetch people: ${error.message}`)
  }

  return (data || []).map(mapToPersonRecord)
}

/**
 * Get a single person by ID
 */
export async function getPerson(personId: string): Promise<PersonRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select(`
      *,
      address_history (*),
      emergency_contacts (*)
    `)
    .eq('id', personId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching person:', error)
    throw new Error(`Failed to fetch person: ${error.message}`)
  }

  return mapToPersonRecord(data)
}

/**
 * Create or update a person record
 * If id is provided and exists, updates the record. Otherwise creates a new one.
 */
export async function upsertPerson(
  applicationId: string,
  personData: PersonInput
): Promise<PersonRecord> {
  const supabase = await createClient()

  // Prepare person data
  const personRecord: PersonInsert = {
    application_id: applicationId,
    role: personData.role as string as Database['public']['Enums']['role_enum'],
    first_name: personData.firstName,
    last_name: personData.lastName,
    email: personData.email,
    phone: personData.phone,
    date_of_birth: personData.dateOfBirth,
    current_address: personData.currentAddress as Json,
    ssn_encrypted: personData.ssn ? encryptSSN(personData.ssn) : undefined,
    ssn_last4: personData.ssn ? personData.ssn.replace(/\D/g, '').slice(-4) : undefined,
  }

  let personId: string

  if (personData.id) {
    // Update existing person
    const { data, error } = await supabase
      .from('people')
      .update(personRecord)
      .eq('id', personData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating person:', error)
      throw new Error(`Failed to update person: ${error.message}`)
    }

    personId = data.id
  } else {
    // Create new person
    const { data, error } = await supabase
      .from('people')
      .insert(personRecord)
      .select()
      .single()

    if (error) {
      console.error('Error creating person:', error)
      throw new Error(`Failed to create person: ${error.message}`)
    }

    personId = data.id
  }

  // Handle address history
  if (personData.addressHistory) {
    await upsertAddressHistory(personId, personData.addressHistory)
  }

  // Handle emergency contacts
  if (personData.emergencyContacts) {
    await upsertEmergencyContacts(personId, personData.emergencyContacts)
  }

  // Fetch and return the complete person record
  const person = await getPerson(personId)
  if (!person) {
    throw new Error('Failed to fetch created/updated person')
  }

  return person
}

/**
 * Upsert address history for a person
 */
async function upsertAddressHistory(
  personId: string,
  addressHistory: PersonInput['addressHistory']
): Promise<void> {
  if (!addressHistory) return

  const supabase = await createClient()

  // Get existing address history
  const { data: existing } = await supabase
    .from('address_history')
    .select('id')
    .eq('person_id', personId)

  const existingIds = new Set((existing || []).map(a => a.id))
  const providedIds = new Set(addressHistory.map(a => a.id).filter(Boolean))

  // Delete removed addresses
  const toDelete = Array.from(existingIds).filter(id => !providedIds.has(id))
  if (toDelete.length > 0) {
    await supabase
      .from('address_history')
      .delete()
      .in('id', toDelete)
  }

  // Upsert provided addresses
  for (const addr of addressHistory) {
    const addressRecord = {
      person_id: personId,
      address: addr.address,
      move_in_date: addr.moveInDate,
      move_out_date: addr.moveOutDate,
      is_current: addr.isCurrent,
      landlord_name: addr.landlordName,
      landlord_phone: addr.landlordPhone,
      landlord_email: addr.landlordEmail,
      monthly_rent: addr.monthlyRent,
    }

    if (addr.id) {
      // Update existing
      await supabase
        .from('address_history')
        .update(addressRecord)
        .eq('id', addr.id)
    } else {
      // Create new
      await supabase
        .from('address_history')
        .insert(addressRecord)
    }
  }
}

/**
 * Upsert emergency contacts for a person
 */
async function upsertEmergencyContacts(
  personId: string,
  emergencyContacts: PersonInput['emergencyContacts']
): Promise<void> {
  if (!emergencyContacts) return

  const supabase = await createClient()

  // Get existing emergency contacts
  const { data: existing } = await supabase
    .from('emergency_contacts')
    .select('id')
    .eq('person_id', personId)

  const existingIds = new Set((existing || []).map(c => c.id))
  const providedIds = new Set(emergencyContacts.map(c => c.id).filter(Boolean))

  // Delete removed contacts
  const toDelete = Array.from(existingIds).filter(id => !providedIds.has(id))
  if (toDelete.length > 0) {
    await supabase
      .from('emergency_contacts')
      .delete()
      .in('id', toDelete)
  }

  // Upsert provided contacts
  for (const contact of emergencyContacts) {
    const contactRecord = {
      person_id: personId,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
    }

    if (contact.id) {
      // Update existing
      await supabase
        .from('emergency_contacts')
        .update(contactRecord)
        .eq('id', contact.id)
    } else {
      // Create new
      await supabase
        .from('emergency_contacts')
        .insert(contactRecord)
    }
  }
}

/**
 * Delete a person record (cascades to address history and emergency contacts)
 */
export async function deletePerson(personId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', personId)

  if (error) {
    console.error('Error deleting person:', error)
    throw new Error(`Failed to delete person: ${error.message}`)
  }
}

/**
 * Get decrypted SSN for a person (use with caution, only when necessary)
 */
export async function getDecryptedSSN(personId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select('ssn_encrypted')
    .eq('id', personId)
    .single()

  if (error || !data?.ssn_encrypted) {
    return null
  }

  return decryptSSN(data.ssn_encrypted)
}
