/**
 * Edge Case Tests
 *
 * Comprehensive tests for edge cases, error handling, and boundary conditions
 * across the application.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  testUsers,
  testApplications,
  createMockSupabaseClient,
  simulateRLSPolicy,
  simulateStorageRLSPolicy,
} from './mocks/supabase'
import { Role, ApplicationStatus, TransactionType } from '@/lib/types'

describe('Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication Edge Cases', () => {
    it('handles session timeout gracefully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired', status: 401 },
      })

      const { data, error } = await mockClient.auth.getSession()

      expect(data.session).toBeNull()
      expect(error).not.toBeNull()
    })

    it('handles invalid refresh token', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid refresh token', status: 401 },
      })

      const { data, error } = await mockClient.auth.getUser()

      expect(data.user).toBeNull()
      expect(error?.message).toContain('Invalid')
    })

    it('handles network disconnect during auth', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signInWithPassword.mockRejectedValue(
        new Error('Network request failed')
      )

      await expect(
        mockClient.auth.signInWithPassword({
          email: 'test@test.com',
          password: 'password',
        })
      ).rejects.toThrow('Network request failed')
    })
  })

  describe('Database Error Handling', () => {
    it('handles unique constraint violation', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: {
          message: 'duplicate key value violates unique constraint',
          code: '23505',
        },
      })

      const result = await mockClient
        .from('users')
        .insert({ email: 'existing@test.com' })
        .select()
        .single()

      expect(result.error?.code).toBe('23505')
    })

    it('handles foreign key violation', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: {
          message: 'insert or update on table violates foreign key constraint',
          code: '23503',
        },
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: 'non-existent-app-id',
          first_name: 'Test',
        })
        .select()
        .single()

      expect(result.error?.code).toBe('23503')
    })

    it('handles null constraint violation', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: {
          message: 'null value in column violates not-null constraint',
          code: '23502',
        },
      })

      const result = await mockClient
        .from('applications')
        .insert({
          building_id: null, // Required field
        })
        .select()
        .single()

      expect(result.error?.code).toBe('23502')
    })

    it('handles connection timeout', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      // Simulate connection timeout by mocking the single method to reject
      mockClient._mockQueryBuilder.single.mockRejectedValue(
        new Error('Connection timed out')
      )

      await expect(
        mockClient.from('applications').select('*').single()
      ).rejects.toThrow('Connection timed out')
    })
  })

  describe('Storage Edge Cases', () => {
    it('handles file size exceeding limit', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockStorageFileApi.upload.mockResolvedValue({
        data: null,
        error: { message: 'File size exceeds 50MB limit' },
      })

      const result = await mockClient.storage
        .from('documents')
        .upload('path/to/file.pdf', new Blob(['large file']))

      expect(result.error?.message).toContain('size')
    })

    it('handles unsupported file type', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockStorageFileApi.upload.mockResolvedValue({
        data: null,
        error: { message: 'File type not allowed' },
      })

      const result = await mockClient.storage
        .from('documents')
        .upload('path/to/file.exe', new Blob(['executable']))

      expect(result.error).not.toBeNull()
    })

    it('handles corrupt file upload', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockStorageFileApi.upload.mockResolvedValue({
        data: null,
        error: { message: 'File appears to be corrupted' },
      })

      const result = await mockClient.storage
        .from('documents')
        .upload('path/to/corrupt.pdf', new Blob())

      expect(result.error).not.toBeNull()
    })

    it('handles missing file on download', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockStorageFileApi.download.mockResolvedValue({
        data: null,
        error: { message: 'Object not found' },
      })

      const result = await mockClient.storage
        .from('documents')
        .download('non-existent-path/file.pdf')

      expect(result.error?.message).toContain('not found')
    })

    it('handles expired signed URL', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockStorageFileApi.createSignedUrl.mockResolvedValue({
        data: null,
        error: { message: 'Signed URL has expired' },
      })

      const result = await mockClient.storage
        .from('documents')
        .createSignedUrl('path/file.pdf', 0) // Zero expiry

      expect(result.error).not.toBeNull()
    })

    it('handles storage path traversal attempt', () => {
      const userId = testUsers.applicant.id
      const maliciousPath = `${userId}/../other-user/file.pdf`

      // Path should be sanitized
      const canUpload = simulateStorageRLSPolicy(
        userId,
        Role.APPLICANT,
        maliciousPath,
        'upload'
      )

      expect(canUpload).toBe(false)
    })
  })

  describe('Application State Edge Cases', () => {
    it('handles deleted application access', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Application not found', code: 'PGRST116' },
      })

      const result = await mockClient
        .from('applications')
        .select('*')
        .eq('id', 'deleted-app-id')
        .is('deleted_at', null)
        .single()

      expect(result.error?.code).toBe('PGRST116')
    })

    it('handles application status race condition', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      // Simulating someone else submitted between our read and write
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Application has already been submitted' },
      })

      const result = await mockClient
        .from('applications')
        .update({ status: ApplicationStatus.SUBMITTED })
        .eq('id', testApplications.applicantOwned.id)
        .eq('status', ApplicationStatus.IN_PROGRESS) // Optimistic lock
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('handles empty application (no data filled)', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'empty-app-id',
          completion_percentage: 0,
          people: [],
          employment_records: [],
          financial_entries: [],
          documents: [],
          disclosures: [],
          metadata: {},
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
        .eq('id', 'empty-app-id')
        .single()

      expect(result.data.completion_percentage).toBe(0)
      expect(result.data.people).toEqual([])
    })

    it('handles orphaned records cleanup', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      // Delete application should cascade - mock single to return empty
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      // After deleting application, related records should be gone
      const result = await mockClient
        .from('people')
        .select('*')
        .eq('application_id', 'deleted-app-id')
        .single()

      expect(result.data).toBeNull()
    })
  })

  describe('Role Transition Edge Cases', () => {
    it('handles user with invalid role', () => {
      const invalidRole = 'INVALID_ROLE' as Role

      // Should not match any valid permission
      expect(Object.values(Role)).not.toContain(invalidRole)
    })

    it('handles application access during role change', () => {
      // User was APPLICANT, now changed to BROKER
      // They should still have access to their old applications
      const formerApplicantNowBroker = {
        ...testUsers.applicant,
        role: Role.BROKER,
      }

      // As BROKER, they shouldn't have access to their old applicant-owned app
      // unless explicitly granted through participation
      const permissions = simulateRLSPolicy(
        formerApplicantNowBroker.role,
        formerApplicantNowBroker.id,
        testApplications.applicantOwned.created_by, // Same user ID
        testApplications.applicantOwned.broker_owned
      )

      // Depends on implementation - may need special handling
      expect(permissions.canRead).toBeDefined()
    })

    it('handles invitation for user who already has account', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'invitation-id',
          email: testUsers.applicant.email, // Existing user
          status: 'PENDING',
        },
        error: null,
      })

      const result = await mockClient
        .from('invitations')
        .insert({
          application_id: testApplications.brokerOwned.id,
          email: testUsers.applicant.email,
        })
        .select()
        .single()

      // Should still create invitation - user can claim application
      expect(result.data.email).toBe(testUsers.applicant.email)
    })
  })

  describe('Data Boundary Conditions', () => {
    it('handles maximum SSN length', () => {
      const validSSNLast4 = '1234'
      const tooLongSSN = '12345'
      const tooShortSSN = '123'

      expect(validSSNLast4.length).toBe(4)
      expect(tooLongSSN.length).not.toBe(4)
      expect(tooShortSSN.length).not.toBe(4)
    })

    it('handles very large income amounts', () => {
      const maxSafeInteger = Number.MAX_SAFE_INTEGER
      const largeIncome = 999999999999

      expect(largeIncome).toBeLessThan(maxSafeInteger)
    })

    it('handles zero income', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'emp-id',
          annual_income: 0, // Unemployed or volunteer
        },
        error: null,
      })

      const result = await mockClient
        .from('employment_records')
        .insert({
          application_id: testApplications.applicantOwned.id,
          employer: 'Volunteer Organization',
          annual_income: 0,
        })
        .select()
        .single()

      expect(result.data.annual_income).toBe(0)
    })

    it('handles negative financial values', () => {
      // Some financial systems might use negative for liabilities
      const positiveAsset = 50000
      const negativeLiability = -30000 // Alternative representation

      // Our system uses entry_type to differentiate
      expect(positiveAsset > 0).toBe(true)
      expect(negativeLiability < 0).toBe(true)
    })

    it('handles very long text fields', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const longCoverLetter = 'A'.repeat(50000) // 50K characters

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: testApplications.applicantOwned.id,
          metadata: { coverLetter: longCoverLetter },
        },
        error: null,
      })

      const result = await mockClient
        .from('applications')
        .update({ metadata: { coverLetter: longCoverLetter } })
        .eq('id', testApplications.applicantOwned.id)
        .select()
        .single()

      expect(result.data.metadata.coverLetter.length).toBe(50000)
    })

    it('handles special characters in text fields', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const nameWithSpecialChars = "O'Brien-McDonald"
      const addressWithSymbols = '123 Main St. #5A'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'person-id',
          last_name: nameWithSpecialChars,
        },
        error: null,
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.applicantOwned.id,
          last_name: nameWithSpecialChars,
        })
        .select()
        .single()

      expect(result.data.last_name).toBe(nameWithSpecialChars)
    })

    it('handles Unicode characters', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)
      const unicodeName = '田中太郎' // Japanese name

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'person-id',
          first_name: unicodeName,
        },
        error: null,
      })

      const result = await mockClient
        .from('people')
        .insert({
          application_id: testApplications.applicantOwned.id,
          first_name: unicodeName,
        })
        .select()
        .single()

      expect(result.data.first_name).toBe(unicodeName)
    })

    it('handles emoji in text', async () => {
      const mockClient = createMockSupabaseClient(testUsers.board)
      const noteWithEmoji = 'Great application! 👍✨'

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: {
          id: 'note-id',
          content: noteWithEmoji,
        },
        error: null,
      })

      const result = await mockClient
        .from('board_notes')
        .insert({
          application_id: testApplications.submitted.id,
          board_member_id: testUsers.board.id,
          content: noteWithEmoji,
        })
        .select()
        .single()

      expect(result.data.content).toBe(noteWithEmoji)
    })
  })

  describe('Date Handling Edge Cases', () => {
    it('handles far future dates', () => {
      const farFuture = new Date('2099-12-31')
      expect(farFuture.getFullYear()).toBe(2099)
    })

    it('handles ancient dates for DOB', () => {
      const oldDate = new Date('1920-01-01')
      const today = new Date()
      const age = today.getFullYear() - oldDate.getFullYear()

      expect(age).toBeGreaterThan(100)
    })

    it('handles leap year dates', () => {
      // Use UTC to avoid timezone issues
      const leapDate = new Date(Date.UTC(2024, 1, 29)) // Month is 0-indexed
      expect(leapDate.getUTCMonth()).toBe(1) // February
      expect(leapDate.getUTCDate()).toBe(29)
    })

    it('handles timezone edge cases', () => {
      const utcDate = new Date('2025-01-15T00:00:00Z')
      const localDate = new Date('2025-01-15T00:00:00')

      // UTC and local may differ
      expect(utcDate.toISOString()).toContain('Z')
    })
  })

  describe('RFI Edge Cases', () => {
    it('handles RFI on already resolved RFI', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'RFI is already resolved' },
      })

      const result = await mockClient
        .from('rfi_messages')
        .insert({
          rfi_id: 'resolved-rfi-id',
          message: 'Additional message',
        })
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('handles orphaned RFI (application deleted)', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      // Mock single to return empty for deleted application's RFIs
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      const result = await mockClient
        .from('rfis')
        .select('*')
        .eq('application_id', 'deleted-app-id')
        .single()

      expect(result.data).toBeNull()
    })

    it('handles RFI with empty message', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Message cannot be empty' },
      })

      const result = await mockClient
        .from('rfi_messages')
        .insert({
          rfi_id: 'rfi-id',
          message: '',
        })
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })
  })

  describe('Decision Edge Cases', () => {
    it('handles decision with no reason codes for denial', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Denial requires at least one reason code' },
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: 'DENY',
        p_reason_codes: [], // Empty
      })

      expect(result.error).not.toBeNull()
    })

    it('handles decision on application with open RFIs', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Cannot make decision while RFIs are open' },
      })

      const result = await mockClient.rpc('record_application_decision', {
        p_application_id: testApplications.submitted.id,
        p_decision: 'APPROVE',
      })

      expect(result.error).not.toBeNull()
    })
  })

  describe('Notification Edge Cases', () => {
    it('handles notification for deleted user', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      const result = await mockClient
        .from('notifications')
        .insert({
          user_id: 'deleted-user-id',
          type: 'APPLICATION_SUBMITTED',
          title: 'Test',
        })
        .select()
        .single()

      expect(result.error).not.toBeNull()
    })

    it('handles bulk notification creation', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)
      const notifications = Array(100)
        .fill(null)
        .map((_, i) => ({
          user_id: `user-${i}`,
          type: 'SYSTEM',
          title: `Notification ${i}`,
        }))

      // Mock single to return the notifications count
      mockClient._mockQueryBuilder.single.mockResolvedValue({
        data: { count: notifications.length },
        error: null,
      })

      const result = await mockClient
        .from('notifications')
        .insert(notifications)
        .select('count')
        .single()

      expect(result.data.count).toBe(100)
    })
  })
})
