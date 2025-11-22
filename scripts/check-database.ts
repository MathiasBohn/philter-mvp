/**
 * Script to verify database schema is properly set up
 * This checks if migrations have been run on Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Checking Supabase database schema...\n')

  try {
    // Check if key tables exist
    const tablesToCheck = [
      'users',
      'buildings',
      'applications',
      'documents',
      'rfis',
      'templates'
    ]

    const results = {
      tables: [] as string[],
      missing: [] as string[],
      enums: [] as string[],
      functions: [] as string[]
    }

    // Check tables
    for (const table of tablesToCheck) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(0)

      if (error) {
        if (error.code === '42P01') { // Table does not exist
          results.missing.push(table)
          console.log(`❌ Table '${table}' does not exist`)
        } else {
          console.log(`⚠️  Error checking table '${table}': ${error.message}`)
        }
      } else {
        results.tables.push(table)
        console.log(`✅ Table '${table}' exists`)
      }
    }

    // Check for enum types by trying to query with enum filter
    console.log('\n🔍 Checking enum types...')
    const { error: enumError } = await supabase
      .from('applications')
      .select('status, transaction_type')
      .limit(1)

    if (!enumError) {
      console.log('✅ Enum types appear to be working')
      results.enums.push('application_status_enum', 'transaction_type_enum')
    } else {
      console.log(`⚠️  Enum check: ${enumError.message}`)
    }

    // Check if seed data exists
    console.log('\n🔍 Checking seed data...')
    const { data: buildings, error: buildingError } = await supabase
      .from('buildings')
      .select('name')

    if (!buildingError && buildings) {
      console.log(`✅ Found ${buildings.length} buildings in database`)
      if (buildings.length > 0) {
        console.log(`   Sample: ${buildings[0].name}`)
      }
    }

    const { data: templates, error: templateError } = await supabase
      .from('templates')
      .select('name')

    if (!templateError && templates) {
      console.log(`✅ Found ${templates.length} templates in database`)
      if (templates.length > 0) {
        console.log(`   Sample: ${templates[0].name}`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Tables found: ${results.tables.length}/${tablesToCheck.length}`)
    if (results.missing.length > 0) {
      console.log(`❌ Tables missing: ${results.missing.join(', ')}`)
    }
    console.log(`✅ Enums working: ${results.enums.length > 0 ? 'Yes' : 'Unknown'}`)

    if (results.tables.length === tablesToCheck.length) {
      console.log('\n🎉 SUCCESS! All Phase 1 migrations appear to be applied!')
      console.log('✅ Phase 1 is COMPLETE')
      return true
    } else {
      console.log('\n⚠️  WARNING! Some tables are missing.')
      console.log('❌ Phase 1 migrations may not be fully applied.')
      console.log('\n📝 Next steps:')
      console.log('   1. Open Supabase Dashboard → SQL Editor')
      console.log('   2. Run migrations from supabase/migrations/ in order')
      console.log('   3. See supabase/README.md for instructions')
      return false
    }

  } catch (error) {
    console.error('❌ Error checking database:', error)
    return false
  }
}

checkDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
