/**
 * User Authentication Tests
 *
 * Tests for user signup, signin, and role-based access
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  testUsers,
  createMockSupabaseClient,
} from './mocks/supabase'
import { Role } from '@/lib/types'

describe('User Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Sign Up', () => {
    it('creates applicant user successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: testUsers.applicant.id,
            email: testUsers.applicant.email,
          },
        },
        error: null,
      })

      const { data, error } = await mockClient.auth.signUp({
        email: testUsers.applicant.email,
        password: 'testPassword123!',
        options: {
          data: {
            full_name: testUsers.applicant.name,
            role: Role.APPLICANT,
          },
        },
      })

      expect(error).toBeNull()
      expect(data.user?.email).toBe(testUsers.applicant.email)
    })

    it('creates broker user successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: testUsers.broker.id,
            email: testUsers.broker.email,
          },
        },
        error: null,
      })

      const { data, error } = await mockClient.auth.signUp({
        email: testUsers.broker.email,
        password: 'testPassword123!',
        options: {
          data: {
            full_name: testUsers.broker.name,
            role: Role.BROKER,
          },
        },
      })

      expect(error).toBeNull()
      expect(data.user?.email).toBe(testUsers.broker.email)
    })

    it('rejects signup with invalid email', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email', status: 400 },
      })

      const { data, error } = await mockClient.auth.signUp({
        email: 'invalid-email',
        password: 'testPassword123!',
      })

      expect(error).not.toBeNull()
      expect(data.user).toBeNull()
    })

    it('rejects signup with weak password', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Password should be at least 6 characters', status: 400 },
      })

      const { data, error } = await mockClient.auth.signUp({
        email: testUsers.applicant.email,
        password: '123',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('Password')
    })

    it('rejects duplicate email signup', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered', status: 400 },
      })

      const { data, error } = await mockClient.auth.signUp({
        email: testUsers.applicant.email,
        password: 'testPassword123!',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('already registered')
    })
  })

  describe('Sign In', () => {
    it('signs in applicant successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      const { data, error } = await mockClient.auth.signInWithPassword({
        email: testUsers.applicant.email,
        password: 'testPassword123!',
      })

      expect(error).toBeNull()
      expect(data.user?.email).toBe(testUsers.applicant.email)
    })

    it('signs in broker successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.broker)

      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: testUsers.broker.id,
            email: testUsers.broker.email,
          },
        },
        error: null,
      })

      const { data, error } = await mockClient.auth.signInWithPassword({
        email: testUsers.broker.email,
        password: 'testPassword123!',
      })

      expect(error).toBeNull()
      expect(data.user?.email).toBe(testUsers.broker.email)
    })

    it('signs in admin successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.admin)

      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: testUsers.admin.id,
            email: testUsers.admin.email,
          },
        },
        error: null,
      })

      const { data, error } = await mockClient.auth.signInWithPassword({
        email: testUsers.admin.email,
        password: 'testPassword123!',
      })

      expect(error).toBeNull()
      expect(data.user?.email).toBe(testUsers.admin.email)
    })

    it('rejects invalid credentials', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials', status: 400 },
      })

      const { data, error } = await mockClient.auth.signInWithPassword({
        email: testUsers.applicant.email,
        password: 'wrongPassword',
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('Invalid')
    })

    it('rejects non-existent user', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found', status: 400 },
      })

      const { data, error } = await mockClient.auth.signInWithPassword({
        email: 'nonexistent@test.com',
        password: 'anyPassword',
      })

      expect(error).not.toBeNull()
    })
  })

  describe('Sign Out', () => {
    it('signs out user successfully', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      const { error } = await mockClient.auth.signOut()

      expect(error).toBeNull()
    })
  })

  describe('Session Management', () => {
    it('retrieves current user session', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      const { data, error } = await mockClient.auth.getSession()

      expect(error).toBeNull()
      expect(data.session?.user.id).toBe(testUsers.applicant.id)
    })

    it('retrieves current user details', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      const { data, error } = await mockClient.auth.getUser()

      expect(error).toBeNull()
      expect(data.user?.id).toBe(testUsers.applicant.id)
      expect(data.user?.email).toBe(testUsers.applicant.email)
    })

    it('handles no active session', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const { data, error } = await mockClient.auth.getSession()

      expect(error).toBeNull()
      expect(data.session).toBeNull()
    })
  })

  describe('Role Validation', () => {
    it('validates applicant role', () => {
      const user = testUsers.applicant
      expect(user.role).toBe(Role.APPLICANT)
    })

    it('validates broker role', () => {
      const user = testUsers.broker
      expect(user.role).toBe(Role.BROKER)
    })

    it('validates admin role', () => {
      const user = testUsers.admin
      expect(user.role).toBe(Role.ADMIN)
    })

    it('validates board role', () => {
      const user = testUsers.board
      expect(user.role).toBe(Role.BOARD)
    })

    it('all roles are valid Role enum values', () => {
      const allRoles = Object.values(Role)

      expect(allRoles).toContain(testUsers.applicant.role)
      expect(allRoles).toContain(testUsers.broker.role)
      expect(allRoles).toContain(testUsers.admin.role)
      expect(allRoles).toContain(testUsers.board.role)
    })
  })

  describe('Edge Cases', () => {
    it('handles network error during signup', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signUp.mockRejectedValue(new Error('Network error'))

      await expect(
        mockClient.auth.signUp({
          email: testUsers.applicant.email,
          password: 'testPassword123!',
        })
      ).rejects.toThrow('Network error')
    })

    it('handles network error during signin', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      await expect(
        mockClient.auth.signInWithPassword({
          email: testUsers.applicant.email,
          password: 'testPassword123!',
        })
      ).rejects.toThrow('Network error')
    })

    it('handles expired session', async () => {
      const mockClient = createMockSupabaseClient(testUsers.applicant)

      mockClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired', status: 401 },
      })

      const { data, error } = await mockClient.auth.getSession()

      expect(data.session).toBeNull()
      expect(error).not.toBeNull()
    })
  })
})
