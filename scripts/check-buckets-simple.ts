import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🔍 Checking Supabase Storage Buckets\n')

  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No buckets found!')
    return
  }

  console.log(`✅ Found ${data.length} bucket(s):\n`)

  const expectedBuckets = ['documents', 'profile-photos', 'building-assets']

  for (const bucket of data) {
    const isExpected = expectedBuckets.includes(bucket.name)
    const icon = isExpected ? '✅' : 'ℹ️ '
    console.log(`${icon} ${bucket.name}`)
    console.log(`   Public: ${bucket.public ? 'Yes' : 'No'}`)

    if (bucket.file_size_limit) {
      const sizeMB = (bucket.file_size_limit / (1024 * 1024)).toFixed(0)
      console.log(`   Size limit: ${sizeMB}MB`)
    }

    if (bucket.allowed_mime_types && bucket.allowed_mime_types.length > 0) {
      console.log(`   Allowed types: ${bucket.allowed_mime_types.length} type(s)`)
    }

    console.log()
  }

  // Check if all expected buckets are present
  const foundBuckets = data.map(b => b.name)
  const missingBuckets = expectedBuckets.filter(name => !foundBuckets.includes(name))

  if (missingBuckets.length > 0) {
    console.log(`⚠️  Missing buckets: ${missingBuckets.join(', ')}`)
  } else {
    console.log('✅ All expected buckets are present!')
  }
}

main()
