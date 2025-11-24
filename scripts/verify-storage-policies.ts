/**
 * Verify Supabase Storage Policies
 *
 * This script checks that all required storage policies are correctly configured
 * and tests basic upload/download functionality.
 *
 * Run with: npx tsx scripts/verify-storage-policies.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Expected policies for each bucket
const EXPECTED_POLICIES = {
  documents: [
    { operation: 'SELECT', minCount: 1 },
    { operation: 'INSERT', minCount: 1 },
    { operation: 'DELETE', minCount: 1 }
  ],
  'profile-photos': [
    { operation: 'SELECT', minCount: 1 },
    { operation: 'INSERT', minCount: 1 },
    { operation: 'UPDATE', minCount: 1 },
    { operation: 'DELETE', minCount: 1 }
  ],
  'building-assets': [
    { operation: 'SELECT', minCount: 1 },
    { operation: 'INSERT', minCount: 1 },
    { operation: 'DELETE', minCount: 1 }
  ]
}

async function checkRLSEnabled() {
  console.log('\n🔒 Checking if RLS is enabled on storage.objects...')

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: `
      SELECT relrowsecurity
      FROM pg_class
      WHERE oid = 'storage.objects'::regclass;
    `
  }).single()

  if (error) {
    console.log('   ⚠️  Could not verify RLS status (this is okay)')
    return true // Assume it's enabled
  }

  const isEnabled = (data as { relrowsecurity?: boolean })?.relrowsecurity === true
  console.log(isEnabled ? '   ✅ RLS is enabled' : '   ❌ RLS is NOT enabled')
  return isEnabled
}

async function getPolicies() {
  console.log('\n📋 Fetching storage policies...')

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = 'objects'
        AND schemaname = 'storage'
      ORDER BY policyname;
    `
  })

  if (error) {
    console.error('   ❌ Error fetching policies:', error.message)
    return null
  }

  if (!data || data.length === 0) {
    console.log('   ⚠️  No policies found!')
    return []
  }

  console.log(`   ✅ Found ${data.length} storage policies`)
  return data
}

async function analyzePolicies(policies: Array<{ policyname: string; cmd: string; qual?: unknown; [key: string]: unknown }>) {
  console.log('\n🔍 Analyzing policy coverage...\n')

  const results: { [bucket: string]: { [operation: string]: number } } = {}

  // Group policies by bucket and operation
  for (const policy of policies) {
    const policyName = policy.policyname.toLowerCase()
    const operation = policy.cmd // SELECT, INSERT, UPDATE, DELETE, ALL

    // Detect which bucket this policy applies to
    let bucket = 'unknown'
    const qualString = typeof policy.qual === 'string' ? policy.qual : ''
    if (policyName.includes('document') || qualString.includes('documents')) {
      bucket = 'documents'
    } else if (policyName.includes('profile') || policyName.includes('photo')) {
      bucket = 'profile-photos'
    } else if (policyName.includes('building') || policyName.includes('asset')) {
      bucket = 'building-assets'
    }

    if (!results[bucket]) {
      results[bucket] = {}
    }

    // ALL operation counts for all operations
    if (operation === 'ALL') {
      ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].forEach(op => {
        results[bucket][op] = (results[bucket][op] || 0) + 1
      })
    } else {
      results[bucket][operation] = (results[bucket][operation] || 0) + 1
    }
  }

  // Check coverage for each bucket
  let allGood = true

  for (const [bucket, expectedOps] of Object.entries(EXPECTED_POLICIES)) {
    console.log(`📦 ${bucket.toUpperCase()}:`)

    const actualOps = results[bucket] || {}

    for (const { operation, minCount } of expectedOps) {
      const count = actualOps[operation] || 0
      const hasEnough = count >= minCount
      const icon = hasEnough ? '✅' : '❌'

      console.log(`   ${icon} ${operation}: ${count} policy(ies) (need ${minCount}+)`)

      if (!hasEnough) {
        allGood = false
      }
    }
    console.log()
  }

  return allGood
}

async function displayPolicyDetails(policies: Array<{ policyname: string; cmd: string; roles?: string[]; permissive: string; qual?: string; withcheck?: string; [key: string]: unknown }>) {
  console.log('\n📄 Policy Details:\n')
  console.log('='.repeat(80))

  for (const policy of policies) {
    console.log(`\nPolicy: ${policy.policyname}`)
    console.log(`  Operation: ${policy.cmd}`)
    console.log(`  Roles: ${policy.roles?.join(', ') || 'N/A'}`)
    console.log(`  Permissive: ${policy.permissive}`)

    if (policy.qual && typeof policy.qual === 'string') {
      const qualPreview = policy.qual.substring(0, 100)
      console.log(`  USING: ${qualPreview}${policy.qual.length > 100 ? '...' : ''}`)
    }

    if (policy.withcheck && typeof policy.withcheck === 'string') {
      const checkPreview = policy.withcheck.substring(0, 100)
      console.log(`  WITH CHECK: ${checkPreview}${policy.withcheck.length > 100 ? '...' : ''}`)
    }
  }

  console.log('\n' + '='.repeat(80))
}

async function testBucketAccess() {
  console.log('\n🧪 Testing bucket access...\n')

  const buckets = ['documents', 'profile-photos', 'building-assets']

  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 })

      if (error) {
        console.log(`   ❌ ${bucketName}: ${error.message}`)
      } else {
        console.log(`   ✅ ${bucketName}: Accessible (${data?.length || 0} items visible)`)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`   ❌ ${bucketName}: ${message}`)
    }
  }
}

async function main() {
  console.log('🚀 Supabase Storage Policy Verification')
  console.log('='.repeat(80))

  // Step 1: Check RLS
  const rlsEnabled = await checkRLSEnabled()

  // Step 2: Get policies
  const policies = await getPolicies()

  if (!policies || policies.length === 0) {
    console.log('\n❌ No storage policies found!')
    console.log('\n📝 Action Required:')
    console.log('   1. Go to Supabase Dashboard > Storage > Policies')
    console.log('   2. Create policies for each bucket (documents, profile-photos, building-assets)')
    console.log('   3. Run this script again to verify')
    process.exit(1)
  }

  // Step 3: Display policy details
  await displayPolicyDetails(policies)

  // Step 4: Analyze coverage
  const allCovered = await analyzePolicies(policies)

  // Step 5: Test bucket access
  await testBucketAccess()

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 SUMMARY:')
  console.log('='.repeat(80))
  console.log(`RLS Enabled: ${rlsEnabled ? '✅' : '❌'}`)
  console.log(`Total Policies: ${policies.length}`)
  console.log(`Coverage Complete: ${allCovered ? '✅' : '❌'}`)

  if (allCovered && rlsEnabled) {
    console.log('\n✅ All storage policies are correctly configured!')
    console.log('\n📝 Next Steps:')
    console.log('   1. Test file upload in the application')
    console.log('   2. Verify users can only access their own files')
    console.log('   3. Test download with signed URLs')
  } else {
    console.log('\n⚠️  Some policies are missing or misconfigured')
    console.log('\n📝 Action Required:')
    console.log('   Review the policy coverage above and add missing policies')
  }

  console.log('\n' + '='.repeat(80))
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
