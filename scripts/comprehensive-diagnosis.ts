#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Comprehensive Diagnosis Script
 *
 * This script performs a thorough check of the entire Supabase setup including:
 * - Database connection
 * - Schema existence (tables, enums, functions, triggers)
 * - RLS policies
 * - User table and profile system
 * - Sample data queries
 * - Authentication functionality
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Colors for terminal output
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

function section(title: string) {
  console.log('\n' + '='.repeat(80))
  log(title, 'bright')
  console.log('='.repeat(80))
}

async function main() {
  section('🔍 COMPREHENSIVE SUPABASE DIAGNOSIS')

  // Check environment variables
  section('1. Environment Variables Check')
  log('✓ Checking environment variables...', 'cyan')

  if (!SUPABASE_URL) {
    log('✗ NEXT_PUBLIC_SUPABASE_URL is not set!', 'red')
    process.exit(1)
  } else {
    log(`✓ NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}`, 'green')
  }

  if (!SUPABASE_SERVICE_KEY) {
    log('✗ SUPABASE_SERVICE_ROLE_KEY is not set!', 'red')
    process.exit(1)
  } else {
    log('✓ SUPABASE_SERVICE_ROLE_KEY: [REDACTED]', 'green')
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) {
    log('✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!', 'red')
    process.exit(1)
  } else {
    log('✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: [REDACTED]', 'green')
  }

  const encryptionKey = process.env.ENCRYPTION_KEY
  if (!encryptionKey) {
    log('⚠ ENCRYPTION_KEY is not set!', 'yellow')
  } else {
    log('✓ ENCRYPTION_KEY: [REDACTED]', 'green')
  }

  // Create Supabase client with service role
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Test database connection
  section('2. Database Connection Test')
  log('✓ Testing database connection...', 'cyan')

  try {
    const { error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      log(`✗ Connection test failed: ${error.message}`, 'red')
      console.log('Error details:', error)
    } else {
      log('✓ Database connection successful!', 'green')
    }
  } catch (err) {
    log(`✗ Connection test failed: ${err}`, 'red')
  }

  // Check tables exist
  section('3. Database Schema Check')
  log('✓ Checking if tables exist...', 'cyan')

  const expectedTables = [
    'users',
    'buildings',
    'templates',
    'applications',
    'application_participants',
    'application_invitations',
    'people',
    'address_history',
    'emergency_contacts',
    'employment_records',
    'financial_entries',
    'real_estate_properties',
    'disclosures',
    'documents',
    'rfis',
    'rfi_messages',
    'board_notes',
    'board_assignments',
    'decision_records',
    'activity_log',
  ]

  for (const tableName of expectedTables) {
    try {
      const { error } = await supabase.from(tableName).select('count').limit(1)
      if (error) {
        log(`  ✗ Table '${tableName}': NOT FOUND or NO ACCESS (${error.message})`, 'red')
      } else {
        log(`  ✓ Table '${tableName}': OK`, 'green')
      }
    } catch (err) {
      log(`  ✗ Table '${tableName}': ERROR - ${err}`, 'red')
    }
  }

  // Check enum types
  section('4. Enum Types Check')
  log('✓ Checking enum types...', 'cyan')

  try {
    const { data: enumsData, error: enumsError } = await supabase.rpc('get_enum_types')

    if (enumsError) {
      log('⚠ Could not query enum types (function may not exist)', 'yellow')
      log('  This is expected - we will query pg_catalog instead', 'yellow')

      // Query pg_catalog directly (this will work with service role)
      const { data: pgEnums, error: pgError } = await supabase
        .from('pg_type')
        .select('typname')
        .eq('typtype', 'e')
        .order('typname')

      if (pgError) {
        log(`✗ Could not query pg_catalog: ${pgError.message}`, 'red')
      } else {
        log(`✓ Found ${pgEnums?.length || 0} enum types`, 'green')
        if (pgEnums && pgEnums.length > 0) {
          pgEnums.forEach((e: { typname: string }) => {
            log(`  - ${e.typname}`, 'blue')
          })
        }
      }
    } else {
      log(`✓ Found enum types via RPC`, 'green')
      console.log(enumsData)
    }
  } catch (err) {
    log(`⚠ Enum check skipped: ${err}`, 'yellow')
  }

  // Check RLS is enabled
  section('5. Row Level Security (RLS) Check')
  log('✓ Checking RLS status...', 'cyan')

  for (const tableName of ['users', 'applications', 'documents', 'rfis']) {
    try {
      // Query pg_catalog to check RLS status
      const { data, error } = await supabase
        .rpc('check_rls_enabled', { table_name: tableName })

      if (error) {
        log(`  ⚠ Could not check RLS for '${tableName}': ${error.message}`, 'yellow')
      } else {
        if (data) {
          log(`  ✓ RLS enabled on '${tableName}'`, 'green')
        } else {
          log(`  ✗ RLS NOT enabled on '${tableName}'`, 'red')
        }
      }
    } catch (err) {
      log(`  ⚠ RLS check skipped for '${tableName}': ${err}`, 'yellow')
    }
  }

  // Check RLS policies
  section('6. RLS Policies Check')
  log('✓ Checking RLS policies...', 'cyan')

  try {
    // Query pg_policies to get policy information
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'applications' })

    if (policiesError) {
      log(`⚠ Could not query policies (RPC may not exist): ${policiesError.message}`, 'yellow')
      log('  This is normal if the RPC function is not created yet', 'yellow')
    } else {
      log(`✓ Found ${policies?.length || 0} policies on 'applications' table`, 'green')
      if (policies && policies.length > 0) {
        policies.forEach((p: { policyname: string; cmd: string }) => {
          log(`  - ${p.policyname} (${p.cmd})`, 'blue')
        })
      }
    }
  } catch (err) {
    log(`⚠ Policy check skipped: ${err}`, 'yellow')
  }

  // Check users table structure
  section('7. Users Table Structure')
  log('✓ Checking users table columns...', 'cyan')

  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      log(`✗ Error querying users table: ${usersError.message}`, 'red')
    } else {
      if (users && users.length > 0) {
        log('✓ Users table structure:', 'green')
        const columns = Object.keys(users[0])
        columns.forEach(col => log(`  - ${col}`, 'blue'))
      } else {
        log('✓ Users table exists but is empty', 'yellow')
        log('  Expected columns: id, role, first_name, last_name, phone, created_at, updated_at', 'blue')
      }
    }
  } catch (err) {
    log(`✗ Error: ${err}`, 'red')
  }

  // Check existing users
  section('8. Existing Users Check')
  log('✓ Checking for existing users...', 'cyan')

  try {
    const { data: users, error: usersError, count } = await supabase
      .from('users')
      .select('id, role, first_name, last_name', { count: 'exact' })
      .limit(10)

    if (usersError) {
      log(`✗ Error querying users: ${usersError.message}`, 'red')
    } else {
      log(`✓ Found ${count} users in database`, count === 0 ? 'yellow' : 'green')
      if (users && users.length > 0) {
        users.forEach((u: { id: string; role: string; first_name: string; last_name: string }) => {
          log(`  - ${u.first_name} ${u.last_name} (${u.role}) [${u.id}]`, 'blue')
        })
      } else {
        log('  No users found. You may need to create a user account.', 'yellow')
      }
    }
  } catch (err) {
    log(`✗ Error: ${err}`, 'red')
  }

  // Check auth.users table
  section('9. Auth Users Check (Supabase Auth)')
  log('✓ Checking Supabase auth.users...', 'cyan')

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      log(`✗ Error querying auth users: ${authError.message}`, 'red')
    } else {
      const authUsers = authData.users
      log(`✓ Found ${authUsers.length} auth users`, authUsers.length === 0 ? 'yellow' : 'green')

      if (authUsers.length > 0) {
        authUsers.forEach((u) => {
          log(`  - ${u.email} [${u.id}] (confirmed: ${u.email_confirmed_at ? 'yes' : 'no'})`, 'blue')

          // Check if this auth user has a corresponding profile
          const hasProfile = authUsers.some(async (authUser) => {
            const { data } = await supabase
              .from('users')
              .select('id')
              .eq('id', authUser.id)
              .single()
            return !!data
          })
        })
      } else {
        log('  No auth users found. You need to sign up first.', 'yellow')
      }
    }
  } catch (err) {
    log(`✗ Error: ${err}`, 'red')
  }

  // Check applications
  section('10. Applications Check')
  log('✓ Checking applications table...', 'cyan')

  try {
    const { data: apps, error: appsError, count } = await supabase
      .from('applications')
      .select('id, status, transaction_type, unit, created_by', { count: 'exact' })
      .limit(10)

    if (appsError) {
      log(`✗ Error querying applications: ${appsError.message}`, 'red')
    } else {
      log(`✓ Found ${count} applications`, count === 0 ? 'yellow' : 'green')
      if (apps && apps.length > 0) {
        apps.forEach((a: Record<string, unknown>) => {
          log(`  - Application ${a.id}: ${a.status} (${a.transaction_type}) Unit: ${a.unit || 'N/A'}`, 'blue')
        })
      } else {
        log('  No applications found.', 'yellow')
      }
    }
  } catch (err) {
    log(`✗ Error: ${err}`, 'red')
  }

  // Check buildings
  section('11. Buildings Check')
  log('✓ Checking buildings table...', 'cyan')

  try {
    const { data: buildings, error: buildingsError, count } = await supabase
      .from('buildings')
      .select('id, name', { count: 'exact' })
      .limit(10)

    if (buildingsError) {
      log(`✗ Error querying buildings: ${buildingsError.message}`, 'red')
    } else {
      log(`✓ Found ${count} buildings`, count === 0 ? 'yellow' : 'green')
      if (buildings && buildings.length > 0) {
        buildings.forEach((b: Record<string, unknown>) => {
          log(`  - ${b.name} [${b.id}]`, 'blue')
        })
      } else {
        log('  No buildings found. Seed data may not be loaded.', 'yellow')
      }
    }
  } catch (err) {
    log(`✗ Error: ${err}`, 'red')
  }

  // Check migrations table
  section('12. Migrations Check')
  log('✓ Checking applied migrations...', 'cyan')

  try {
    const { data: migrations, error: migrationsError } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version')

    if (migrationsError) {
      log(`⚠ Could not query migrations table: ${migrationsError.message}`, 'yellow')
      log('  This table may not exist if you haven\'t used Supabase migrations', 'yellow')
    } else {
      if (migrations && migrations.length > 0) {
        log(`✓ Found ${migrations.length} applied migrations:`, 'green')
        migrations.forEach((m: { version: string }) => {
          log(`  - ${m.version}`, 'blue')
        })
      } else {
        log('  No migrations found in schema_migrations table', 'yellow')
      }
    }
  } catch (err) {
    log(`⚠ Migrations check skipped: ${err}`, 'yellow')
  }

  // Test authentication flow
  section('13. Authentication Test')
  log('✓ Testing authentication with anon key...', 'cyan')

  const anonClient = createClient(SUPABASE_URL, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    const { data: { user }, error: authError } = await anonClient.auth.getUser()

    if (authError) {
      log(`✓ Not authenticated (expected): ${authError.message}`, 'green')
    } else if (!user) {
      log('✓ Not authenticated (expected)', 'green')
    } else {
      log(`⚠ Authenticated as: ${user.email}`, 'yellow')
    }
  } catch (err) {
    log(`✗ Auth test error: ${err}`, 'red')
  }

  // Summary
  section('🎯 DIAGNOSIS SUMMARY')

  log('Next steps:', 'bright')
  log('1. Review any errors (marked with ✗) above', 'cyan')
  log('2. Check warnings (marked with ⚠) for potential issues', 'cyan')
  log('3. Verify all tables exist and have correct structure', 'cyan')
  log('4. Ensure RLS policies are properly configured', 'cyan')
  log('5. Test user signup and login flow', 'cyan')
  log('6. Check that migrations have been applied correctly', 'cyan')

  section('Done!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
