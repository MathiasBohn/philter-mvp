#!/usr/bin/env tsx

/**
 * Seed Buildings Script
 *
 * This script seeds the database with sample buildings so users can create applications.
 * This is a quick alternative to running the full migration 006.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
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
      pied_a_terre_allowed: false,
      financing_allowed: true,
      min_down_payment: 0.50,
      flip_tax: 0.02,
      monthly_maintenance_per_share: 1.25,
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
      pied_a_terre_allowed: true,
      financing_allowed: true,
      min_down_payment: 0.10,
      transfer_tax: 0.01,
      common_charges_per_sqft: 1.50,
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
      security_deposit_months: 1,
      broker_fee_months: 0,
      guarantor_required: true,
      income_requirement_multiple: 40,
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
      pied_a_terre_allowed: true,
      financing_allowed: true,
      min_down_payment: 0.20,
      transfer_tax: 0.015,
      common_charges_per_sqft: 2.00,
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
      pied_a_terre_allowed: false,
      financing_allowed: false,
      min_down_payment: 1.0, // All cash required
      flip_tax: 0.03,
      monthly_maintenance_per_share: 1.50,
    },
  },
]

async function main() {
  log('='.repeat(80), 'bright')
  log('SEED BUILDINGS', 'bright')
  log('='.repeat(80), 'bright')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Check if buildings already exist
  log('\n1. Checking for existing buildings...', 'cyan')

  const { data: existing, error: checkError } = await supabase
    .from('buildings')
    .select('id, name')

  if (checkError) {
    log(`✗ Error checking buildings: ${checkError.message}`, 'red')
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    log(`⚠ Found ${existing.length} existing buildings:`, 'yellow')
    existing.forEach((b) => log(`  - ${b.name}`, 'yellow'))
    log('\nDo you want to:', 'yellow')
    log('  1. Skip seeding (keep existing buildings)', 'yellow')
    log('  2. Add new buildings anyway (may create duplicates)', 'yellow')
    log('  3. Delete existing and re-seed', 'yellow')
    log('\nFor now, skipping. Re-run with --force to override.', 'yellow')
    return
  }

  log('✓ No existing buildings found', 'green')

  // Insert buildings
  log('\n2. Inserting sample buildings...', 'cyan')

  const { data, error } = await supabase.from('buildings').insert(sampleBuildings).select()

  if (error) {
    log(`✗ Error inserting buildings: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    log('✗ No buildings were inserted', 'red')
    process.exit(1)
  }

  log(`✓ Successfully inserted ${data.length} buildings:`, 'green')
  data.forEach((building: Record<string, unknown>) => {
    log(`  - ${building.name} (${building.building_type})`, 'green')
  })

  // Verify
  log('\n3. Verifying buildings...', 'cyan')

  const { data: verify, error: verifyError, count } = await supabase
    .from('buildings')
    .select('*', { count: 'exact' })

  if (verifyError) {
    log(`⚠ Error verifying: ${verifyError.message}`, 'yellow')
  } else {
    log(`✓ Database now has ${count} buildings`, 'green')
  }

  // Success
  log('\n' + '='.repeat(80), 'bright')
  log('SUCCESS: Buildings seeded successfully! ✓', 'green')
  log('='.repeat(80), 'bright')
  log('\nNext steps:', 'cyan')
  log('  1. Test application creation in the UI', 'cyan')
  log('  2. Building dropdown should now be populated', 'cyan')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
