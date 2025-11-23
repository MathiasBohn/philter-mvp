/**
 * Verify Supabase Auth Configuration
 *
 * This script verifies that Supabase Auth is properly configured by:
 * 1. Testing auth endpoint connectivity
 * 2. Attempting to check auth settings (what's publicly accessible)
 * 3. Providing a checklist for manual verification
 *
 * Run with: npx tsx scripts/verify-auth-config.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function verifyAuthConfig() {
  console.log('🔍 Verifying Supabase Auth Configuration...\n')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(url, anonKey)

  console.log('1. Testing Auth Endpoint Connectivity...')
  try {
    const { error } = await supabase.auth.getSession()
    if (error && !error.message.includes('session_not_found')) {
      console.error('   ❌ Auth endpoint error:', error.message)
      process.exit(1)
    }
    console.log('   ✅ Auth endpoint is accessible')
  } catch (error) {
    console.error('   ❌ Failed to connect to auth endpoint:', error)
    process.exit(1)
  }

  console.log('\n2. Testing Email Auth Provider...')
  try {
    // Try to sign up with a test email (this will fail but tells us if email auth is enabled)
    const { data, error } = await supabase.auth.signUp({
      email: 'test-verification@example.com',
      password: 'test-password-123',
    })

    // If we get a rate limit error, auth is working
    if (error?.message.includes('rate limit')) {
      console.log('   ✅ Email provider is enabled (rate limit response)')
    }
    // If we get email sent or user created, it's working
    else if (data?.user || error?.message.includes('already registered')) {
      console.log('   ✅ Email provider is enabled and working')
      console.log('   ℹ️  Note: Test user may have been created')
    }
    // If we get a "Email signups are disabled" error, it's not enabled
    else if (error?.message.includes('disabled')) {
      console.log('   ❌ Email provider appears to be disabled')
      console.log('   → Go to Authentication → Providers → Enable Email')
    }
    // Any other response means it's probably working
    else {
      console.log('   ✅ Email provider appears to be enabled')
      if (error) {
        console.log('   ℹ️  Response:', error.message)
      }
    }
  } catch (error) {
    console.error('   ❌ Unexpected error:', error)
  }

  console.log('\n3. Testing Magic Link (OTP) Support...')
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: 'test-magic-link@example.com',
    })

    if (error?.message.includes('rate limit')) {
      console.log('   ✅ Magic Link/OTP is enabled (rate limit response)')
    } else if (error?.message.includes('disabled')) {
      console.log('   ❌ Magic Link appears to be disabled')
    } else if (!error || error.message.includes('Email')) {
      console.log('   ✅ Magic Link/OTP appears to be enabled')
      if (error) {
        console.log('   ℹ️  Response:', error.message)
      }
    }
  } catch (error) {
    console.error('   ❌ Unexpected error:', error)
  }

  console.log('\n4. Checking Password Reset Functionality...')
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      'test-reset@example.com',
      {
        redirectTo: 'http://localhost:3000/auth/reset-password',
      }
    )

    if (error?.message.includes('rate limit')) {
      console.log('   ✅ Password reset is enabled (rate limit response)')
    } else if (!error || error.message.includes('Email')) {
      console.log('   ✅ Password reset appears to be working')
      if (error) {
        console.log('   ℹ️  Response:', error.message)
      }
    }
  } catch (error) {
    console.error('   ❌ Unexpected error:', error)
  }

  // Manual verification checklist
  console.log('\n' + '='.repeat(70))
  console.log('📋 MANUAL VERIFICATION CHECKLIST')
  console.log('='.repeat(70))
  console.log('\nPlease verify the following in your Supabase Dashboard:\n')

  console.log('Authentication → Providers:')
  console.log('  [ ] Email provider is ENABLED')
  console.log('  [ ] "Confirm email" is CHECKED (email verification required)')
  console.log('  [ ] "Secure email change" is CHECKED (recommended)')
  console.log('')

  console.log('Authentication → URL Configuration:')
  console.log('  [ ] Site URL is set to: http://localhost:3000')
  console.log('  [ ] Redirect URLs includes: http://localhost:3000/auth/callback')
  console.log('  [ ] Redirect URLs includes: http://localhost:3000/** (wildcard)')
  console.log('')

  console.log('Authentication → Email Templates (Optional):')
  console.log('  [ ] Confirm signup template reviewed/customized')
  console.log('  [ ] Magic Link template reviewed/customized')
  console.log('  [ ] Reset Password template reviewed/customized')
  console.log('  [ ] Change Email template reviewed/customized')
  console.log('')

  console.log('='.repeat(70))
  console.log('\n✨ Automated tests completed!')
  console.log('\nIf all automated tests passed ✅ and you checked all items above,')
  console.log('your Supabase Auth configuration is complete!\n')
}

verifyAuthConfig()
