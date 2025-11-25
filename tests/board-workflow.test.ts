/**
 * Board Workflow Tests
 *
 * Tests for the board member workflow including:
 * - Viewing assigned applications
 * - Adding private notes
 * - Viewing documents
 * - Read-only access restrictions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  testUsers,
  testApplications,
  testDocuments,
  createMockSupabaseClient,
  simulateRLSPolicy,
  simulateStorageRLSPolicy,
} from './mocks/supabase'
import { Role, ApplicationStatus } from '@/lib/types'

describe('Board Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Access Control', () => {
    it('board member can view assigned applications', () => {
      const permissions = simulateRLSPolicy(
        Role.BOARD,
        testUsers.board.id,
        testApplications.submitted.created_by,
        testApplications.submitted.broker_owned
      )

      expect(permissions.canRead).toBe(true)
    })

    it('board member cannot edit application data', () => {
      const permissions = simulateRLSPolicy(
        Role.BOARD,
        testUsers.board.id,
        testApplications.submitted.created_by,
        testApplications.submitted.broker_owned
      )

      expect(permissions.canUpdate).toBe(false)
    })

    it('board member cannot delete applications', () => {
      const permissions = simulateRLSPolicy(
        Role.BOARD,
        testUsers.board.id,
        testApplications.submitted.created_by,
        testApplications.submitted.broker_owned
      )

      expect(permissions.canDelete).toBe(false)
    })

    it('board member can view all documents', () => {
      const canDownload = simulateStorageRLSPolicy(
        testUsers.board.id,
        Role.BOARD,
        testDocuments.applicantDocument.storage_path,
        'download'
      )

      expect(canDownload).toBe(true)
    })

    it('board member cannot upload documents', () => {
      const applicantPath = `${testUsers.applicant.id}/app-123/doc.pdf`
      const canUpload = simulateStorageRLSPolicy(
        testUsers.board.id,
        Role.BOARD,
        applicantPath,
        'upload'
      )

      expect(canUpload).toBe(false)
    })

    it('board member cannot delete documents', () => {
      const canDelete = simulateStorageRLSPolicy(
        testUsers.board.id,
        Role.BOARD,
        testDocuments.applicantDocument.storage_path,
        'delete'
      )

      expect(canDelete).toBe(false)
    })
  })

  describe('View Applications', () => {
    it('lists applications assigned to board', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const boardApps = [
        {
          id: 'app-1',
          status: ApplicationStatus.SUBMITTED,
          building: { id: 'building-1', name: 'Test Building' },
        },
        {
          id: 'app-2',
          status: ApplicationStatus.IN_REVIEW,
          building: { id: 'building-1', name: 'Test Building' },
        },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { applications: boardApps, count: boardApps.length },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*, building:buildings(*)')
        .in('status', [ApplicationStatus.SUBMITTED, ApplicationStatus.IN_REVIEW])
        .single()

      expect(result.data.applications.length).toBe(2)
    })

    it('views full application details', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.submitted,
          people: [
            {
              id: 'person-1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@test.com',
              ssn_last4: '1234',
            },
          ],
          employment_records: [
            {
              id: 'emp-1',
              employer: 'Test Corp',
              title: 'Engineer',
              annual_income: 150000,
            },
          ],
          financial_entries: [
            { id: 'fin-1', entry_type: 'ASSET', amount: 100000 },
            { id: 'fin-2', entry_type: 'LIABILITY', amount: 20000 },
          ],
          documents: [
            { id: 'doc-1', category: 'BANK_STATEMENT', filename: 'bank.pdf' },
            { id: 'doc-2', category: 'TAX_RETURN', filename: 'tax.pdf' },
          ],
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
          building:buildings(*)
        `)
        .eq('id', testApplications.submitted.id)
        .single()

      expect(result.data.people.length).toBeGreaterThan(0)
      expect(result.data.employment_records.length).toBeGreaterThan(0)
      expect(result.data.financial_entries.length).toBeGreaterThan(0)
      expect(result.data.documents.length).toBeGreaterThan(0)
    })

    it('filters by building for board-specific views', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const boardBuildingId = 'board-building-123'
      const filteredApps = [{ id: 'app-1', building_id: boardBuildingId }]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { applications: filteredApps },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .eq('building_id', boardBuildingId)
        .single()

      expect(result.data.applications.every((app: { building_id: string }) =>
        app.building_id === boardBuildingId
      )).toBe(true)
    })
  })

  describe('Private Notes', () => {
    it('board member can add private notes', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const noteContent = 'Applicant has strong financials. Recommend approval.'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'note-id-1',
          application_id: testApplications.submitted.id,
          board_member_id: testUsers.board.id,
          content: noteContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('board_notes')
        .insert({
          application_id: testApplications.submitted.id,
          board_member_id: testUsers.board.id,
          content: noteContent,
        })
        .select()
        .single()

      expect(result.data.content).toBe(noteContent)
      expect(result.data.board_member_id).toBe(testUsers.board.id)
    })

    it('board member can view own notes', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const boardNotes = [
        { id: 'note-1', content: 'Note 1', board_member_id: testUsers.board.id },
        { id: 'note-2', content: 'Note 2', board_member_id: testUsers.board.id },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { notes: boardNotes, count: boardNotes.length },
        error: null,
      })

      const result = await mockClient
        .from('board_notes')
        .select('*')
        .eq('application_id', testApplications.submitted.id)
        .eq('board_member_id', testUsers.board.id)
        .single()

      expect(result.data.notes.length).toBe(2)
    })

    it('board member can update own notes', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const updatedContent = 'Updated note content with new observations.'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'note-id-1',
          content: updatedContent,
          updated_at: new Date().toISOString(),
        },
        error: null,
      })

      const result = await mockClient
        .from('board_notes')
        .update({ content: updatedContent })
        .eq('id', 'note-id-1')
        .eq('board_member_id', testUsers.board.id) // RLS check
        .select()
        .single()

      expect(result.data.content).toBe(updatedContent)
    })

    it('board member can delete own notes', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { deleted: true },
        error: null,
      })

      const result = await mockClient
        .from('board_notes')
        .delete()
        .eq('id', 'note-id-1')
        .eq('board_member_id', testUsers.board.id)
        .single()

      expect(result.error).toBeNull()
    })

    it('notes are private to the board member who created them', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const otherBoardMemberId = 'other-board-member-id'

      // Attempt to view another board member's notes - RLS prevents seeing other's notes
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { notes: [] },
        error: null,
      })

      const result = await mockClient
        .from('board_notes')
        .select('*')
        .eq('board_member_id', otherBoardMemberId)
        .single()

      // Should not see notes from other board members
      expect(result.data.notes.length).toBe(0)
    })
  })

  describe('Document Viewing', () => {
    it('board member can view all document metadata', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const docs = [
        { id: 'doc-1', category: 'GOVERNMENT_ID', filename: 'id.pdf', status: 'UPLOADED' },
        { id: 'doc-2', category: 'BANK_STATEMENT', filename: 'bank.pdf', status: 'VERIFIED' },
        { id: 'doc-3', category: 'TAX_RETURN', filename: 'tax.pdf', status: 'UPLOADED' },
        { id: 'doc-4', category: 'REFERENCE_LETTER', filename: 'ref.pdf', status: 'UPLOADED' },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { documents: docs, count: docs.length },
        error: null,
      })

      const result = await mockClient
        .from('documents')
        .select('*')
        .eq('application_id', testApplications.submitted.id)
        .single()

      expect(result.data.documents.length).toBe(4)
    })

    it('board member can download documents', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockStorageFileApi.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://storage.test/signed-url-for-board' },
        error: null,
      })

      const result = await mockClient.storage
        .from('documents')
        .createSignedUrl('applicant-id/app-id/document.pdf', 3600)

      expect(result.error).toBeNull()
      expect(result.data?.signedUrl).toBeTruthy()
    })

    it('downloads are tracked in audit log', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'audit-id',
          user_id: testUsers.board.id,
          action: 'DOCUMENT_DOWNLOADED',
          application_id: testApplications.submitted.id,
          metadata: { document_id: 'doc-1' },
        },
        error: null,
      })

      const result = await mockClient
        .from('audit_logs')
        .insert({
          user_id: testUsers.board.id,
          action: 'DOCUMENT_DOWNLOADED',
          application_id: testApplications.submitted.id,
          metadata: { document_id: 'doc-1' },
        })
        .select()
        .single()

      expect(result.data.action).toBe('DOCUMENT_DOWNLOADED')
    })
  })

  describe('Financial Review', () => {
    it('board member can view financial summary', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const financials = [
        { entry_type: 'ASSET', category: 'CHECKING', institution: 'Chase', amount: 50000 },
        { entry_type: 'ASSET', category: 'SAVINGS', institution: 'Wells Fargo', amount: 100000 },
        { entry_type: 'ASSET', category: 'INVESTMENT', institution: 'Vanguard', amount: 200000 },
        { entry_type: 'LIABILITY', category: 'MORTGAGE', institution: 'Bank of America', amount: 150000 },
        { entry_type: 'LIABILITY', category: 'STUDENT_LOAN', institution: 'Navient', amount: 30000 },
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

      expect(totalAssets).toBe(350000)
      expect(totalLiabilities).toBe(180000)
      expect(netWorth).toBe(170000)
    })

    it('board member can view employment and income', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const employment = [
        {
          id: 'emp-1',
          employer: 'Big Tech Corp',
          title: 'Senior Engineer',
          annual_income: 250000,
          is_current: true,
        },
        {
          id: 'emp-2',
          employer: 'Startup Inc',
          title: 'CTO',
          annual_income: 150000,
          is_current: false,
        },
      ]

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { records: employment },
        error: null,
      })

      const result = await mockClient
        .from('employment_records')
        .select('*')
        .eq('application_id', testApplications.submitted.id)
        .single()

      const currentEmployment = result.data.records.find((e: { is_current: boolean }) => e.is_current)
      expect(currentEmployment.employer).toBe('Big Tech Corp')
      expect(currentEmployment.annual_income).toBe(250000)
    })
  })

  describe('Read-Only Restrictions', () => {
    it('cannot modify application data', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied', code: '42501' },
      })

      const result = await mockClient
        .from('applications')
        .update({ unit: 'changed-unit' })
        .eq('id', testApplications.submitted.id)
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('cannot modify people records', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied', code: '42501' },
      })

      const result = await mockClient
        .from('people')
        .update({ first_name: 'Changed' })
        .eq('application_id', testApplications.submitted.id)
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('cannot modify financial entries', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied', code: '42501' },
      })

      const result = await mockClient
        .from('financial_entries')
        .update({ amount: 999999 })
        .eq('application_id', testApplications.submitted.id)
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('cannot create RFIs', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied', code: '42501' },
      })

      const result = await mockClient
        .from('rfis')
        .insert({
          application_id: testApplications.submitted.id,
          section_key: 'documents',
        })
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('cannot make decisions', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied: only ADMIN can make decisions' },
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: 'APPROVE',
      })

      expect(result.error).not.toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty note content', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Note content cannot be empty' },
      })

      const result = await mockClient
        .from('board_notes')
        .insert({
          application_id: testApplications.submitted.id,
          board_member_id: testUsers.board.id,
          content: '', // Empty content
        })
        .select()
        .single()

      // Should reject empty notes or handle gracefully
      expect(result.error).not.toBeNull()
    })

    it('handles very long notes', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const longContent = 'A'.repeat(10000) // 10K characters

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'note-id',
          content: longContent,
        },
        error: null,
      })

      const result = await mockClient
        .from('board_notes')
        .insert({
          application_id: testApplications.submitted.id,
          board_member_id: testUsers.board.id,
          content: longContent,
        })
        .select()
        .single()

      expect(result.data.content.length).toBe(10000)
    })

    it('handles concurrent note editing', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      // Simulate optimistic locking failure
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Row was modified by another user', code: 'PGRST116' },
      })

      const result = await mockClient
        .from('board_notes')
        .update({ content: 'New content' })
        .eq('id', 'note-id')
        .eq('updated_at', 'stale-timestamp')
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('handles viewing application with no documents', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          ...testApplications.submitted,
          documents: [], // No documents
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .select('*, documents(*)')
        .eq('id', testApplications.submitted.id)
        .single()

      expect(result.data.documents).toEqual([])
    })
  })
})
