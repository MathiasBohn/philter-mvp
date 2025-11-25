/**
 * Test Setup File
 *
 * This file sets up the testing environment with mocks for Supabase
 * and other external dependencies.
 */

import { vi, beforeEach, afterEach } from 'vitest'

// Global mocks for environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
vi.stubEnv('NODE_ENV', 'test')

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks()
})
