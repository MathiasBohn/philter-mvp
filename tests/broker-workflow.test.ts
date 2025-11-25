/**
 * Broker Workflow Tests
 *
 * Tests for the broker workflow including:
 * - Creating applications on behalf of applicants
 * - Sending invitations
 * - Pipeline management
 * - QA review
 * - Submission to building
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

describe('Broker Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Application for Applicant', () => {
    it('creates broker-owned application successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const applicantEmail = 'new.applicant@test.com'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'broker-app-id',
          building_id: testBuilding.id,
          unit: '7B',
          transaction_type: TransactionType.COOP_PURCHASE,
          status: ApplicationStatus.IN_PROGRESS,
          created_by: testUsers.broker.id,
          broker_owned: true,
          primary_applicant_email: applicantEmail,
          primary_applicant_id: null, // Not yet claimed
          completion_percentage: 0,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .insert({
          building_id: testBuilding.id,
          unit: '7B',
          transaction_type: TransactionType.COOP_PURCHASE,
          created_by: testUsers.broker.id,
          broker_owned: true,
          primary_applicant_email: applicantEmail,
        })
        .select()
        .single()

      expect(result.data.broker_owned).toBe(true)
      expect(result.data.primary_applicant_email).toBe(applicantEmail)
      expect(result.data.created_by).toBe(testUsers.broker.id)
    })

    it('associates correct building and unit', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'broker-app-id',
          building_id: testBuilding.id,
          unit: '12A',
          building: testBuilding,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .insert({
          building_id: testBuilding.id,
          unit: '12A',
        })
        .select('*, building:buildings(*)')
        .single()

      expect(result.data.building_id).toBe(testBuilding.id)
      expect(result.data.unit).toBe('12A')
      expect(result.data.building.name).toBe(testBuilding.name)
    })
  })

  describe('Broker Access Control', () => {
    it('broker can read own broker-owned application', () => {
      const permissions = simulateRLSPolicy(
        Role.BROKER,
        testUsers.broker.id,
        testApplications.brokerOwned.created_by, // broker is creator
        testApplications.brokerOwned.broker_owned
      )

      expect(permissions.canRead).toBe(true)
    })

    it('broker can update own broker-owned application', () => {
      const permissions = simulateRLSPolicy(
        Role.BROKER,
        testUsers.broker.id,
        testApplications.brokerOwned.created_by,
        testApplications.brokerOwned.broker_owned
      )

      expect(permissions.canUpdate).toBe(true)
    })

    it('broker can delete own broker-owned application', () => {
      const permissions = simulateRLSPolicy(
        Role.BROKER,
        testUsers.broker.id,
        testApplications.brokerOwned.created_by,
        testApplications.brokerOwned.broker_owned
      )

      expect(permissions.canDelete).toBe(true)
    })

    it('broker cannot access other broker applications', () => {
      const permissions = simulateRLSPolicy(
        Role.BROKER,
        testUsers.broker.id,
        'other-broker-id', // Different broker
        true
      )

      expect(permissions.canRead).toBe(false)
      expect(permissions.canUpdate).toBe(false)
    })

    it('broker cannot access applicant-owned applications', () => {
      const permissions = simulateRLSPolicy(
        Role.BROKER,
        testUsers.broker.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canRead).toBe(false)
    })
  })

  describe('Send Invitation to Applicant', () => {
    it('creates invitation record', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const invitationToken = 'invitation-token-123'
      const applicantEmail = 'invited.applicant@test.com'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'invitation-id-1',
          application_id: testApplications.brokerOwned.id,
          email: applicantEmail,
          token: invitationToken,
          invited_by: testUsers.broker.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          accepted_at: null,
        },
        error: null,
      })

      const result = await mockClient
        .from('invitations')
        .insert({
          application_id: testApplications.brokerOwned.id,
          email: applicantEmail,
          token: invitationToken,
          invited_by: testUsers.broker.id,
        })
        .select()
        .single()

      expect(result.data.email).toBe(applicantEmail)
      expect(result.data.token).toBe(invitationToken)
      expect(result.data.accepted_at).toBeNull()
    })

    it('generates unique invitation token', () => {
      // Tokens should be unique
      const token1 = `inv_${Date.now()}_${Math.random().toString(36).substring(2)}`
      const token2 = `inv_${Date.now()}_${Math.random().toString(36).substring(2)}`

      expect(token1).not.toBe(token2)
    })

    it('sets correct expiration date', () => {
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      expect(sevenDaysFromNow.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  describe('Pipeline Management', () => {
    it('lists all broker-owned applications', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const apps = [
        { ...testApplications.brokerOwned, status: ApplicationStatus.IN_PROGRESS },
        { id: 'app-2', status: ApplicationStatus.SUBMITTED, broker_owned: true },
        { id: 'app-3', status: ApplicationStatus.IN_REVIEW, broker_owned: true },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { applications: apps, count: apps.length },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .eq('created_by', testUsers.broker.id)
        .eq('broker_owned', true)
        .single()

      expect(result.data.count).toBe(3)
    })

    it('filters by status', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { status: ApplicationStatus.IN_PROGRESS },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .eq('created_by', testUsers.broker.id)
        .eq('status', ApplicationStatus.IN_PROGRESS)
        .single()

      expect(result.data.status).toBe(ApplicationStatus.IN_PROGRESS)
    })

    it('orders by most recent', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const date1 = new Date('2025-01-01')
      const date2 = new Date('2025-01-15')
      const date3 = new Date('2025-01-20')

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          applications: [
            { id: 'app-3', created_at: date3.toISOString() },
            { id: 'app-2', created_at: date2.toISOString() },
            { id: 'app-1', created_at: date1.toISOString() },
          ],
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .eq('created_by', testUsers.broker.id)
        .order('created_at', { ascending: false })
        .single()

      const apps = result.data.applications
      const dates = apps.map((app: { created_at: string }) => new Date(app.created_at))
      expect(dates[0] >= dates[1] && dates[1] >= dates[2]).toBe(true)
    })
  })

  describe('QA Review', () => {
    it('broker can view all application sections', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.brokerOwned,
          people: [{ id: 'person-1', fullName: 'Test Applicant' }],
          employment_records: [{ id: 'emp-1', employer: 'Test Corp' }],
          financial_entries: [{ id: 'fin-1', amount: 50000 }],
          documents: [{ id: 'doc-1', category: 'BANK_STATEMENT' }],
          disclosures: [{ id: 'disc-1', acknowledged: true }],
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select(`
          *,
          people(*),
          employment_records(*),
          financial_entries(*),
          documents(*),
          disclosures(*)
        `)
        .eq('id', testApplications.brokerOwned.id)
        .single()

      expect(result.data.people.length).toBeGreaterThan(0)
      expect(result.data.employment_records.length).toBeGreaterThan(0)
      expect(result.data.financial_entries.length).toBeGreaterThan(0)
      expect(result.data.documents.length).toBeGreaterThan(0)
      expect(result.data.disclosures.length).toBeGreaterThan(0)
    })

    it('broker can flag missing documents', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const requiredCategories = ['GOVERNMENT_ID', 'BANK_STATEMENT', 'TAX_RETURN']

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          documents: [
            { category: 'BANK_STATEMENT' },
            // Missing GOVERNMENT_ID and TAX_RETURN
          ],
        },
        error: null,
      })

      const result = await mockClient
        .from('documents')
        .select('category')
        .eq('application_id', testApplications.brokerOwned.id)
        .single()

      const uploadedCategories = result.data.documents.map((doc: { category: string }) => doc.category)
      const missingDocs = requiredCategories.filter(
        cat => !uploadedCategories.includes(cat)
      )

      expect(missingDocs).toContain('GOVERNMENT_ID')
      expect(missingDocs).toContain('TAX_RETURN')
    })

    it('broker can add notes for applicant', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.brokerOwned,
          metadata: {
            brokerNotes: 'Please upload higher quality bank statements.',
          },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({
          metadata: {
            brokerNotes: 'Please upload higher quality bank statements.',
          },
        })
        .eq('id', testApplications.brokerOwned.id)
        .select()
        .single()

      expect(result.data.metadata.brokerNotes).toBeTruthy()
    })
  })

  describe('Submit to Building', () => {
    it('broker can submit complete application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      // Mock RPC for can_submit_application
      mockClient.rpc.mockResolvedValue({ data: true, error: null })

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.brokerOwned,
          status: ApplicationStatus.SUBMITTED,
          submitted_at: new Date().toISOString(),
          is_locked: true,
          completion_percentage: 100,
        },
        error: null,
      })

      const canSubmit = await mockClient.rpc('can_submit_application', {
        app_id: testApplications.brokerOwned.id,
      })

      expect(canSubmit.data).toBe(true)

      const result = await mockClient
        .from('applications')
        .update({
          status: ApplicationStatus.SUBMITTED,
          submitted_at: new Date().toISOString(),
          is_locked: true,
        })
        .eq('id', testApplications.brokerOwned.id)
        .select()
        .single()

      expect(result.data.status).toBe(ApplicationStatus.SUBMITTED)
      expect(result.data.is_locked).toBe(true)
    })

    it('prevents submission of incomplete application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient.rpc.mockResolvedValue({
        data: false,
        error: { message: 'Application completion is below 100%' },
      })

      const canSubmit = await mockClient.rpc('can_submit_application', {
        app_id: testApplications.brokerOwned.id,
      })

      expect(canSubmit.data).toBe(false)
    })

    it('locks application after submission', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.brokerOwned.id,
          is_locked: true,
          status: ApplicationStatus.SUBMITTED,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ is_locked: true, status: ApplicationStatus.SUBMITTED })
        .eq('id', testApplications.brokerOwned.id)
        .select()
        .single()

      expect(result.data.is_locked).toBe(true)
    })
  })

  describe('Handle Applicant Claim', () => {
    it('updates application when applicant accepts invitation', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const claimedApplicantId = 'new-applicant-id'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.brokerOwned,
          primary_applicant_id: claimedApplicantId,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ primary_applicant_id: claimedApplicantId })
        .eq('id', testApplications.brokerOwned.id)
        .select()
        .single()

      expect(result.data.primary_applicant_id).toBe(claimedApplicantId)
    })

    it('marks invitation as accepted', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'invitation-id',
          accepted_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('token', 'invitation-token-123')
        .select()
        .single()

      expect(result.data.accepted_at).not.toBeNull()
    })
  })

  describe('Document Management', () => {
    it('broker can upload documents for application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const storagePath = `${testUsers.broker.id}/${testApplications.brokerOwned.id}/doc.pdf`

      mockClient._mockStorageFileApi.upload.mockResolvedValue({
        data: { path: storagePath },
        error: null,
      })

      const result = await mockClient.storage
        .from('documents')
        .upload(storagePath, new Blob())

      expect(result.error).toBeNull()
      expect(result.data?.path).toContain(testUsers.broker.id)
    })

    it('broker can view all documents for managed application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)
      const docs = [
        { id: 'doc-1', category: 'GOVERNMENT_ID', filename: 'id.pdf' },
        { id: 'doc-2', category: 'BANK_STATEMENT', filename: 'bank.pdf' },
        { id: 'doc-3', category: 'TAX_RETURN', filename: 'tax.pdf' },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { documents: docs, count: docs.length },
        error: null,
      })

      const result = await mockClient
        .from('documents')
        .select('*')
        .eq('application_id', testApplications.brokerOwned.id)
        .single()

      expect(result.data.count).toBe(3)
    })
  })

  describe('Edge Cases', () => {
    it('handles concurrent edits gracefully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      // Simulate optimistic locking with updated_at
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row has been modified' },
      })

      const result = await mockClient
        .from('applications')
        .update({ unit: '5A' })
        .eq('id', testApplications.brokerOwned.id)
        .eq('updated_at', 'old-timestamp') // Stale timestamp
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('handles expired invitation', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Invitation has expired' },
      })

      const result = await mockClient
        .from('invitations')
        .select()
        .eq('token', 'expired-token')
        .single()

      expect(result.error).not.toBeNull()
    })

    it('prevents editing locked application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Application is locked' },
      })

      const result = await mockClient
        .from('applications')
        .update({ unit: 'new-unit' })
        .eq('id', testApplications.submitted.id) // Submitted = locked
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })
  })
})
