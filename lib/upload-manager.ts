/**
 * Upload Manager
 *
 * Handles file uploads to Supabase Storage with progress tracking and retry logic.
 * Replaces the legacy IndexedDB-based storage system.
 */

import {
  uploadFile,
  type StorageBucket,
  type UploadResult,
} from "./supabase-storage"
import {
  saveFileToIndexedDB,
  getFileFromIndexedDB,
  getAllFilesFromIndexedDB,
  deleteFileFromIndexedDB,
  clearAllFilesFromIndexedDB,
  getIndexedDBStorageInfo,
  storedFileToFile,
  isIndexedDBAvailable,
  type StoredFile,
} from "./indexed-db"

// Upload Manager types

interface UploadTask {
  fileId: string
  file: File
  bucket: StorageBucket
  path: string
  isPaused: boolean
  isRetrying: boolean
  retryCount: number
  abortController: AbortController | null
}

interface UploadConfig {
  maxRetries?: number
  retryDelay?: number
}

class UploadManager {
  private tasks: Map<string, UploadTask> = new Map()
  private readonly DEFAULT_MAX_RETRIES = 3
  private readonly DEFAULT_RETRY_DELAY = 1000 // 1 second

  /**
   * Upload a file to Supabase Storage with progress tracking
   *
   * @param fileId - Unique identifier for this upload
   * @param file - The file to upload
   * @param bucket - The storage bucket
   * @param path - The storage path within the bucket
   * @param onProgress - Progress callback (0-100)
   * @param onComplete - Success callback with upload result
   * @param onError - Error callback
   * @param config - Upload configuration
   */
  async startUpload(
    fileId: string,
    file: File,
    bucket: StorageBucket,
    path: string,
    onProgress: (progress: number) => void,
    onComplete: (result: UploadResult) => void,
    onError: (error: string) => void,
    config?: UploadConfig
  ) {
    // Don't start if already uploading
    if (this.tasks.has(fileId)) {
      onError("Upload already in progress")
      return
    }

    const maxRetries = config?.maxRetries || this.DEFAULT_MAX_RETRIES
    const retryDelay = config?.retryDelay || this.DEFAULT_RETRY_DELAY

    const task: UploadTask = {
      fileId,
      file,
      bucket,
      path,
      isPaused: false,
      isRetrying: false,
      retryCount: 0,
      abortController: new AbortController(),
    }

    this.tasks.set(fileId, task)

    try {
      // Start upload with progress tracking
      onProgress(0)

      const result = await uploadFile(file, bucket, path, {
        onProgress: (progress) => {
          if (!task.isPaused) {
            onProgress(progress)
          }
        },
        upsert: false,
      })

      onProgress(100)
      this.completeUpload(fileId)
      onComplete(result)
    } catch (error: unknown) {
      // Handle upload error with retry logic
      if (task.retryCount < maxRetries && !task.isPaused) {
        task.isRetrying = true
        task.retryCount++

        console.log(
          `Upload failed for ${fileId}, retrying (${task.retryCount}/${maxRetries})...`
        )

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay))

        // Retry the upload
        if (!task.isPaused) {
          this.startUpload(
            fileId,
            file,
            bucket,
            path,
            onProgress,
            onComplete,
            onError,
            config
          )
        }
      } else {
        // Max retries exceeded or upload cancelled
        this.cancelUpload(fileId)
        const errorMessage = error instanceof Error ? error.message : "Upload failed"
        onError(errorMessage)
      }
    }
  }

  /**
   * Pause an ongoing upload
   * Note: Supabase doesn't support native pause/resume, so this cancels the upload
   */
  pauseUpload(fileId: string) {
    const task = this.tasks.get(fileId)
    if (task) {
      task.isPaused = true
      task.abortController?.abort()
    }
  }

  /**
   * Resume a paused upload
   * Note: This will restart the upload from the beginning
   */
  resumeUpload(
    fileId: string,
    onProgress: (progress: number) => void,
    onComplete: (result: UploadResult) => void,
    onError: (error: string) => void,
    config?: UploadConfig
  ) {
    const task = this.tasks.get(fileId)
    if (task) {
      task.isPaused = false
      task.abortController = new AbortController()
      this.startUpload(
        fileId,
        task.file,
        task.bucket,
        task.path,
        onProgress,
        onComplete,
        onError,
        config
      )
    }
  }

  /**
   * Cancel and clean up an upload
   */
  cancelUpload(fileId: string) {
    const task = this.tasks.get(fileId)
    if (task) {
      task.abortController?.abort()
    }
    this.tasks.delete(fileId)
  }

  /**
   * Complete and clean up an upload
   */
  private completeUpload(fileId: string) {
    this.tasks.delete(fileId)
  }

  /**
   * Check if an upload is in progress
   */
  isUploading(fileId: string): boolean {
    return this.tasks.has(fileId)
  }

  /**
   * Get upload status
   */
  getUploadStatus(fileId: string): {
    isPaused: boolean
    isRetrying: boolean
    retryCount: number
  } | null {
    const task = this.tasks.get(fileId)
    if (!task) return null

    return {
      isPaused: task.isPaused,
      isRetrying: task.isRetrying,
      retryCount: task.retryCount,
    }
  }

  /**
   * Clean up all uploads (call on component unmount)
   */
  cleanup() {
    this.tasks.forEach((task) => {
      task.abortController?.abort()
    })
    this.tasks.clear()
  }
}

// Export singleton instance
export const uploadManager = new UploadManager()

/**
 * LEGACY: Convert File to base64 string (deprecated - use IndexedDB instead)
 * @deprecated Use IndexedDB storage for better performance and capacity
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * LEGACY: Convert base64 string back to File object (deprecated - use IndexedDB instead)
 * @deprecated Use IndexedDB storage for better performance and capacity
 */
export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const arr = base64.split(",")
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mimeType })
}

// Note: StoredFile interface is now imported from ./indexed-db
// Export it for backward compatibility
export type { StoredFile }

/**
 * Save file to IndexedDB storage
 * IndexedDB has much better capacity (~50MB-1GB+) compared to localStorage (~5-10MB)
 */
export async function saveFileToStorage(
  file: File,
  id: string,
  category?: string
): Promise<void> {
  if (!isIndexedDBAvailable()) {
    throw new Error("IndexedDB is not available in this browser")
  }

  try {
    await saveFileToIndexedDB(file, id, category)
  } catch (error) {
    console.error("Error saving file to storage:", error)
    throw new Error("Failed to save file to IndexedDB")
  }
}

/**
 * Get all stored files from IndexedDB
 */
export async function getStoredFiles(): Promise<Record<string, StoredFile>> {
  if (!isIndexedDBAvailable()) {
    return {}
  }

  try {
    return await getAllFilesFromIndexedDB()
  } catch (error) {
    console.error("Error reading files from storage:", error)
    return {}
  }
}

/**
 * Get a specific file from storage
 */
export async function getStoredFile(id: string): Promise<StoredFile | null> {
  if (!isIndexedDBAvailable()) {
    return null
  }

  try {
    return await getFileFromIndexedDB(id)
  } catch (error) {
    console.error("Error getting file from storage:", error)
    return null
  }
}

/**
 * Delete a file from storage
 */
export async function deleteStoredFile(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) {
    throw new Error("IndexedDB is not available")
  }

  try {
    await deleteFileFromIndexedDB(id)
  } catch (error) {
    console.error("Error deleting file from storage:", error)
    throw error
  }
}

/**
 * Clear all stored files
 */
export async function clearAllStoredFiles(): Promise<void> {
  if (!isIndexedDBAvailable()) {
    throw new Error("IndexedDB is not available")
  }

  try {
    await clearAllFilesFromIndexedDB()
  } catch (error) {
    console.error("Error clearing files from storage:", error)
    throw error
  }
}

/**
 * Get storage usage info
 */
export async function getStorageInfo(): Promise<{
  used: number
  fileCount: number
  files: Array<{ id: string; filename: string; size: number }>
}> {
  if (!isIndexedDBAvailable()) {
    return { used: 0, fileCount: 0, files: [] }
  }

  try {
    return await getIndexedDBStorageInfo()
  } catch (error) {
    console.error("Error getting storage info:", error)
    return { used: 0, fileCount: 0, files: [] }
  }
}

/**
 * Convert a stored file back to a File object for use in the app
 */
export function getFileObject(storedFile: StoredFile): File {
  return storedFileToFile(storedFile)
}

/**
 * MIGRATION UTILITY: Migrate files from localStorage to IndexedDB
 *
 * This function helps transition from the old localStorage-based storage
 * to the new IndexedDB-based storage. It will:
 * 1. Read files from localStorage
 * 2. Convert base64 back to File objects
 * 3. Save to IndexedDB
 * 4. Optionally clear localStorage after successful migration
 *
 * @param clearLocalStorageAfter - Whether to clear localStorage after migration (default: false)
 * @returns Object with migration results
 */
export async function migrateFilesFromLocalStorage(
  clearLocalStorageAfter = false
): Promise<{
  success: boolean
  migratedCount: number
  failedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  let migratedCount = 0
  let failedCount = 0

  try {
    if (!isIndexedDBAvailable()) {
      throw new Error("IndexedDB is not available")
    }

    // Get files from localStorage (old format with base64)
    const stored = localStorage.getItem("philter_uploaded_files")
    if (!stored) {
      return {
        success: true,
        migratedCount: 0,
        failedCount: 0,
        errors: [],
      }
    }

    const oldFiles: Record<
      string,
      {
        id: string
        filename: string
        size: number
        type: string
        base64: string
        uploadedAt: string
        category?: string
      }
    > = JSON.parse(stored)

    // Migrate each file
    for (const [id, oldFile] of Object.entries(oldFiles)) {
      try {
        // Convert base64 back to File
        const file = base64ToFile(oldFile.base64, oldFile.filename, oldFile.type)

        // Save to IndexedDB
        await saveFileToIndexedDB(file, id, oldFile.category)

        migratedCount++
      } catch (error) {
        failedCount++
        errors.push(`Failed to migrate file ${oldFile.filename}: ${error}`)
        console.error(`Error migrating file ${id}:`, error)
      }
    }

    // Clear localStorage if requested and all files migrated successfully
    if (clearLocalStorageAfter && failedCount === 0) {
      localStorage.removeItem("philter_uploaded_files")
    }

    return {
      success: failedCount === 0,
      migratedCount,
      failedCount,
      errors,
    }
  } catch (error) {
    console.error("Error during migration:", error)
    return {
      success: false,
      migratedCount,
      failedCount,
      errors: [...errors, `Migration failed: ${error}`],
    }
  }
}

/**
 * Check if there are files in localStorage that need migration
 */
export function hasLocalStorageFilesToMigrate(): boolean {
  try {
    const stored = localStorage.getItem("philter_uploaded_files")
    if (!stored) return false

    const files = JSON.parse(stored)
    return Object.keys(files).length > 0
  } catch (error) {
    console.error("Error checking for localStorage files:", error)
    return false
  }
}
