#!/usr/bin/env tsx

/**
 * Check RLS Policies Script
 *
 * This script directly queries PostgreSQL system catalogs to check:
 * - Which tables have RLS enabled
 * - What policies exist
 * - Policy definitions
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
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  log('='.repeat(80), 'bright')
  log('RLS POLICIES CHECK', 'bright')
  log('='.repeat(80), 'bright')

  // Check RLS enabled status using raw SQL
  log('\n1. Checking RLS enabled status:', 'cyan')

  const rlsQuery = `
    SELECT
      schemaname,
      tablename,
      rowsecurity as rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: rlsQuery })

    if (error) {
      // Try alternative approach - direct query if RPC not available
      log('  ⚠ exec_sql RPC not available, will use alternative method', 'yellow')

      // Alternative: We'll just try to query a table to see if RLS is working
      const testTables = ['users', 'applications', 'documents']

      for (const table of testTables) {
        log(`\n  Checking ${table}:`, 'cyan')
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (tableError) {
          log(`    ✗ Error: ${tableError.message}`, 'red')
        } else {
          log(`    ✓ Table accessible`, 'green')
        }
      }
    } else {
      log(JSON.stringify(data, null, 2), 'blue')
    }
  } catch (err) {
    log(`  ✗ Error: ${err}`, 'red')
  }

  // Check policies
  log('\n2. Checking RLS policies:', 'cyan')

  const policiesQuery = `
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual as using_expression,
      with_check as with_check_expression
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: policiesQuery })

    if (error) {
      log(`  ⚠ Could not query policies: ${error.message}`, 'yellow')
      log('  This might be because the exec_sql RPC function doesn\'t exist', 'yellow')
    } else if (data && data.length > 0) {
      log(`  ✓ Found ${data.length} policies`, 'green')
      data.forEach((policy: Record<string, unknown>) => {
        log(`\n  Table: ${policy.tablename}`, 'bright')
        log(`  Policy: ${policy.policyname}`, 'cyan')
        log(`  Command: ${policy.cmd}`, 'blue')
        log(`  Roles: ${policy.roles}`, 'blue')
      })
    } else {
      log('  ⚠ No policies found!', 'yellow')
    }
  } catch (err) {
    log(`  ✗ Error: ${err}`, 'red')
  }

  // Try to test specific RLS behavior
  log('\n3. Testing RLS behavior with unauthenticated user:', 'cyan')

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const anonClient = createClient(SUPABASE_URL, anonKey)

  const testTables = ['users', 'applications', 'buildings']

  for (const table of testTables) {
    log(`\n  Testing ${table}:`, 'cyan')

    const { data, error } = await anonClient.from(table).select('*').limit(1)

    if (error) {
      log(`    ✗ Error (expected if RLS is working): ${error.message}`, 'green')
    } else if (!data || data.length === 0) {
      log(`    ✓ Empty result (RLS may be working, or table is empty)`, 'green')
    } else {
      log(`    ⚠ Got data without authentication! RLS may not be working properly.`, 'yellow')
      log(`    Data: ${JSON.stringify(data)}`, 'yellow')
    }
  }

  log('\n' + '='.repeat(80), 'bright')
  log('Done!', 'bright')
  log('='.repeat(80), 'bright')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
