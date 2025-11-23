/**
 * User Data Access Layer
 *
 * Provides functions for managing user profiles and user-related data.
 */

import { createClient } from '@/lib/supabase/server'
import type { User, Role } from '@/lib/types'

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

  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: user.id,
    name: `${profile.first_name} ${profile.last_name}`,
    email: user.email || '',
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
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching user profile:', error)
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  // Get email from auth.users
  const { data: { user } } = await supabase.auth.admin.getUserById(userId)

  return {
    id: data.id,
    email: user?.email || '',
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone,
    role: data.role as Role,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
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
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  // Get email from auth.users
  const { data: { user } } = await supabase.auth.admin.getUserById(userId)

  return {
    id: profile.id,
    email: user?.email || '',
    firstName: profile.first_name,
    lastName: profile.last_name,
    phone: profile.phone,
    role: profile.role as Role,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  }
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

  let dbQuery = supabase
    .from('users')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)

  if (role) {
    dbQuery = dbQuery.eq('role', role)
  }

  const { data, error } = await dbQuery.limit(20)

  if (error) {
    console.error('Error searching users:', error)
    throw new Error(`Failed to search users: ${error.message}`)
  }

  // For each user, get their email from auth.users
  // Note: This is not optimal for large result sets. Consider caching or denormalizing email.
  const usersWithEmail = await Promise.all(
    (data || []).map(async (profile) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      return {
        id: profile.id,
        email: user?.email || '',
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        role: profile.role as Role,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      }
    })
  )

  return usersWithEmail
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
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users by role:', error)
    throw new Error(`Failed to fetch users by role: ${error.message}`)
  }

  // For each user, get their email from auth.users
  const usersWithEmail = await Promise.all(
    (data || []).map(async (profile) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      return {
        id: profile.id,
        email: user?.email || '',
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        role: profile.role as Role,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      }
    })
  )

  return usersWithEmail
}
