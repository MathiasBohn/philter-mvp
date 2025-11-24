/**
 * Supabase Storage Utilities
 *
 * Provides functions for uploading, downloading, and managing files in Supabase Storage.
 * Replaces the legacy IndexedDB-based file storage system.
 *
 * Buckets:
 * - documents: Application documents (PDFs, images, etc.)
 * - profile-photos: User profile photos
 * - building-assets: Public building logos and images
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  PROFILE_PHOTOS: 'profile-photos',
  BUILDING_ASSETS: 'building-assets',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void

/**
 * Upload result
 */
export interface UploadResult {
  /** The storage path of the uploaded file */
  path: string
  /** The full URL to access the file (for public buckets) or signed URL (for private buckets) */
  url?: string
  /** File size in bytes */
  size: number
}

/**
 * Download result
 */
export interface DownloadResult {
  /** Signed URL to download the file */
  url: string
  /** URL expiration time in seconds */
  expiresIn: number
}

/**
 * Storage quota information
 */
export interface StorageQuota {
  /** Total storage used in bytes */
  usage: number
  /** Total storage quota in bytes (null if unlimited) */
  quota: number | null
  /** Percentage of quota used (0-100) */
  percentUsed: number
}

/**
 * Upload a file to Supabase Storage
 *
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket (e.g., "user-id/document-id/filename.pdf")
 * @param options - Upload options
 * @returns Upload result with storage path and URL
 *
 * @example
 * ```typescript
 * const result = await uploadFile(
 *   file,
 *   'documents',
 *   `${userId}/${documentId}/${file.name}`,
 *   {
 *     onProgress: (progress) => console.log(`Upload: ${progress}%`),
 *     upsert: false
 *   }
 * )
 * console.log('Uploaded to:', result.path)
 * ```
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  path: string,
  options?: {
    onProgress?: UploadProgressCallback
    upsert?: boolean
    cacheControl?: string
  }
): Promise<UploadResult> {
  const supabase = createClient()

  // Validate file size (max 25MB for documents, 5MB for profile photos)
  const maxSize = bucket === STORAGE_BUCKETS.PROFILE_PHOTOS ? 5 * 1024 * 1024 : 25 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${(maxSize / (1024 * 1024)).toFixed(0)}MB`)
  }

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  if (!data?.path) {
    throw new Error('Upload succeeded but no path was returned')
  }

  // For public buckets, get the public URL
  let url: string | undefined
  if (bucket === STORAGE_BUCKETS.BUILDING_ASSETS) {
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    url = publicUrlData.publicUrl
  }

  // Note: Progress tracking is not natively supported by Supabase Storage client
  // For real progress tracking, you would need to use the REST API directly with XMLHttpRequest
  // or implement chunked uploads. For now, we'll call progress callback at 100% after upload completes.
  if (options?.onProgress) {
    options.onProgress(100)
  }

  return {
    path: data.path,
    url,
    size: file.size,
  }
}

/**
 * Download a file from Supabase Storage (get signed URL)
 *
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Download result with signed URL
 *
 * @example
 * ```typescript
 * const result = await downloadFile('documents', 'user-id/doc-id/file.pdf', 3600)
 * window.open(result.url, '_blank')
 * ```
 */
export async function downloadFile(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<DownloadResult> {
  const supabase = createClient()

  // For public buckets, return public URL
  if (bucket === STORAGE_BUCKETS.BUILDING_ASSETS) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return {
      url: data.publicUrl,
      expiresIn: 0, // Public URLs don't expire
    }
  }

  // For private buckets, create signed URL
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create download URL: ${error.message}`)
  }

  if (!data?.signedUrl) {
    throw new Error('Failed to generate signed URL')
  }

  return {
    url: data.signedUrl,
    expiresIn,
  }
}

/**
 * Delete a file from Supabase Storage
 *
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 *
 * @example
 * ```typescript
 * await deleteFile('documents', 'user-id/doc-id/file.pdf')
 * ```
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Delete multiple files from Supabase Storage
 *
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths to delete
 *
 * @example
 * ```typescript
 * await deleteFiles('documents', [
 *   'user-id/doc-1/file1.pdf',
 *   'user-id/doc-2/file2.pdf'
 * ])
 * ```
 */
export async function deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove(paths)

  if (error) {
    throw new Error(`Failed to delete files: ${error.message}`)
  }
}

/**
 * Get storage quota information
 *
 * Note: Supabase doesn't provide a direct API for quota information.
 * This function calculates usage based on the user's uploaded files.
 *
 * @param bucket - The storage bucket to check (optional, checks all if not specified)
 * @returns Storage quota information
 *
 * @example
 * ```typescript
 * const quota = await getStorageQuota('documents')
 * console.log(`Using ${quota.percentUsed}% of storage`)
 * ```
 */
export async function getStorageQuota(bucket?: StorageBucket): Promise<StorageQuota> {
  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // List files in the user's folder
    const bucketsToCheck = bucket ? [bucket] : Object.values(STORAGE_BUCKETS)
    let totalSize = 0

    for (const bucketName of bucketsToCheck) {
      // Skip public buckets as they don't count toward user quota
      if (bucketName === STORAGE_BUCKETS.BUILDING_ASSETS) {
        continue
      }

      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list(user.id, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) {
        console.error(`Error listing files in ${bucketName}:`, error)
        continue
      }

      if (files) {
        totalSize += files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
      }
    }

    // Supabase free tier: 1GB storage
    // Pro tier: 100GB storage
    // We'll assume 1GB quota for now (can be configured)
    const quota = 1024 * 1024 * 1024 // 1GB in bytes
    const percentUsed = (totalSize / quota) * 100

    return {
      usage: totalSize,
      quota,
      percentUsed: Math.min(percentUsed, 100),
    }
  } catch (error) {
    console.error('Error checking storage quota:', error)
    return {
      usage: 0,
      quota: null,
      percentUsed: 0,
    }
  }
}

/**
 * Check if a file exists in storage
 *
 * @param bucket - The storage bucket name
 * @param path - The file path to check
 * @returns True if file exists, false otherwise
 */
export async function fileExists(bucket: StorageBucket, path: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from(bucket).list(path.split('/').slice(0, -1).join('/'))

    if (error) {
      return false
    }

    const filename = path.split('/').pop()
    return data?.some((file) => file.name === filename) || false
  } catch {
    return false
  }
}

/**
 * Get file metadata
 *
 * @param bucket - The storage bucket name
 * @param path - The file path
 * @returns File metadata including size, created_at, etc.
 */
export async function getFileMetadata(
  bucket: StorageBucket,
  path: string
): Promise<{
  name: string
  size: number
  createdAt: string
  updatedAt: string
  mimetype: string
} | null> {
  const supabase = createClient()

  const folderPath = path.split('/').slice(0, -1).join('/')
  const filename = path.split('/').pop()

  const { data, error } = await supabase.storage.from(bucket).list(folderPath)

  if (error || !data) {
    return null
  }

  const file = data.find((f) => f.name === filename)
  if (!file) {
    return null
  }

  return {
    name: file.name,
    size: file.metadata?.size || 0,
    createdAt: file.created_at || '',
    updatedAt: file.updated_at || '',
    mimetype: file.metadata?.mimetype || '',
  }
}

/**
 * List files in a folder
 *
 * @param bucket - The storage bucket name
 * @param folder - The folder path (e.g., "user-id/application-id")
 * @param options - List options
 * @returns Array of files
 */
export async function listFiles(
  bucket: StorageBucket,
  folder: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: { column: string; order: 'asc' | 'desc' }
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: options?.limit || 100,
    offset: options?.offset || 0,
    sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
  })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data || []
}

/**
 * Move/rename a file
 *
 * @param bucket - The storage bucket name
 * @param fromPath - The current file path
 * @param toPath - The new file path
 */
export async function moveFile(bucket: StorageBucket, fromPath: string, toPath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath)

  if (error) {
    throw new Error(`Failed to move file: ${error.message}`)
  }
}

/**
 * Copy a file
 *
 * @param bucket - The storage bucket name
 * @param fromPath - The source file path
 * @param toPath - The destination file path
 */
export async function copyFile(bucket: StorageBucket, fromPath: string, toPath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath)

  if (error) {
    throw new Error(`Failed to copy file: ${error.message}`)
  }
}
