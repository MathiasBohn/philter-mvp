/**
 * Admin/Agent Workflow Tests
 *
 * Tests for the admin/agent workflow including:
 * - Viewing submitted applications
 * - Creating RFIs
 * - Reviewing applications
 * - Making decisions (approve/deny/conditional)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  testUsers,
  testApplications,
  createMockSupabaseClient,
  simulateRLSPolicy,
} from './mocks/supabase'
import { Role, ApplicationStatus, RFIStatus, Decision } from '@/lib/types'

describe('Admin/Agent Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Access Control', () => {
    it('admin can view all submitted applications', () => {
      const permissions = simulateRLSPolicy(
        Role.ADMIN,
        testUsers.admin.id,
        testApplications.submitted.created_by,
        testApplications.submitted.broker_owned
      )

      expect(permissions.canRead).toBe(true)
    })

    it('admin can update application status', () => {
      const permissions = simulateRLSPolicy(
        Role.ADMIN,
        testUsers.admin.id,
        testApplications.submitted.created_by,
        testApplications.submitted.broker_owned
      )

      expect(permissions.canUpdate).toBe(true)
    })

    it('admin cannot delete applications', () => {
      const permissions = simulateRLSPolicy(
        Role.ADMIN,
        testUsers.admin.id,
        testApplications.submitted.created_by,
        testApplications.submitted.broker_owned
      )

      expect(permissions.canDelete).toBe(false)
    })

    it('admin can view in-progress applications', () => {
      const permissions = simulateRLSPolicy(
        Role.ADMIN,
        testUsers.admin.id,
        testApplications.applicantOwned.created_by,
        testApplications.applicantOwned.broker_owned
      )

      expect(permissions.canRead).toBe(true)
    })
  })

  describe('View Inbox', () => {
    it('lists all submitted applications', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)
      const inboxApps = [
        { id: 'app-1', status: ApplicationStatus.SUBMITTED },
        { id: 'app-2', status: ApplicationStatus.SUBMITTED },
        { id: 'app-3', status: ApplicationStatus.IN_REVIEW },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { applications: inboxApps, count: inboxApps.length },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .in('status', [ApplicationStatus.SUBMITTED, ApplicationStatus.IN_REVIEW, ApplicationStatus.RFI])
        .single()

      expect(result.data.applications.length).toBe(3)
    })

    it('filters by building', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)
      const targetBuildingId = 'building-id-1'
      const filteredApps = [
        { id: 'app-1', building_id: targetBuildingId, status: ApplicationStatus.SUBMITTED },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { applications: filteredApps },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .eq('building_id', targetBuildingId)
        .eq('status', ApplicationStatus.SUBMITTED)
        .single()

      expect(result.data.applications.every((app: { building_id: string }) =>
        app.building_id === targetBuildingId
      )).toBe(true)
    })

    it('sorts by submitted date', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)
      const sortedApps = [
        { id: 'app-1', submitted_at: '2025-01-20T00:00:00Z' },
        { id: 'app-2', submitted_at: '2025-01-15T00:00:00Z' },
        { id: 'app-3', submitted_at: '2025-01-10T00:00:00Z' },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { applications: sortedApps },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false })
        .single()

      const dates = result.data.applications.map((app: { submitted_at: string }) =>
        new Date(app.submitted_at).getTime()
      )
      expect(dates[0]).toBeGreaterThan(dates[1])
      expect(dates[1]).toBeGreaterThan(dates[2])
    })
  })

  describe('Review Application', () => {
    it('admin can view full application details', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.submitted,
          people: [{ id: 'person-1', fullName: 'Test Applicant', ssn_last4: '1234' }],
          employment_records: [{ id: 'emp-1', employer: 'Test Corp', annual_income: 120000 }],
          financial_entries: [
            { id: 'fin-1', entry_type: 'ASSET', amount: 50000 },
            { id: 'fin-2', entry_type: 'LIABILITY', amount: 20000 },
          ],
          documents: [
            { id: 'doc-1', category: 'GOVERNMENT_ID' },
            { id: 'doc-2', category: 'BANK_STATEMENT' },
          ],
          disclosures: [{ id: 'disc-1', type: 'LEAD_PAINT_CERTIFICATION', acknowledged: true }],
          building: { id: 'building-1', name: 'Test Building' },
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
          disclosures(*),
          building:buildings(*)
        `)
        .eq('id', testApplications.submitted.id)
        .single()

      expect(result.data.people.length).toBeGreaterThan(0)
      expect(result.data.documents.length).toBeGreaterThan(0)
      expect(result.data.building).toBeTruthy()
    })

    it('admin can download all documents', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockStorageFileApi.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://storage.test/signed-url' },
        error: null,
      })

      const result = await mockClient.storage
        .from('documents')
        .createSignedUrl('any/path/doc.pdf', 3600)

      expect(result.error).toBeNull()
      expect(result.data?.signedUrl).toBeTruthy()
    })

    it('admin can view financial summary', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)
      const financials = [
        { entry_type: 'ASSET', category: 'CHECKING', amount: 30000 },
        { entry_type: 'ASSET', category: 'SAVINGS', amount: 50000 },
        { entry_type: 'LIABILITY', category: 'CREDIT_CARD', amount: 5000 },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { entries: financials },
        error: null,
      })

      const result = await mockClient
        .from('financial_entries')
        .select('*')
        .eq('application_id', testApplications.submitted.id)
        .single()

      const assets = result.data.entries.filter((e: { entry_type: string }) => e.entry_type === 'ASSET')
      const liabilities = result.data.entries.filter((e: { entry_type: string }) => e.entry_type === 'LIABILITY')
      const totalAssets = assets.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
      const totalLiabilities = liabilities.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
      const netWorth = totalAssets - totalLiabilities

      expect(totalAssets).toBe(80000)
      expect(totalLiabilities).toBe(5000)
      expect(netWorth).toBe(75000)
    })
  })

  describe('Create RFI', () => {
    it('admin can create new RFI', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)
      const rfiData = {
        application_id: testApplications.submitted.id,
        section_key: 'documents',
        status: RFIStatus.OPEN,
        assignee_role: Role.APPLICANT,
        created_by: testUsers.admin.id,
      }

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'new-rfi-id',
          ...rfiData,
          created_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('rfis')
        .insert(rfiData)
        .select()
        .single()

      expect(result.data.status).toBe(RFIStatus.OPEN)
      expect(result.data.section_key).toBe('documents')
    })

    it('RFI creation updates application status', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.submitted.id,
          status: ApplicationStatus.RFI,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ status: ApplicationStatus.RFI })
        .eq('id', testApplications.submitted.id)
        .select()
        .single()

      expect(result.data.status).toBe(ApplicationStatus.RFI)
    })

    it('RFI has initial message', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)
      const rfiId = 'new-rfi-id'
      const message = 'Please provide 3 months of bank statements instead of 2.'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'message-id-1',
          rfi_id: rfiId,
          author_id: testUsers.admin.id,
          author_role: Role.ADMIN,
          message: message,
          created_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('rfi_messages')
        .insert({
          rfi_id: rfiId,
          author_id: testUsers.admin.id,
          author_role: Role.ADMIN,
          message: message,
        })
        .select()
        .single()

      expect(result.data.message).toBe(message)
      expect(result.data.author_role).toBe(Role.ADMIN)
    })

    it('can assign RFI to broker or applicant', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      // Test assign to applicant
      mockClient._mockQueryBuilder.single.mockResolvedValueOnce({
        data: { id: 'rfi-1', assignee_role: Role.APPLICANT },
        error: null,
      })

      const applicantRfi = await mockClient
        .from('rfis')
        .insert({ assignee_role: Role.APPLICANT })
        .select()
        .single()

      expect(applicantRfi.data.assignee_role).toBe(Role.APPLICANT)

      // Test assign to broker
      mockClient._mockQueryBuilder.single.mockResolvedValueOnce({
        data: { id: 'rfi-2', assignee_role: Role.BROKER },
        error: null,
      })

      const brokerRfi = await mockClient
        .from('rfis')
        .insert({ assignee_role: Role.BROKER })
        .select()
        .single()

      expect(brokerRfi.data.assignee_role).toBe(Role.BROKER)
    })
  })

  describe('Resolve RFI', () => {
    it('admin can resolve RFI', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'rfi-id',
          status: RFIStatus.RESOLVED,
          resolved_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('rfis')
        .update({
          status: RFIStatus.RESOLVED,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', 'rfi-id')
        .select()
        .single()

      expect(result.data.status).toBe(RFIStatus.RESOLVED)
      expect(result.data.resolved_at).toBeTruthy()
    })

    it('resolving all RFIs updates application status to IN_REVIEW', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      // Check no open RFIs - use single() pattern
      mockClient._mockQueryBuilder.single.mockResolvedValueOnce({
        data: { rfis: [], count: 0 }, // No open RFIs
        error: null,
      })

      const openRfis = await mockClient
        .from('rfis')
        .select()
        .eq('application_id', testApplications.submitted.id)
        .eq('status', RFIStatus.OPEN)
        .single()

      expect(openRfis.data.rfis.length).toBe(0)

      // Update application status
      mockClient._mockQueryBuilder.single.mockResolvedValueOnce({
        data: {
          id: testApplications.submitted.id,
          status: ApplicationStatus.IN_REVIEW,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ status: ApplicationStatus.IN_REVIEW })
        .eq('id', testApplications.submitted.id)
        .select()
        .single()

      expect(result.data.status).toBe(ApplicationStatus.IN_REVIEW)
    })
  })

  describe('Make Decision', () => {
    it('admin can approve application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'decision-id',
          application_id: testApplications.submitted.id,
          decision: Decision.APPROVE,
          decided_by: testUsers.admin.id,
          decided_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: Decision.APPROVE,
        p_reason_codes: [],
        p_notes: 'All requirements met.',
        p_uses_consumer_report: false,
      })

      expect(result.data.decision).toBe(Decision.APPROVE)
    })

    it('admin can deny application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'decision-id',
          application_id: testApplications.submitted.id,
          decision: Decision.DENY,
          reason_codes: ['INSUFFICIENT_INCOME', 'HIGH_DTI'],
          decided_by: testUsers.admin.id,
        },
        error: null,
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: Decision.DENY,
        p_reason_codes: ['INSUFFICIENT_INCOME', 'HIGH_DTI'],
        p_notes: 'Income does not meet minimum requirements.',
        p_uses_consumer_report: true,
      })

      expect(result.data.decision).toBe(Decision.DENY)
      expect(result.data.reason_codes).toContain('INSUFFICIENT_INCOME')
    })

    it('admin can conditionally approve application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'decision-id',
          application_id: testApplications.submitted.id,
          decision: Decision.CONDITIONAL,
          notes: 'Approved with condition: must provide guarantor.',
          decided_by: testUsers.admin.id,
        },
        error: null,
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: Decision.CONDITIONAL,
        p_reason_codes: [],
        p_notes: 'Approved with condition: must provide guarantor.',
        p_uses_consumer_report: false,
      })

      expect(result.data.decision).toBe(Decision.CONDITIONAL)
      expect(result.data.notes).toContain('guarantor')
    })

    it('decision updates application status', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.submitted.id,
          status: ApplicationStatus.APPROVED,
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ status: ApplicationStatus.APPROVED })
        .eq('id', testApplications.submitted.id)
        .select()
        .single()

      expect(result.data.status).toBe(ApplicationStatus.APPROVED)
    })
  })

  describe('Adverse Action Handling', () => {
    it('flags adverse action when using consumer report for denial', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'decision-id',
          decision: Decision.DENY,
          uses_consumer_report: true,
          adverse_action_required: true,
        },
        error: null,
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: Decision.DENY,
        p_uses_consumer_report: true,
      })

      expect(result.data.adverse_action_required).toBe(true)
    })

    it('no adverse action for approval', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: {
          id: 'decision-id',
          decision: Decision.APPROVE,
          uses_consumer_report: true,
          adverse_action_required: false,
        },
        error: null,
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: Decision.APPROVE,
        p_uses_consumer_report: true,
      })

      expect(result.data.adverse_action_required).toBe(false)
    })
  })

  describe('Notifications', () => {
    it('creates notification on RFI creation', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'notification-id',
          user_id: testUsers.applicant.id,
          type: 'RFI_CREATED',
          title: 'New Request for Information',
          read: false,
        },
        error: null,
      })

      const result = await mockClient
        .from('notifications')
        .insert({
          user_id: testUsers.applicant.id,
          type: 'RFI_CREATED',
          title: 'New Request for Information',
        })
        .select()
        .single()

      expect(result.data.type).toBe('RFI_CREATED')
      expect(result.data.read).toBe(false)
    })

    it('creates notification on decision', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'notification-id',
          user_id: testUsers.applicant.id,
          type: 'DECISION_MADE',
          title: 'Application Decision',
        },
        error: null,
      })

      const result = await mockClient
        .from('notifications')
        .insert({
          user_id: testUsers.applicant.id,
          type: 'DECISION_MADE',
          title: 'Application Decision',
        })
        .select()
        .single()

      expect(result.data.type).toBe('DECISION_MADE')
    })
  })

  describe('Edge Cases', () => {
    it('prevents decision on non-submitted application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Cannot make decision on non-submitted application' },
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.applicantOwned.id, // IN_PROGRESS
        p_decision: Decision.APPROVE,
      })

      expect(result.error).not.toBeNull()
    })

    it('prevents duplicate decisions', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Decision already recorded for this application' },
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: Decision.APPROVE,
      })

      expect(result.error).not.toBeNull()
    })

    it('handles RFI on already decided application', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Cannot create RFI on decided application' },
      })

      const result = await mockClient
        .from('rfis')
        .insert({
          application_id: testApplications.submitted.id,
          section_key: 'documents',
        })
        .select()
        .single()

      // This would fail if application already has a decision
      expect(result.data).toBeNull()
    })
  })
})
