/**
 * User Search API Route
 *
 * GET /api/users/search - Search for users by name or email
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchUsers } from '@/lib/api/users'
import { Role } from '@/lib/types'

/**
 * GET /api/users/search
 * Search for users by name or email
 * Query params:
 *  - q: search query (required)
 *  - role: filter by role (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search params
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const roleParam = searchParams.get('role')

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Validate role parameter if provided
    let role: Role | undefined
    if (roleParam) {
      // Check if role is valid
      const validRoles = Object.values(Role)
      if (!validRoles.includes(roleParam as Role)) {
        return NextResponse.json(
          { error: 'Invalid role parameter' },
          { status: 400 }
        )
      }
      role = roleParam as Role
    }

    // Search users
    const users = await searchUsers(query.trim(), role)

    return NextResponse.json({ users, count: users.length }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/users/search:', error)
    return NextResponse.json(
      {
        error: 'Failed to search users',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
