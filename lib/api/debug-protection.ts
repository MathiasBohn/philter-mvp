/**
 * Debug Endpoint Protection Utility
 *
 * SECURITY: Debug endpoints are completely disabled in production.
 * They return 404 to avoid revealing their existence.
 *
 * In development, authenticated users can access debug endpoints.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface DebugProtectionResult {
  allowed: boolean
  response?: NextResponse
  user?: {
    id: string
    email: string | undefined
  }
  profile?: {
    role: string
    firstName: string
    lastName: string
  }
}

/**
 * Check if the current user is allowed to access debug endpoints.
 *
 * SECURITY:
 * - In production: Always returns 404 (endpoints don't exist in production)
 * - In development: Authenticated users can access
 *
 * @returns Object containing allowed status, optional error response, and user info
 */
export async function checkDebugAccess(): Promise<DebugProtectionResult> {
  // CRITICAL SECURITY: Completely disable debug endpoints in production
  // Return 404 to avoid revealing endpoint existence
  if (process.env.NODE_ENV === 'production') {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      ),
    }
  }

  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    }
  }

  // In development, allow all authenticated users
  return {
    allowed: true,
    user: { id: user.id, email: user.email },
  }
}

/**
 * Helper to wrap debug endpoint handlers with access protection.
 * Use this as an early return pattern in debug API routes.
 *
 * @example
 * export async function GET() {
 *   const access = await checkDebugAccess()
 *   if (!access.allowed) return access.response
 *   // ... rest of handler
 * }
 */
