#!/usr/bin/env tsx

/**
 * Verify User Profile Creation Trigger
 *
 * This script tests whether the automatic user profile creation trigger is installed and working.
 * It creates a test auth user and checks if a corresponding profile is created in the users table.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function main() {
  log('='.repeat(80), 'bright')
  log('USER PROFILE CREATION TRIGGER VERIFICATION', 'bright')
  log('='.repeat(80), 'bright')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  log('\n1. Creating test auth user...', 'cyan')
  log(`   Email: ${testEmail}`, 'cyan')

  try {
    // Create test user with metadata
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        role: 'APPLICANT',
      },
    })

    if (authError) {
      log(`✗ Failed to create test auth user: ${authError.message}`, 'red')
      process.exit(1)
    }

    if (!authData?.user) {
      log('✗ No user data returned', 'red')
      process.exit(1)
    }

    log(`✓ Test auth user created successfully`, 'green')
    log(`   User ID: ${authData.user.id}`, 'green')

    // Wait for trigger to execute
    log('\n2. Waiting 2 seconds for trigger to execute...', 'cyan')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Check if user profile was created
    log('\n3. Checking if user profile was created...', 'cyan')

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        log('✗ TRIGGER IS NOT WORKING - No profile was created!', 'red')
        log('\nThe user was created in auth.users but NOT in public.users', 'red')
        log('This means the trigger is either:', 'yellow')
        log('  1. Not installed in the database', 'yellow')
        log('  2. Failing silently due to permissions or errors', 'yellow')
        log('\nFIX: Run the SQL from DIAGNOSIS-AND-FIX-PLAN.md Step 1', 'yellow')

        // Cleanup
        log('\nCleaning up test user...', 'cyan')
        await supabase.auth.admin.deleteUser(authData.user.id)
        log('✓ Test user deleted', 'green')

        process.exit(1)
      }

      log(`✗ Error checking profile: ${profileError.message}`, 'red')
      process.exit(1)
    }

    if (!profile) {
      log('✗ TRIGGER IS NOT WORKING - No profile found!', 'red')

      // Cleanup
      log('\nCleaning up test user...', 'cyan')
      await supabase.auth.admin.deleteUser(authData.user.id)
      log('✓ Test user deleted', 'green')

      process.exit(1)
    }

    // Success!
    log('✓ TRIGGER IS WORKING!', 'green')
    log('\nUser Profile Details:', 'cyan')
    log(`  ID: ${profile.id}`, 'green')
    log(`  Role: ${profile.role}`, 'green')
    log(`  First Name: ${profile.first_name}`, 'green')
    log(`  Last Name: ${profile.last_name}`, 'green')
    log(`  Created At: ${profile.created_at}`, 'green')

    // Verify the data matches
    if (profile.first_name === 'Test' && profile.last_name === 'User' && profile.role === 'APPLICANT') {
      log('\n✓ Profile data matches metadata!', 'green')
    } else {
      log('\n⚠ Profile data does not match metadata', 'yellow')
      log('  This might indicate an issue with the trigger logic', 'yellow')
    }

    // Cleanup
    log('\n4. Cleaning up test user...', 'cyan')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)

    if (deleteError) {
      log(`⚠ Could not delete test user: ${deleteError.message}`, 'yellow')
      log(`  You may need to manually delete user ${authData.user.id}`, 'yellow')
    } else {
      log('✓ Test user deleted successfully', 'green')
    }

    // Final verdict
    log('\n' + '='.repeat(80), 'bright')
    log('RESULT: User profile creation trigger is WORKING CORRECTLY ✓', 'green')
    log('='.repeat(80), 'bright')

  } catch (error) {
    log(`\n✗ Unexpected error: ${error}`, 'red')
    console.error(error)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
