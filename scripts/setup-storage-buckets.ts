/**
 * Supabase Storage Bucket Setup Script
 *
 * This script creates and configures the required Supabase Storage buckets:
 * - documents (private): For application documents
 * - profile-photos (private): For user profile photos
 * - building-assets (public): For building logos and images
 *
 * Run with: npx tsx scripts/setup-storage-buckets.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createBucket(
  name: string,
  config: {
    public: boolean
    fileSizeLimit?: number
    allowedMimeTypes?: string[]
  }
) {
  console.log(`\n📦 Creating bucket: ${name}`)
  console.log(`   Public: ${config.public}`)
  if (config.fileSizeLimit) {
    console.log(`   Max file size: ${(config.fileSizeLimit / (1024 * 1024)).toFixed(0)}MB`)
  }
  if (config.allowedMimeTypes) {
    console.log(`   Allowed types: ${config.allowedMimeTypes.join(', ')}`)
  }

  // Check if bucket already exists
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error(`❌ Error listing buckets: ${listError.message}`)
    return false
  }

  const bucketExists = existingBuckets?.some(b => b.name === name)

  if (bucketExists) {
    console.log(`   ℹ️  Bucket "${name}" already exists, skipping creation`)

    // Update bucket configuration
    const { error: updateError } = await supabase.storage.updateBucket(name, {
      public: config.public,
      fileSizeLimit: config.fileSizeLimit,
      allowedMimeTypes: config.allowedMimeTypes
    })

    if (updateError) {
      console.error(`   ❌ Error updating bucket config: ${updateError.message}`)
      return false
    }

    console.log(`   ✅ Bucket configuration updated`)
    return true
  }

  // Create new bucket
  const { data: _data, error } = await supabase.storage.createBucket(name, {
    public: config.public,
    fileSizeLimit: config.fileSizeLimit,
    allowedMimeTypes: config.allowedMimeTypes
  })

  if (error) {
    console.error(`   ❌ Error creating bucket: ${error.message}`)
    return false
  }

  console.log(`   ✅ Bucket "${name}" created successfully`)
  return true
}

async function main() {
  console.log('🚀 Supabase Storage Setup')
  console.log('=' .repeat(50))

  // 1. Documents bucket (private)
  const documentsSuccess = await createBucket('documents', {
    public: false,
    fileSizeLimit: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  })

  // 2. Profile photos bucket (private)
  const profilePhotosSuccess = await createBucket('profile-photos', {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  })

  // 3. Building assets bucket (public)
  const buildingAssetsSuccess = await createBucket('building-assets', {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
      'image/webp'
    ]
  })

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   Documents bucket: ${documentsSuccess ? '✅' : '❌'}`)
  console.log(`   Profile photos bucket: ${profilePhotosSuccess ? '✅' : '❌'}`)
  console.log(`   Building assets bucket: ${buildingAssetsSuccess ? '✅' : '❌'}`)

  const allSuccess = documentsSuccess && profilePhotosSuccess && buildingAssetsSuccess

  if (allSuccess) {
    console.log('\n✅ All buckets created/updated successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run: npx tsx scripts/setup-storage-policies.ts')
    console.log('   2. Test bucket access with a manual upload')
  } else {
    console.log('\n❌ Some buckets failed to create. Please check the errors above.')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
