/**
 * Upload Manager
 *
 * Handles simulated file uploads with pause/resume capability and IndexedDB storage
 */

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

// Upload Manager types are defined inline below

interface UploadTask {
  fileId: string
  intervalId: NodeJS.Timeout | null
  isPaused: boolean
}

class UploadManager {
  private tasks: Map<string, UploadTask> = new Map()
  private readonly CHUNK_SIZE = 5 // Simulate 5% progress per interval
  private readonly INTERVAL_MS = 200 // Simulate upload every 200ms

  /**
   * Start uploading a file with simulated progress
   */
  startUpload(
    fileId: string,
    onProgress: (progress: number) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ) {
    // Don't start if already uploading
    if (this.tasks.has(fileId)) {
      return
    }

    let currentProgress = 0

    const intervalId = setInterval(() => {
      const task = this.tasks.get(fileId)
      if (!task || task.isPaused) {
        return
      }

      // Simulate random progress variations
      const progressIncrement = this.CHUNK_SIZE + Math.random() * 3

      currentProgress = Math.min(100, currentProgress + progressIncrement)
      onProgress(Math.floor(currentProgress))

      // Complete when reaching 100%
      if (currentProgress >= 100) {
        this.completeUpload(fileId)
        onComplete()
      }

      // Simulate random errors (1% chance)
      if (Math.random() < 0.01) {
        this.cancelUpload(fileId)
        onError("Network error occurred")
      }
    }, this.INTERVAL_MS)

    this.tasks.set(fileId, {
      fileId,
      intervalId,
      isPaused: false,
    })
  }

  /**
   * Pause an ongoing upload
   */
  pauseUpload(fileId: string) {
    const task = this.tasks.get(fileId)
    if (task) {
      task.isPaused = true
    }
  }

  /**
   * Resume a paused upload
   */
  resumeUpload(fileId: string) {
    const task = this.tasks.get(fileId)
    if (task) {
      task.isPaused = false
    }
  }

  /**
   * Cancel and clean up an upload
   */
  cancelUpload(fileId: string) {
    const task = this.tasks.get(fileId)
    if (task?.intervalId) {
      clearInterval(task.intervalId)
    }
    this.tasks.delete(fileId)
  }

  /**
   * Complete and clean up an upload
   */
  private completeUpload(fileId: string) {
    this.cancelUpload(fileId)
  }

  /**
   * Clean up all uploads (call on component unmount)
   */
  cleanup() {
    this.tasks.forEach((task) => {
      if (task.intervalId) {
        clearInterval(task.intervalId)
      }
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
