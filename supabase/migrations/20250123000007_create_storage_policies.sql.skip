/**
 * Migration: Create Storage Bucket Policies
 * Created: 2025-01-23
 * Description: Sets up Row-Level Security policies for Supabase Storage buckets
 *
 * Buckets:
 * - documents (private): Application documents with access control
 * - profile-photos (private): User profile photos
 * - building-assets (public): Building logos and images
 */

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Documents Bucket Policies
-- ============================================================

-- DROP existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can download documents they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents to their applications" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploaded documents" ON storage.objects;

-- Documents bucket: SELECT (download) policy
-- Users can download documents if they:
-- 1. Uploaded the document themselves, OR
-- 2. Have access to the application (via application_participants or ownership)
CREATE POLICY "Authenticated users can download documents they have access to"
ON storage.objects FOR SELECT
TO authenticated
USING (
  
  bucket_id = 'documents'
  AND (
    -- User is the uploader (folder name is user ID)
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
          -- User created the application
          a.created_by = auth.uid()
          OR
          -- User is a participant (broker, co-applicant, etc.)
          ap.user_id = auth.uid()
          OR
          -- User is an admin or board member
          EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
              AND role IN ('ADMIN', 'BOARD')
          )
        )
    )
  )
);

-- Documents bucket: INSERT (upload) policy
-- Users can upload documents to folders named with their user ID
CREATE POLICY "Authenticated users can upload documents to their applications"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Documents bucket: DELETE policy
-- Users can delete documents they uploaded
CREATE POLICY "Users can delete their own uploaded documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- Profile Photos Bucket Policies
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;

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

-- ============================================================
-- Building Assets Bucket Policies
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view building assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload building assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete building assets" ON storage.objects;

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

-- ============================================================
-- Verification
-- ============================================================

-- Query to verify policies are created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
