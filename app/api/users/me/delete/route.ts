/**
 * Delete User Account API Route
 *
 * DELETE /api/users/me/delete - Delete the current user's account
 *
 * This endpoint:
 * 1. Deletes all user's applications (and their documents from storage)
 * 2. Deletes user's profile photos from storage
 * 3. Soft deletes user record in database
 * 4. Deletes user from Supabase Auth
 *
 * Rate limited to prevent abuse (3 requests per minute).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { deleteApplication } from '@/lib/api/applications'
import { withRateLimit, RATE_LIMITS } from '@/lib/api/rate-limit'

export const DELETE = withRateLimit(RATE_LIMITS.strict, async (_request: NextRequest) => {
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

    const userId = user.id

    // Step 1: Get all applications owned by this user
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id')
      .eq('created_by', userId)
      .is('deleted_at', null)

    if (appsError) {
      console.error('Error fetching user applications:', appsError)
      // Continue with deletion even if this fails
    }

    // Step 2: Delete all applications (this also deletes their documents)
    if (applications && applications.length > 0) {
      for (const app of applications) {
        try {
          await deleteApplication(app.id)
        } catch (error) {
          console.error(`Error deleting application ${app.id}:`, error)
          // Continue with other deletions
        }
      }
    }

    // Step 3: Delete profile photos from storage
    try {
      const { data: profilePhotos } = await supabase.storage
        .from('profile-photos')
        .list(userId)

      if (profilePhotos && profilePhotos.length > 0) {
        const photoPaths = profilePhotos.map(photo => `${userId}/${photo.name}`)
        await supabase.storage.from('profile-photos').remove(photoPaths)
      }
    } catch (error) {
      console.error('Error deleting profile photos:', error)
      // Continue with deletion
    }

    // Step 4: Soft delete user record in database
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        email: `deleted_${userId}@deleted.local`, // Anonymize email
        first_name: 'Deleted',
        last_name: 'User',
        phone: null,
      })
      .eq('id', userId)

    if (userUpdateError) {
      console.error('Error soft deleting user record:', userUpdateError)
      // Continue to delete auth user
    }

    // Step 5: Delete from Supabase Auth using admin client
    const adminClient = createAdminClient()
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    // Sign out the user (their session is now invalid anyway)
    await supabase.auth.signOut()

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/users/me/delete:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete account',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
