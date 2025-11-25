/**
 * Supabase Mock Utilities
 *
 * Provides mock implementations for Supabase client and operations
 * for testing purposes.
 */

import { vi } from 'vitest'
import { Role, ApplicationStatus, TransactionType } from '@/lib/types'

// Test user data for different roles
export const testUsers = {
  applicant: {
    id: 'applicant-user-id',
    email: 'applicant@test.com',
    name: 'Test Applicant',
    role: Role.APPLICANT,
  },
  broker: {
    id: 'broker-user-id',
    email: 'broker@test.com',
    name: 'Test Broker',
    role: Role.BROKER,
  },
  admin: {
    id: 'admin-user-id',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: Role.ADMIN,
  },
  board: {
    id: 'board-user-id',
    email: 'board@test.com',
    name: 'Test Board',
    role: Role.BOARD,
  },
  randomUser: {
    id: 'random-user-id',
    email: 'random@test.com',
    name: 'Random User',
    role: Role.APPLICANT,
  },
}

// Test building data
export const testBuilding = {
  id: 'building-id-1',
  name: 'Test Building',
  code: 'TST001',
  type: 'COOP',
  street: '123 Test Street',
  city: 'New York',
  state: 'NY',
  zip: '10001',
}

// Test application data
export const testApplications = {
  applicantOwned: {
    id: 'app-id-1',
    building_id: testBuilding.id,
    unit: '5A',
    transaction_type: TransactionType.COOP_PURCHASE,
    status: ApplicationStatus.IN_PROGRESS,
    created_by: testUsers.applicant.id,
    broker_owned: false,
    primary_applicant_email: null,
    primary_applicant_id: null,
    completion_percentage: 50,
    is_locked: false,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  brokerOwned: {
    id: 'app-id-2',
    building_id: testBuilding.id,
    unit: '3B',
    transaction_type: TransactionType.COOP_PURCHASE,
    status: ApplicationStatus.IN_PROGRESS,
    created_by: testUsers.broker.id,
    broker_owned: true,
    primary_applicant_email: 'invited.applicant@test.com',
    primary_applicant_id: null,
    completion_percentage: 30,
    is_locked: false,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  submitted: {
    id: 'app-id-3',
    building_id: testBuilding.id,
    unit: '10C',
    transaction_type: TransactionType.CONDO_PURCHASE,
    status: ApplicationStatus.SUBMITTED,
    created_by: testUsers.applicant.id,
    broker_owned: false,
    primary_applicant_email: null,
    primary_applicant_id: null,
    completion_percentage: 100,
    is_locked: true,
    submitted_at: new Date().toISOString(),
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
}

// Test document data
export const testDocuments = {
  applicantDocument: {
    id: 'doc-id-1',
    application_id: testApplications.applicantOwned.id,
    category: 'BANK_STATEMENT',
    filename: 'bank-statement.pdf',
    size: 1024000,
    mime_type: 'application/pdf',
    storage_path: `${testUsers.applicant.id}/${testApplications.applicantOwned.id}/doc-id-1`,
    uploaded_by: testUsers.applicant.id,
    status: 'UPLOADED',
    created_at: new Date().toISOString(),
  },
  brokerDocument: {
    id: 'doc-id-2',
    application_id: testApplications.brokerOwned.id,
    category: 'TAX_RETURN',
    filename: 'tax-return.pdf',
    size: 2048000,
    mime_type: 'application/pdf',
    storage_path: `${testUsers.broker.id}/${testApplications.brokerOwned.id}/doc-id-2`,
    uploaded_by: testUsers.broker.id,
    status: 'UPLOADED',
    created_at: new Date().toISOString(),
  },
}

// Create a mock Supabase client
export function createMockSupabaseClient(currentUser = testUsers.applicant) {
  // Default resolved value for query builder
  const defaultQueryResult: { data: unknown; error: unknown } = { data: [], error: null }
  let thenResult: { data: unknown; error: unknown } = defaultQueryResult

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockQueryBuilder: Record<string, any> = {}

  // Create chainable mock that supports both .then() and .single() patterns
  mockQueryBuilder.select = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.insert = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.update = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.upsert = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.delete = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.eq = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.neq = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.is = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.in = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.order = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.limit = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.range = vi.fn().mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.single = vi.fn().mockResolvedValue(defaultQueryResult)

  // Make the query builder thenable for async/await
  mockQueryBuilder.then = vi.fn((resolve, reject) => {
    return Promise.resolve(thenResult).then(resolve, reject)
  })

  // Helper to set what .then() will resolve to
  mockQueryBuilder._setThenResult = (result: { data: unknown; error: unknown }) => {
    thenResult = result
  }

  const mockStorageFileApi = {
    upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
    download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    createSignedUrl: vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://test.supabase.co/storage/v1/test-signed-url' },
      error: null,
    }),
    list: vi.fn().mockResolvedValue({ data: [], error: null }),
  }

  const mockStorage = {
    from: vi.fn().mockReturnValue(mockStorageFileApi),
  }

  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: currentUser.id, email: currentUser.email } },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: currentUser.id, email: currentUser.email } } },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: currentUser.id, email: currentUser.email } },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: currentUser.id, email: currentUser.email } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  }

  const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null })

  return {
    from: vi.fn().mockReturnValue(mockQueryBuilder),
    storage: mockStorage,
    auth: mockAuth,
    rpc: mockRpc,
    _mockQueryBuilder: mockQueryBuilder,
    _mockStorageFileApi: mockStorageFileApi,
  }
}

// Helper to simulate RLS policy behavior
export function simulateRLSPolicy(
  userRole: Role,
  userId: string,
  applicationCreatedBy: string,
  applicationBrokerOwned: boolean
): { canRead: boolean; canUpdate: boolean; canDelete: boolean } {
  // Simulate RLS policies based on role
  switch (userRole) {
    case Role.ADMIN:
      // Admins can read all, update status only, cannot delete
      return { canRead: true, canUpdate: true, canDelete: false }

    case Role.BOARD:
      // Board can read assigned applications, cannot update or delete
      return { canRead: true, canUpdate: false, canDelete: false }

    case Role.BROKER:
      // Brokers can read/update/delete their own broker-owned applications
      if (applicationBrokerOwned && applicationCreatedBy === userId) {
        return { canRead: true, canUpdate: true, canDelete: true }
      }
      // Brokers can also participate in applications they're invited to
      return { canRead: false, canUpdate: false, canDelete: false }

    case Role.APPLICANT:
      // Applicants can read/update/delete their own applications
      if (applicationCreatedBy === userId && !applicationBrokerOwned) {
        return { canRead: true, canUpdate: true, canDelete: true }
      }
      return { canRead: false, canUpdate: false, canDelete: false }

    default:
      return { canRead: false, canUpdate: false, canDelete: false }
  }
}

// Helper to simulate storage RLS policy behavior
export function simulateStorageRLSPolicy(
  userId: string,
  userRole: Role,
  storagePath: string,
  operation: 'upload' | 'download' | 'delete'
): boolean {
  // Security: Reject path traversal attempts
  if (storagePath.includes('..')) {
    return false
  }

  // Security: Reject empty paths
  if (!storagePath || storagePath.trim() === '') {
    return false
  }

  // Extract the folder owner from the storage path
  const pathParts = storagePath.split('/')
  const folderOwnerId = pathParts[0]

  // Security: First path segment must be a valid user ID format
  if (!folderOwnerId || folderOwnerId.length < 5) {
    return false
  }

  switch (operation) {
    case 'upload':
      // Users can only upload to their own folder
      return folderOwnerId === userId

    case 'download':
      // Users can download from their own folder
      if (folderOwnerId === userId) return true
      // Admins and Board can download any document
      if (userRole === Role.ADMIN || userRole === Role.BOARD) return true
      // Participants can download (simplified - would check application_participants)
      return false

    case 'delete':
      // Users can only delete from their own folder
      return folderOwnerId === userId

    default:
      return false
  }
}
