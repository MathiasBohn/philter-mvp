#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Reload Schema and Seed Buildings
 *
 * This script:
 * 1. Reloads the Supabase schema cache (fixes "column not found" errors)
 * 2. Seeds the database with sample buildings
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

// Sample buildings matching the actual schema
const sampleBuildings = [
  {
    name: 'The Dakota',
    building_type: 'COOP',
    address: {
      street: '1 West 72nd Street',
      city: 'New York',
      state: 'NY',
      zip: '10023',
    },
    policies: {
      pets_allowed: true,
      smoking_allowed: false,
      subletting_allowed: false,
      min_down_payment: 0.50,
    },
  },
  {
    name: '15 Central Park West',
    building_type: 'CONDO',
    address: {
      street: '15 Central Park West',
      city: 'New York',
      state: 'NY',
      zip: '10023',
    },
    policies: {
      pets_allowed: true,
      smoking_allowed: false,
      subletting_allowed: true,
      min_down_payment: 0.10,
    },
  },
  {
    name: 'Stuyvesant Town',
    building_type: 'RENTAL',
    address: {
      street: 'First Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10009',
    },
    policies: {
      pets_allowed: true,
      smoking_allowed: false,
      subletting_allowed: true,
    },
  },
  {
    name: '432 Park Avenue',
    building_type: 'CONDO',
    address: {
      street: '432 Park Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10022',
    },
    policies: {
      pets_allowed: false,
      smoking_allowed: false,
      subletting_allowed: true,
      min_down_payment: 0.20,
    },
  },
  {
    name: '740 Park Avenue',
    building_type: 'COOP',
    address: {
      street: '740 Park Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10021',
    },
    policies: {
      pets_allowed: false,
      smoking_allowed: false,
      subletting_allowed: false,
      min_down_payment: 1.0,
    },
  },
]

async function main() {
  log('='.repeat(80), 'bright')
  log('RELOAD SCHEMA AND SEED BUILDINGS', 'bright')
  log('='.repeat(80), 'bright')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Step 1: Reload schema cache
  log('\n1. Reloading Supabase schema cache...', 'cyan')
  log('   (This fixes "column not found in schema cache" errors)', 'cyan')

  try {
    // Send NOTIFY to reload schema
    const { error: reloadError } = await supabase.rpc('reload_schema', {})

    if (reloadError) {
      // If RPC doesn't exist, that's OK - we'll try the insert anyway
      log('   ⚠ reload_schema RPC not available (this is normal)', 'yellow')
      log('   Schema will reload automatically on first query', 'yellow')
    } else {
      log('   ✓ Schema cache reloaded', 'green')
    }
  } catch (err) {
    log('   ⚠ Could not reload schema (this is OK, will auto-reload)', 'yellow')
  }

  // Wait a moment for schema to settle
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Step 2: Check existing buildings
  log('\n2. Checking for existing buildings...', 'cyan')

  const { data: existing, error: checkError } = await supabase
    .from('buildings')
    .select('id, name')

  if (checkError) {
    log(`   ✗ Error checking buildings: ${checkError.message}`, 'red')
    log(`   Trying to proceed anyway...`, 'yellow')
  } else if (existing && existing.length > 0) {
    log(`   ⚠ Found ${existing.length} existing buildings:`, 'yellow')
    existing.forEach((b) => log(`     - ${b.name}`, 'yellow'))
    log('\n   Skipping seed. Delete existing buildings first if you want to re-seed.', 'yellow')
    return
  } else {
    log('   ✓ No existing buildings found', 'green')
  }

  // Step 3: Insert buildings one by one (to get better error messages)
  log('\n3. Inserting sample buildings...', 'cyan')

  let successCount = 0
  let failCount = 0

  for (const building of sampleBuildings) {
    const { data, error } = await supabase
      .from('buildings')
      .insert(building)
      .select()
      .single()

    if (error) {
      log(`   ✗ Failed to insert ${building.name}: ${error.message}`, 'red')
      failCount++
    } else {
      log(`   ✓ Inserted ${building.name}`, 'green')
      successCount++
    }
  }

  // Step 4: Verify
  log('\n4. Verifying buildings...', 'cyan')

  const { data: verify, error: verifyError, count } = await supabase
    .from('buildings')
    .select('*', { count: 'exact' })

  if (verifyError) {
    log(`   ⚠ Error verifying: ${verifyError.message}`, 'yellow')
  } else {
    log(`   ✓ Database now has ${count} buildings`, 'green')
  }

  // Summary
  log('\n' + '='.repeat(80), 'bright')
  if (failCount === 0 && successCount > 0) {
    log('SUCCESS: All buildings seeded! ✓', 'green')
  } else if (successCount > 0) {
    log(`PARTIAL SUCCESS: ${successCount} succeeded, ${failCount} failed`, 'yellow')
  } else {
    log('FAILED: No buildings were inserted', 'red')
  }
  log('='.repeat(80), 'bright')

  if (successCount > 0) {
    log('\nNext steps:', 'cyan')
    log('  1. Start dev server: npm run dev', 'cyan')
    log('  2. Sign in to your account', 'cyan')
    log('  3. Try creating a new application', 'cyan')
    log('  4. Building dropdown should now be populated', 'cyan')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
