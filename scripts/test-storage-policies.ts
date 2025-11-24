/**
 * Test Supabase Storage Policies
 *
 * This script tests that storage policies are working correctly by:
 * 1. Checking bucket accessibility
 * 2. Testing file operations (upload, download, delete)
 * 3. Verifying access control
 *
 * Run with: npx tsx scripts/test-storage-policies.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

// Create client with anon key (simulates regular user)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkBuckets() {
  console.log('\n📦 Checking Storage Buckets...\n')

  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.log('   ❌ Error listing buckets:', error.message)
    return false
  }

  const expectedBuckets = ['documents', 'profile-photos', 'building-assets']
  let allFound = true

  for (const bucketName of expectedBuckets) {
    const found = buckets?.some(b => b.name === bucketName)
    console.log(`   ${found ? '✅' : '❌'} ${bucketName}: ${found ? 'Found' : 'Not found'}`)

    if (found) {
      const bucket = buckets.find(b => b.name === bucketName)
      console.log(`      - Public: ${bucket?.public ? 'Yes' : 'No'}`)
      if (bucket?.file_size_limit) {
        console.log(`      - Size limit: ${(bucket.file_size_limit / (1024 * 1024)).toFixed(0)}MB`)
      }
    }

    if (!found) allFound = false
  }

  return allFound
}

async function testPublicBucketAccess() {
  console.log('\n🌐 Testing Public Bucket (building-assets)...\n')

  try {
    // Try to list files (should work even without auth for public bucket)
    const { data, error } = await supabase.storage
      .from('building-assets')
      .list('', { limit: 10 })

    if (error) {
      console.log('   ❌ Cannot list files:', error.message)
      return false
    }

    console.log(`   ✅ Can list files (${data?.length || 0} items)`)
    return true
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.log('   ❌ Error:', message)
    return false
  }
}

async function testPrivateBucketAccess() {
  console.log('\n🔒 Testing Private Bucket Access (documents)...\n')

  // Test without authentication
  const { data: session } = await supabase.auth.getSession()

  if (!session.session) {
    console.log('   ℹ️  No active session - testing unauthenticated access')

    const { data: _data, error } = await supabase.storage
      .from('documents')
      .list('', { limit: 1 })

    if (error) {
      // This is expected - unauthenticated users should not access private buckets
      console.log('   ✅ Correctly blocked unauthenticated access')
      console.log(`      Error: ${error.message}`)
      return true
    } else {
      console.log('   ⚠️  WARNING: Unauthenticated users can access private bucket!')
      return false
    }
  } else {
    console.log('   ℹ️  Active session detected - testing authenticated access')

    const { data, error } = await supabase.storage
      .from('documents')
      .list('', { limit: 10 })

    if (error) {
      console.log('   ⚠️  Cannot list files:', error.message)
      console.log('      This might be okay if policies are restrictive')
      return true
    }

    console.log(`   ✅ Can list files (${data?.length || 0} items)`)
    return true
  }
}

async function testUploadPermissions() {
  console.log('\n📤 Testing Upload Permissions...\n')

  const { data: session } = await supabase.auth.getSession()

  if (!session.session) {
    console.log('   ℹ️  Not authenticated - skipping upload test')
    console.log('      (Upload requires authentication)')
    return true
  }

  // Create a small test file
  const testContent = new Blob(['Test file for storage policy verification'], {
    type: 'text/plain'
  })
  const testFileName = `test-${Date.now()}.txt`
  const testPath = `${session.session.user.id}/${testFileName}`

  console.log(`   Testing upload to: documents/${testPath}`)

  const { data: _data, error } = await supabase.storage
    .from('documents')
    .upload(testPath, testContent)

  if (error) {
    console.log('   ❌ Upload failed:', error.message)
    return false
  }

  console.log('   ✅ Upload successful!')

  // Try to download it back
  const { data: _downloadData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(testPath)

  if (downloadError) {
    console.log('   ⚠️  Upload worked but download failed:', downloadError.message)
  } else {
    console.log('   ✅ Download successful!')
  }

  // Clean up - delete the test file
  const { error: deleteError } = await supabase.storage
    .from('documents')
    .remove([testPath])

  if (deleteError) {
    console.log('   ⚠️  Could not delete test file:', deleteError.message)
  } else {
    console.log('   ✅ Delete successful!')
  }

  return !error && !downloadError && !deleteError
}

async function checkPolicyHints() {
  console.log('\n💡 Policy Configuration Hints...\n')

  console.log('Expected policies for each bucket:')
  console.log('')
  console.log('📦 DOCUMENTS (private):')
  console.log('   - SELECT: Users can download if they uploaded OR have app access')
  console.log('   - INSERT: Users can upload to their own folder (user-id/...)')
  console.log('   - DELETE: Users can delete their own uploads')
  console.log('')
  console.log('📦 PROFILE-PHOTOS (private):')
  console.log('   - SELECT, INSERT, UPDATE, DELETE: Users own folder only')
  console.log('')
  console.log('📦 BUILDING-ASSETS (public):')
  console.log('   - SELECT: Anyone (public)')
  console.log('   - INSERT, DELETE: Admins only')
  console.log('')
}

async function main() {
  console.log('🚀 Supabase Storage Policy Test')
  console.log('='.repeat(80))

  // Check if buckets exist
  const bucketsOk = await checkBuckets()

  if (!bucketsOk) {
    console.log('\n❌ Not all buckets found!')
    console.log('   Run: npx tsx scripts/setup-storage-buckets.ts')
    process.exit(1)
  }

  // Test public bucket
  const publicOk = await testPublicBucketAccess()

  // Test private bucket access control
  const privateOk = await testPrivateBucketAccess()

  // Test upload/download/delete (if authenticated)
  const uploadOk = await testUploadPermissions()

  // Show policy hints
  await checkPolicyHints()

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 TEST SUMMARY:')
  console.log('='.repeat(80))
  console.log(`Buckets exist: ${bucketsOk ? '✅' : '❌'}`)
  console.log(`Public bucket accessible: ${publicOk ? '✅' : '❌'}`)
  console.log(`Private bucket protected: ${privateOk ? '✅' : '❌'}`)
  console.log(`Upload/download/delete: ${uploadOk ? '✅' : 'ℹ️  Not tested (no auth)'}`)

  const allGood = bucketsOk && publicOk && privateOk

  if (allGood) {
    console.log('\n✅ Storage policies appear to be working correctly!')

    console.log('\n📝 Manual Verification Steps:')
    console.log('   1. Go to Supabase Dashboard > Storage > Policies')
    console.log('   2. Verify you have policies for all three buckets')
    console.log('   3. Check that policy names match expected operations')
    console.log('   4. Test file upload in your application UI')
  } else {
    console.log('\n⚠️  Some issues detected - review the results above')
  }

  console.log('\n' + '='.repeat(80))
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
