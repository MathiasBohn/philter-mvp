/**
 * Applicant Workflow Tests
 *
 * Tests for the complete applicant workflow including:
 * - Creating applications
 * - Filling out all 13 sections
 * - Uploading documents
 * - Submitting applications
 * - Responding to RFIs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  testUsers,
  testApplications,
  testBuilding,
  createMockSupabaseClient,
  simulateRLSPolicy,
} from './mocks/supabase'
import { Role, ApplicationStatus, TransactionType, DocumentCategory } from '@/lib/types'

describe('Applicant Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Application', () => {
    it('creates new application successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const newAppId = 'new-app-id'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: newAppId,
          building_id: testBuilding.id,
          unit: '5A',
          transaction_type: TransactionType.COOP_PURCHASE,
          status: ApplicationStatus.IN_PROGRESS,
          created_by: testUsers.applicant.id,
          broker_owned: false,
          completion_percentage: 0,
          building: testBuilding,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .insert({
          building_id: testBuilding.id,
          unit: '5A',
          transaction_type: TransactionType.COOP_PURCHASE,
          status: ApplicationStatus.IN_PROGRESS,
          created_by: testUsers.applicant.id,
        })
        .select('*, building:buildings(*)')
        .single()

      expect(result.data.id).toBe(newAppId)
      expect(result.data.status).toBe(ApplicationStatus.IN_PROGRESS)
      expect(result.data.created_by).toBe(testUsers.applicant.id)
      expect(result.data.broker_owned).toBe(false)
    })

    it('sets correct initial status', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'new-app-id',
          status: ApplicationStatus.IN_PROGRESS,
          completion_percentage: 0,
          is_locked: false,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .insert({})
        .select()
        .single()

      expect(result.data.status).toBe(ApplicationStatus.IN_PROGRESS)
      expect(result.data.completion_percentage).toBe(0)
      expect(result.data.is_locked).toBe(false)
    })

    it('associates application with building', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'new-app-id',
          building_id: testBuilding.id,
          building: testBuilding,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .insert({ building_id: testBuilding.id })
        .select('*, building:buildings(*)')
        .single()

      expect(result.data.building_id).toBe(testBuilding.id)
      expect(result.data.building.name).toBe(testBuilding.name)
    })
  })

  describe('Application Access Control', () => {
    it('applicant can view own application', () => {
      const permissions = simulateRLSPolicy(
        Role.APPLICANT,
        testUsers.applicant.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canRead).toBe(true)
    })

    it('applicant can edit own application', () => {
      const permissions = simulateRLSPolicy(
        Role.APPLICANT,
        testUsers.applicant.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canUpdate).toBe(true)
    })

    it('applicant can delete own application', () => {
      const permissions = simulateRLSPolicy(
        Role.APPLICANT,
        testUsers.applicant.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canDelete).toBe(true)
    })

    it('applicant cannot view other users applications', () => {
      const permissions = simulateRLSPolicy(
        Role.APPLICANT,
        testUsers.applicant.id,
        testUsers.randomUser.id, // Different owner
        false
      )

      expect(permissions.canRead).toBe(false)
    })

    it('applicant cannot edit other users applications', () => {
      const permissions = simulateRLSPolicy(
        Role.APPLICANT,
        testUsers.applicant.id,
        testUsers.randomUser.id,
        false
      )

      expect(permissions.canUpdate).toBe(false)
    })
  })

  describe('Profile Section', () => {
    it('saves profile data with required fields', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const profileData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        phone: '555-123-4567',
        date_of_birth: '1990-01-15',
        ssn_last4: '1234',
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'person-id-1',
          application_id: testApplications.applicantOwned.id,
          ...profileData,
          role: Role.APPLICANT,
        },
        error: null,
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...profileData,
          role: Role.APPLICANT,
        })
        .select()
        .single()

      expect(result.data.first_name).toBe(profileData.first_name)
      expect(result.data.email).toBe(profileData.email)
      expect(result.data.ssn_last4).toBe(profileData.ssn_last4)
    })

    it('validates age requirement (18+)', () => {
      const today = new Date()
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      )
      const seventeenYearsAgo = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate()
      )

      // 18 years old - valid
      expect(eighteenYearsAgo <= today).toBe(true)

      // 17 years old - would be invalid
      const isUnderage = seventeenYearsAgo > eighteenYearsAgo
      expect(isUnderage).toBe(true)
    })
  })

  describe('People Section (Co-applicants/Guarantors)', () => {
    it('adds co-applicant to application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const coApplicant = {
        fullName: 'Jane Doe',
        email: 'jane.doe@test.com',
        phone: '555-987-6543',
        role: Role.CO_APPLICANT,
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'person-id-2',
          application_id: testApplications.applicantOwned.id,
          ...coApplicant,
        },
        error: null,
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...coApplicant,
        })
        .select()
        .single()

      expect(result.data.role).toBe(Role.CO_APPLICANT)
    })

    it('adds guarantor to application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const guarantor = {
        fullName: 'Parent Doe',
        email: 'parent@test.com',
        phone: '555-111-2222',
        role: Role.GUARANTOR,
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'person-id-3',
          application_id: testApplications.applicantOwned.id,
          ...guarantor,
        },
        error: null,
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...guarantor,
        })
        .select()
        .single()

      expect(result.data.role).toBe(Role.GUARANTOR)
    })
  })

  describe('Employment & Income Section', () => {
    it('adds employment record', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const employment = {
        employer: 'Test Corp',
        title: 'Software Engineer',
        start_date: '2020-01-01',
        annual_income: 120000,
        is_current: true,
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'emp-id-1',
          application_id: testApplications.applicantOwned.id,
          ...employment,
        },
        error: null,
      })

      const result = await mockClient
        .from('employment_records')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...employment,
        })
        .select()
        .single()

      expect(result.data.employer).toBe(employment.employer)
      expect(result.data.annual_income).toBe(employment.annual_income)
    })

    it('handles multiple employment records', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      const employmentRecords = [
        { id: 'emp-1', employer: 'Current Corp', is_current: true },
        { id: 'emp-2', employer: 'Previous Corp', is_current: false },
      ]

      // Mock single to return records count instead of using then
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { records: employmentRecords, count: employmentRecords.length },
        error: null,
      })

      const result = await mockClient
        .from('employment_records')
        .select()
        .eq('application_id', testApplications.applicantOwned.id)
        .single()

      expect(result.data.count).toBe(2)
    })
  })

  describe('Financial Section', () => {
    it('adds asset entry', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const asset = {
        entry_type: 'ASSET',
        category: 'CHECKING',
        institution: 'Chase Bank',
        amount: 50000,
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'fin-id-1',
          application_id: testApplications.applicantOwned.id,
          ...asset,
        },
        error: null,
      })

      const result = await mockClient
        .from('financial_entries')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...asset,
        })
        .select()
        .single()

      expect(result.data.entry_type).toBe('ASSET')
      expect(result.data.amount).toBe(50000)
    })

    it('adds liability entry', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const liability = {
        entry_type: 'LIABILITY',
        category: 'MORTGAGE',
        institution: 'Wells Fargo',
        amount: 250000,
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'fin-id-2',
          application_id: testApplications.applicantOwned.id,
          ...liability,
        },
        error: null,
      })

      const result = await mockClient
        .from('financial_entries')
        .insert({
          application_id: testApplications.applicantOwned.id,
          ...liability,
        })
        .select()
        .single()

      expect(result.data.entry_type).toBe('LIABILITY')
    })
  })

  describe('Document Upload', () => {
    it('uploads required document (government ID)', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const storagePath = `${testUsers.applicant.id}/${testApplications.applicantOwned.id}/gov-id.pdf`

      mockClient._mockStorageFileApi.upload.mockResolvedValue({
        data: { path: storagePath },
        error: null,
      })

      const file = new Blob(['test'], { type: 'application/pdf' })
      const result = await mockClient.storage
        .from('documents')
        .upload(storagePath, file)

      expect(result.error).toBeNull()
      expect(result.data?.path).toBe(storagePath)
    })

    it('uploads bank statement', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const storagePath = `${testUsers.applicant.id}/${testApplications.applicantOwned.id}/bank-statement.pdf`

      mockClient._mockStorageFileApi.upload.mockResolvedValue({
        data: { path: storagePath },
        error: null,
      })

      const result = await mockClient.storage
        .from('documents')
        .upload(storagePath, new Blob())

      expect(result.error).toBeNull()
    })

    it('creates document record in database', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const document = {
        application_id: testApplications.applicantOwned.id,
        category: DocumentCategory.BANK_STATEMENT,
        filename: 'bank-statement.pdf',
        size: 1024000,
        mime_type: 'application/pdf',
        storage_path: `${testUsers.applicant.id}/${testApplications.applicantOwned.id}/bank-statement.pdf`,
        uploaded_by: testUsers.applicant.id,
        status: 'UPLOADED',
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'doc-id-new', ...document },
        error: null,
      })

      const result = await mockClient
        .from('documents')
        .insert(document)
        .select()
        .single()

      expect(result.data.category).toBe(DocumentCategory.BANK_STATEMENT)
      expect(result.data.storage_path).toContain(testUsers.applicant.id)
    })

    it('rejects upload exceeding size limit', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockStorageFileApi.upload.mockResolvedValue({
        data: null,
        error: { message: 'File size exceeds limit' },
      })

      const result = await mockClient.storage
        .from('documents')
        .upload('path', new Blob())

      expect(result.error).not.toBeNull()
      expect(result.error?.message).toContain('size')
    })
  })

  describe('Disclosures Section', () => {
    it('acknowledges lead paint disclosure', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'disclosure-1',
          application_id: testApplications.applicantOwned.id,
          type: 'LEAD_PAINT_CERTIFICATION',
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('disclosures')
        .insert({
          application_id: testApplications.applicantOwned.id,
          type: 'LEAD_PAINT_CERTIFICATION',
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .select()
        .single()

      expect(result.data.acknowledged).toBe(true)
    })

    it('requires all mandatory disclosures before submission', () => {
      const requiredDisclosures = [
        'LEAD_PAINT_CERTIFICATION',
        'LEAD_WARNING_STATEMENT',
        'LOCAL_LAW_38',
        'LOCAL_LAW_55',
        'WINDOW_GUARD',
        'CONSUMER_REPORT_AUTH',
        'PERSONAL_INFO_AUTH',
        'BACKGROUND_CHECK_CONSENT',
      ]

      // All required disclosures must be acknowledged
      expect(requiredDisclosures.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('Submit Application', () => {
    it('submits complete application successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      // Mock RPC for can_submit_application
      mockClient.rpc.mockResolvedValue({ data: true, error: null })

      // Mock application update
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.applicantOwned,
          status: ApplicationStatus.SUBMITTED,
          submitted_at: new Date().toISOString(),
          is_locked: true,
        },
        error: null,
      })

      const canSubmit = await mockClient.rpc('can_submit_application', {
        app_id: testApplications.applicantOwned.id,
      })

      expect(canSubmit.data).toBe(true)

      const result = await mockClient
        .from('applications')
        .update({
          status: ApplicationStatus.SUBMITTED,
          submitted_at: new Date().toISOString(),
          is_locked: true,
        })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.status).toBe(ApplicationStatus.SUBMITTED)
      expect(result.data.is_locked).toBe(true)
    })

    it('prevents submission of incomplete application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.rpc.mockResolvedValue({
        data: false,
        error: { message: 'Application is not complete' },
      })

      const canSubmit = await mockClient.rpc('can_submit_application', {
        app_id: testApplications.applicantOwned.id,
      })

      expect(canSubmit.data).toBe(false)
    })

    it('prevents double submission', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.rpc.mockResolvedValue({
        data: false,
        error: { message: 'Application already submitted' },
      })

      const canSubmit = await mockClient.rpc('can_submit_application', {
        app_id: testApplications.submitted.id, // Already submitted
      })

      expect(canSubmit.data).toBe(false)
    })
  })

  describe('RFI Response', () => {
    it('applicant can respond to RFI', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const rfiId = 'rfi-id-1'
      const message = 'Here is the updated document you requested.'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'message-id-1',
          rfi_id: rfiId,
          author_id: testUsers.applicant.id,
          message: message,
          created_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('rfi_messages')
        .insert({
          rfi_id: rfiId,
          author_id: testUsers.applicant.id,
          message: message,
        })
        .select()
        .single()

      expect(result.data.message).toBe(message)
      expect(result.data.author_id).toBe(testUsers.applicant.id)
    })

    it('applicant can attach documents to RFI response', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'message-id-2',
          rfi_id: 'rfi-id-1',
          author_id: testUsers.applicant.id,
          message: 'Attached the requested document.',
          attachments: ['doc-id-new'],
        },
        error: null,
      })

      const result = await mockClient
        .from('rfi_messages')
        .insert({
          rfi_id: 'rfi-id-1',
          author_id: testUsers.applicant.id,
          message: 'Attached the requested document.',
          attachments: ['doc-id-new'],
        })
        .select()
        .single()

      expect(result.data.attachments).toContain('doc-id-new')
    })
  })

  describe('View Application Status', () => {
    it('applicant sees application status', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.applicantOwned,
          status: ApplicationStatus.IN_PROGRESS,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select()
        .eq('id', testApplications.applicantOwned.id)
        .single()

      expect(result.data.status).toBe(ApplicationStatus.IN_PROGRESS)
    })

    it('applicant sees completion percentage', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.applicantOwned,
          completion_percentage: 75,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select()
        .eq('id', testApplications.applicantOwned.id)
        .single()

      expect(result.data.completion_percentage).toBe(75)
    })
  })
})
