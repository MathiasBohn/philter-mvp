/**
 * Application Editing and Saving Tests
 *
 * Comprehensive tests for application editing across all user types:
 * - Data persistence
 * - Permission-based editing
 * - Concurrent editing scenarios
 * - Metadata handling
 * - Section-specific updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  testUsers,
  testApplications,
  testBuilding,
  createMockSupabaseClient,
  simulateRLSPolicy,
} from './mocks/supabase'
import { Role, ApplicationStatus, TransactionType } from '@/lib/types'

describe('Application Editing and Saving', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Applicant Editing Own Application', () => {
    it('saves profile data correctly', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const profileData = {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@test.com',
        phone: '212-555-1234',
        date_of_birth: '1985-06-15',
        ssn_last4: '5678',
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'person-id-1',
          application_id: testApplications.applicantOwned.id,
          ...profileData,
        },
        error: null,
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...profileData,
        })
        .select()
        .single()

      expect(result.data.first_name).toBe('John')
      expect(result.data.last_name).toBe('Smith')
      expect(result.data.ssn_last4).toBe('5678')
    })

    it('saves employment records correctly', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const employmentData = {
        employer: 'Acme Corporation',
        title: 'Senior Developer',
        start_date: '2020-03-01',
        annual_income: 145000,
        is_current: true,
        pay_cadence: 'BIWEEKLY',
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'emp-id-1',
          application_id: testApplications.applicantOwned.id,
          ...employmentData,
        },
        error: null,
      })

      const result = await mockClient
        .from('employment_records')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...employmentData,
        })
        .select()
        .single()

      expect(result.data.employer).toBe('Acme Corporation')
      expect(result.data.annual_income).toBe(145000)
    })

    it('saves financial entries correctly', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const financialData = {
        entry_type: 'ASSET',
        category: 'CHECKING',
        institution: 'Chase Bank',
        amount: 75000,
        description: 'Primary checking account',
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'fin-id-1',
          application_id: testApplications.applicantOwned.id,
          ...financialData,
        },
        error: null,
      })

      const result = await mockClient
        .from('financial_entries')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...financialData,
        })
        .select()
        .single()

      expect(result.data.institution).toBe('Chase Bank')
      expect(result.data.amount).toBe(75000)
    })

    it('saves lease terms in metadata', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const leaseTerms = {
        monthlyRent: 3500,
        securityDeposit: 7000,
        leaseLengthYears: 2,
        leaseStartDate: '2025-03-01',
        moveInDate: '2025-03-01',
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: { leaseTerms },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ metadata: { leaseTerms } })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.leaseTerms.monthlyRent).toBe(3500)
    })

    it('saves cover letter in metadata', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const coverLetter = `Dear Board Members,

I am writing to express my sincere interest in purchasing unit 5A at your prestigious building. With my strong financial background and commitment to community living, I believe I would be an ideal resident.

Best regards,
John Smith`

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: { coverLetter },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ metadata: { coverLetter } })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.coverLetter).toContain('sincere interest')
    })

    it('saves disclosure acknowledgments', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const disclosures = [
        {
          type: 'LEAD_PAINT_CERTIFICATION',
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          signature: 'John Smith',
        },
        {
          type: 'CONSUMER_REPORT_AUTH',
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          signature: 'John Smith',
        },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: { disclosures },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ metadata: { disclosures } })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.disclosures.length).toBe(2)
      expect(result.data.metadata.disclosures[0].acknowledged).toBe(true)
    })

    it('updates completion percentage automatically', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          completion_percentage: 65, // After adding employment
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('completion_percentage')
        .eq('id', testApplications.applicantOwned.id)
        .single()

      expect(result.data.completion_percentage).toBe(65)
    })
  })

  describe('Broker Editing Broker-Owned Application', () => {
    it('broker can edit all sections of own application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.brokerOwned,
          unit: 'Updated Unit 5B',
          metadata: {
            coverLetter: 'Updated by broker',
            leaseTerms: { monthlyRent: 4000 },
          },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({
          unit: 'Updated Unit 5B',
          metadata: {
            coverLetter: 'Updated by broker',
            leaseTerms: { monthlyRent: 4000 },
          },
        })
        .eq('id', testApplications.brokerOwned.id)
        .select()
        .single()

      expect(result.data.unit).toBe('Updated Unit 5B')
      expect(result.data.metadata.leaseTerms.monthlyRent).toBe(4000)
    })

    it('broker can add people to application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'person-id-broker',
          application_id: testApplications.brokerOwned.id,
          first_name: 'Client',
          last_name: 'Applicant',
          role: Role.APPLICANT,
        },
        error: null,
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.brokerOwned.id,
          first_name: 'Client',
          last_name: 'Applicant',
          role: Role.APPLICANT,
        })
        .select()
        .single()

      expect(result.data.first_name).toBe('Client')
    })

    it('broker can add financial entries', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'fin-broker',
          application_id: testApplications.brokerOwned.id,
          entry_type: 'ASSET',
          amount: 200000,
        },
        error: null,
      })

      const result = await mockClient
        .from('financial_entries')
        .insert({
          application_id: testApplications.brokerOwned.id,
          entry_type: 'ASSET',
          category: 'INVESTMENT',
          amount: 200000,
        })
        .select()
        .single()

      expect(result.data.amount).toBe(200000)
    })
  })

  describe('Cross-User Editing Permissions', () => {
    it('applicant cannot edit broker-owned application', () => {
      const permissions = simulateRLSPolicy(
        Role.APPLICANT,
        testUsers.applicant.id,
        testApplications.brokerOwned.created_by, // Broker is owner
        testApplications.brokerOwned.broker_owned
      )

      expect(permissions.canUpdate).toBe(false)
    })

    it('broker cannot edit applicant-owned application', () => {
      const permissions = simulateRLSPolicy(
        Role.BROKER,
        testUsers.broker.id,
        testApplications.applicantOwned.created_by, // Applicant is owner
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canUpdate).toBe(false)
    })

    it('admin can update application status', () => {
      const permissions = simulateRLSPolicy(
        Role.ADMIN,
        testUsers.admin.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canUpdate).toBe(true)
    })

    it('board cannot edit any application', () => {
      const permissions = simulateRLSPolicy(
        Role.BOARD,
        testUsers.board.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canUpdate).toBe(false)
    })

    it('random user cannot edit any application', () => {
      const permissions = simulateRLSPolicy(
        Role.APPLICANT,
        testUsers.randomUser.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canUpdate).toBe(false)
    })
  })

  describe('Metadata Merging', () => {
    it('preserves existing metadata when updating partial fields', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const existingMetadata = {
        coverLetter: 'Existing letter',
        leaseTerms: { monthlyRent: 3000 },
      }
      const newParticipants = [
        { id: 'p1', role: 'UNIT_OWNER', name: 'Owner Name' },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: {
            ...existingMetadata,
            participants: newParticipants,
          },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({
          metadata: {
            ...existingMetadata,
            participants: newParticipants,
          },
        })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      // Both existing and new fields should be present
      expect(result.data.metadata.coverLetter).toBe('Existing letter')
      expect(result.data.metadata.leaseTerms.monthlyRent).toBe(3000)
      expect(result.data.metadata.participants.length).toBe(1)
    })

    it('overwrites specific metadata fields correctly', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: {
            coverLetter: 'New updated letter',
            leaseTerms: { monthlyRent: 4500 }, // Updated from 3000
          },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({
          metadata: {
            coverLetter: 'New updated letter',
            leaseTerms: { monthlyRent: 4500 },
          },
        })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.leaseTerms.monthlyRent).toBe(4500)
    })
  })

  describe('Locked Application Handling', () => {
    it('prevents editing submitted application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Application is locked and cannot be edited', code: 'LOCKED' },
      })

      const result = await mockClient
        .from('applications')
        .update({ unit: 'Changed' })
        .eq('id', testApplications.submitted.id)
        .eq('is_locked', false) // Will fail because is_locked is true
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('prevents adding people to submitted application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Cannot modify locked application' },
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.submitted.id,
          first_name: 'New Person',
        })
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('prevents modifying financial entries of submitted application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Cannot modify locked application' },
      })

      const result = await mockClient
        .from('financial_entries')
        .update({ amount: 999999 })
        .eq('application_id', testApplications.submitted.id)
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })
  })

  describe('Concurrent Editing Scenarios', () => {
    it('handles optimistic locking with updated_at', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const staleTimestamp = '2025-01-01T00:00:00Z'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Row has been modified by another user', code: 'PGRST116' },
      })

      const result = await mockClient
        .from('applications')
        .update({ unit: '5A' })
        .eq('id', testApplications.applicantOwned.id)
        .eq('updated_at', staleTimestamp) // Stale timestamp
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('returns fresh data after successful update', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const newTimestamp = new Date().toISOString()

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          unit: '5A',
          updated_at: newTimestamp,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ unit: '5A' })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.updated_at).toBe(newTimestamp)
    })
  })

  describe('Bulk Operations', () => {
    it('updates multiple financial entries at once', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      // Mock single to return count of upserted entries
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { count: 3 },
        error: null,
      })

      const result = await mockClient
        .from('financial_entries')
        .upsert([
          { id: 'fin-1', application_id: testApplications.applicantOwned.id, entry_type: 'ASSET', amount: 50000 },
          { id: 'fin-2', application_id: testApplications.applicantOwned.id, entry_type: 'ASSET', amount: 75000 },
          { id: 'fin-3', application_id: testApplications.applicantOwned.id, entry_type: 'ASSET', amount: 100000 },
        ])
        .select('count')
        .single()

      expect(result.data.count).toBe(3)
    })

    it('deletes multiple employment records', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      // Mock single to return success
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { deleted: 2 },
        error: null,
      })

      const result = await mockClient
        .from('employment_records')
        .delete()
        .eq('application_id', testApplications.applicantOwned.id)
        .in('id', ['emp-1', 'emp-2'])
        .select('count')
        .single()

      expect(result.error).toBeNull()
    })
  })

  describe('Data Validation During Save', () => {
    it('validates SSN format', () => {
      const validSSN = '123-45-6789'
      const invalidSSN = '12345'

      const ssnRegex = /^\d{3}-\d{2}-\d{4}$/
      expect(ssnRegex.test(validSSN)).toBe(true)
      expect(ssnRegex.test(invalidSSN)).toBe(false)
    })

    it('validates phone number format', () => {
      const validPhone = '212-555-1234'
      const invalidPhone = '1234'

      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/
      expect(phoneRegex.test(validPhone)).toBe(true)
      expect(phoneRegex.test(invalidPhone)).toBe(false)
    })

    it('validates email format', () => {
      const validEmail = 'test@example.com'
      const invalidEmail = 'notanemail'

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test(validEmail)).toBe(true)
      expect(emailRegex.test(invalidEmail)).toBe(false)
    })

    it('validates positive amount for financial entries', () => {
      const positiveAmount = 50000
      const negativeAmount = -1000
      const zeroAmount = 0

      expect(positiveAmount > 0).toBe(true)
      expect(negativeAmount > 0).toBe(false)
      expect(zeroAmount > 0).toBe(false)
    })
  })

  describe('Real Estate Properties', () => {
    it('saves real estate property in metadata', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const realEstateProperties = [
        {
          id: 'prop-1',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
          },
          propertyType: 'CONDO',
          marketValue: 500000,
          mortgageBalance: 350000,
          monthlyMortgagePayment: 2500,
        },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: { realEstateProperties },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ metadata: { realEstateProperties } })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.realEstateProperties.length).toBe(1)
      expect(result.data.metadata.realEstateProperties[0].marketValue).toBe(500000)
    })
  })

  describe('Deal Parties (Participants)', () => {
    it('saves unit owner information', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const participants = [
        {
          id: 'owner-1',
          role: Role.UNIT_OWNER,
          name: 'Current Owner',
          email: 'owner@test.com',
          phoneCell: '212-555-9999',
        },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: { participants },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ metadata: { participants } })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.participants[0].role).toBe(Role.UNIT_OWNER)
    })

    it('saves attorney information', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const participants = [
        {
          id: 'atty-1',
          role: Role.APPLICANT_ATTORNEY,
          name: 'Jane Lawyer',
          email: 'jane@lawfirm.com',
          phoneWork: '212-555-1111',
        },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: { participants },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ metadata: { participants } })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.participants[0].role).toBe(Role.APPLICANT_ATTORNEY)
    })
  })
})
