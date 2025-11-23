/**
 * Verify Supabase Setup
 *
 * This script verifies that:
 * 1. Environment variables are set
 * 2. Supabase client can be initialized
 * 3. Basic connectivity works
 *
 * Run with: npx tsx scripts/verify-supabase-setup.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function verifySetup() {
  console.log('🔍 Verifying Supabase setup...\n')

  // Check environment variables
  console.log('1. Checking environment variables...')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const encryptionKey = process.env.ENCRYPTION_KEY

  if (!url) {
    console.error('   ❌ NEXT_PUBLIC_SUPABASE_URL is not set')
    process.exit(1)
  }
  console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL is set')

  if (!anonKey) {
    console.error('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    process.exit(1)
  }
  console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set')

  if (!serviceKey) {
    console.error('   ❌ SUPABASE_SERVICE_ROLE_KEY is not set')
    process.exit(1)
  }
  console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY is set')

  if (!encryptionKey) {
    console.error('   ❌ ENCRYPTION_KEY is not set')
    process.exit(1)
  }
  console.log('   ✅ ENCRYPTION_KEY is set')

  // Test client initialization
  console.log('\n2. Testing Supabase client initialization...')
  try {
    const supabase = createClient(url, anonKey)
    console.log('   ✅ Supabase client initialized successfully')

    // Test auth endpoint (doesn't require database)
    console.log('\n3. Testing auth connectivity...')
    const { error } = await supabase.auth.getSession()
    if (error && !error.message.includes('session_not_found')) {
      console.error('   ❌ Auth test failed:', error.message)
      process.exit(1)
    }
    console.log('   ✅ Auth connectivity works (no active session, as expected)')

    console.log('\n✨ All checks passed! Supabase is properly configured.')
    console.log('\nNext steps:')
    console.log('- The Supabase client utilities are ready to use')
    console.log('- Import from @/lib/supabase/client for browser components')
    console.log('- Import from @/lib/supabase/server for server components')
    console.log('- Database queries will work once authentication is implemented')
  } catch (error) {
    console.error('   ❌ Error testing Supabase client:', error)
    process.exit(1)
  }
}

verifySetup()
