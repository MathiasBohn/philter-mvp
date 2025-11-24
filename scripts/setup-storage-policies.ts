/**
 * Supabase Storage Policies Setup Script
 *
 * This script creates RLS policies for Supabase Storage buckets to control access:
 * - Documents: Only authenticated users with proper application access
 * - Profile photos: Users can only access their own photos
 * - Building assets: Public read access
 *
 * Run with: npx tsx scripts/setup-storage-policies.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function _executeSql(sql: string, description: string) {
  console.log(`\n📝 ${description}`)

  const { data: _data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

  if (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }

  console.log(`   ✅ Success`)
  return true
}

async function main() {
  console.log('🔒 Supabase Storage Policies Setup')
  console.log('='.repeat(50))

  // Note: Storage policies are managed through SQL
  // We'll create the policies using the Supabase SQL editor or migrations

  const policies = [
    {
      name: 'Documents Bucket Policies',
      sql: `
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Documents bucket: SELECT (download) policy
CREATE POLICY "Authenticated users can download documents they have access to"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    -- User is the uploader
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- User has access to the application (via documents table)
    EXISTS (
      SELECT 1
      FROM documents d
      JOIN applications a ON d.application_id = a.id
      LEFT JOIN application_participants ap ON ap.application_id = a.id
      WHERE d.storage_path = name
        AND (
          a.created_by = auth.uid()
          OR ap.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
              AND role IN ('ADMIN', 'BOARD')
          )
        )
    )
  )
);

-- Documents bucket: INSERT (upload) policy
CREATE POLICY "Authenticated users can upload documents to their applications"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Documents bucket: DELETE policy
CREATE POLICY "Users can delete their own uploaded documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
      `
    },
    {
      name: 'Profile Photos Bucket Policies',
      sql: `
-- Profile photos: SELECT policy
CREATE POLICY "Users can view their own profile photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Profile photos: INSERT policy
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Profile photos: UPDATE policy
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Profile photos: DELETE policy
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
      `
    },
    {
      name: 'Building Assets Bucket Policies',
      sql: `
-- Building assets: Public read access (bucket is already public)
CREATE POLICY "Anyone can view building assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'building-assets');

-- Building assets: Admins can upload
CREATE POLICY "Admins can upload building assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'building-assets'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Building assets: Admins can delete
CREATE POLICY "Admins can delete building assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'building-assets'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
      `
    }
  ]

  console.log('\n⚠️  Important: Storage policies must be created through the Supabase dashboard')
  console.log('   or via SQL migrations.\n')
  console.log('   Please run the following SQL in your Supabase SQL Editor:\n')

  for (const policy of policies) {
    console.log('-- ' + '='.repeat(60))
    console.log(`-- ${policy.name}`)
    console.log('-- ' + '='.repeat(60))
    console.log(policy.sql.trim())
    console.log('\n')
  }

  console.log('\n📝 Next steps:')
  console.log('   1. Copy the SQL above')
  console.log('   2. Go to Supabase Dashboard > SQL Editor')
  console.log('   3. Paste and execute the SQL')
  console.log('   4. Verify policies are created in Storage > Policies')
  console.log('   5. Run: npm run dev to test storage access\n')
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
