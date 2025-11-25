/**
 * User Data Access Layer
 *
 * Provides functions for managing user profiles and user-related data.
 *
 * NOTE: Email is denormalized from auth.users to the users table for performance.
 * The sync_user_email trigger keeps it in sync automatically.
 */

import { createClient } from '@/lib/supabase/server'
import type { User, Role } from '@/lib/types'
import type { Database } from '@/lib/database.types'

type DbRole = Database['public']['Enums']['role_enum']

/**
 * User profile type (extends base User with additional fields)
 */
export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

/**
 * Map database row to UserProfile
 */
function mapRowToProfile(row: {
  id: string
  email: string | null
  first_name: string
  last_name: string
  phone: string | null
  role: string
  created_at: string
  updated_at: string
}): UserProfile {
  return {
    id: row.id,
    email: row.email || '',
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone || undefined,
    role: row.role as Role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Get the current authenticated user
 *
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user profile from database (email is denormalized)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, created_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: user.id,
    name: `${profile.first_name} ${profile.last_name}`,
    // Use denormalized email, fallback to auth user email
    email: profile.email || user.email || '',
    role: profile.role as Role,
    createdAt: new Date(profile.created_at),
  }
}

/**
 * Get a user profile by ID
 *
 * @param userId - The user ID
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, role, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching user profile:', error)
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  // Email is now denormalized - no need to call auth.admin.getUserById
  return mapRowToProfile(data)
}

/**
 * Update a user profile
 *
 * @param userId - The user ID
 * @param data - Partial user profile data to update
 * @returns The updated user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>
): Promise<UserProfile> {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.firstName) updateData.first_name = data.firstName
  if (data.lastName) updateData.last_name = data.lastName
  if (data.phone !== undefined) updateData.phone = data.phone

  const { data: profile, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select('id, email, first_name, last_name, phone, role, created_at, updated_at')
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  // Email is now denormalized - no need to call auth.admin.getUserById
  return mapRowToProfile(profile)
}

/**
 * Search for users by name or email
 *
 * @param query - Search query (name or email)
 * @param role - Optional role filter
 * @returns Array of users matching the search criteria
 */
export async function searchUsers(
  query: string,
  role?: Role
): Promise<UserProfile[]> {
  const supabase = await createClient()

  // Email is now denormalized - we can search across all fields in a single query
  let dbQuery = supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, role, created_at, updated_at')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)

  if (role) {
    dbQuery = dbQuery.eq('role', role as unknown as DbRole)
  }

  const { data, error } = await dbQuery.limit(20)

  if (error) {
    console.error('Error searching users:', error)
    throw new Error(`Failed to search users: ${error.message}`)
  }

  // Email is now denormalized - no need for N+1 queries to auth.users
  return (data || []).map(mapRowToProfile)
}

/**
 * Get users by role
 *
 * @param role - The role to filter by
 * @returns Array of users with the specified role
 */
export async function getUsersByRole(role: Role): Promise<UserProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, role, created_at, updated_at')
    .eq('role', role as unknown as DbRole)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users by role:', error)
    throw new Error(`Failed to fetch users by role: ${error.message}`)
  }

  // Email is now denormalized - no need for N+1 queries to auth.users
  return (data || []).map(mapRowToProfile)
}
