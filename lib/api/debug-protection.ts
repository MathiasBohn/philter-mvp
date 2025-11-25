/**
 * Debug Endpoint Protection Utility
 *
 * Restricts access to debug endpoints in production to ADMIN users only.
 * In development, all authenticated users can access debug endpoints.
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
 * - In development: Any authenticated user can access
 * - In production: Only ADMIN users can access
 *
 * @returns Object containing allowed status, optional error response, and user info
 */
export async function checkDebugAccess(): Promise<DebugProtectionResult> {
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
  if (process.env.NODE_ENV !== 'production') {
    return {
      allowed: true,
      user: { id: user.id, email: user.email },
    }
  }

  // In production, check if user is ADMIN
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'User profile not found' },
        { status: 403 }
      ),
    }
  }

  if (profile.role !== 'ADMIN') {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Debug endpoints are restricted to administrators in production',
        },
        { status: 403 }
      ),
    }
  }

  return {
    allowed: true,
    user: { id: user.id, email: user.email },
    profile: {
      role: profile.role,
      firstName: profile.first_name,
      lastName: profile.last_name,
    },
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
