/**
 * Upload Manager
 *
 * Handles simulated file uploads with pause/resume capability and localStorage/IndexedDB storage
 */

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
 * Convert File to base64 string for localStorage storage
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
 * Convert base64 string back to File object
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

/**
 * Storage interface for uploaded files
 */
export interface StoredFile {
  id: string
  filename: string
  size: number
  type: string
  base64: string
  uploadedAt: string
  category?: string
}

/**
 * Save file to localStorage
 * Note: localStorage has a size limit (~5-10MB). For larger files, consider IndexedDB
 */
export async function saveFileToStorage(
  file: File,
  id: string,
  category?: string
): Promise<void> {
  try {
    const base64 = await fileToBase64(file)

    const storedFile: StoredFile = {
      id,
      filename: file.name,
      size: file.size,
      type: file.type,
      base64,
      uploadedAt: new Date().toISOString(),
      category,
    }

    // Get existing files
    const existingFiles = getStoredFiles()
    existingFiles[id] = storedFile

    // Save to localStorage
    localStorage.setItem("philter_uploaded_files", JSON.stringify(existingFiles))
  } catch (error) {
    console.error("Error saving file to storage:", error)
    throw new Error("Failed to save file. File may be too large for localStorage.")
  }
}

/**
 * Get all stored files from localStorage
 */
export function getStoredFiles(): Record<string, StoredFile> {
  try {
    const stored = localStorage.getItem("philter_uploaded_files")
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error("Error reading files from storage:", error)
    return {}
  }
}

/**
 * Get a specific file from storage
 */
export function getStoredFile(id: string): StoredFile | null {
  const files = getStoredFiles()
  return files[id] || null
}

/**
 * Delete a file from storage
 */
export function deleteStoredFile(id: string): void {
  const files = getStoredFiles()
  delete files[id]
  localStorage.setItem("philter_uploaded_files", JSON.stringify(files))
}

/**
 * Clear all stored files
 */
export function clearAllStoredFiles(): void {
  localStorage.removeItem("philter_uploaded_files")
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; total: number; percentage: number } {
  const stored = localStorage.getItem("philter_uploaded_files") || ""
  const used = new Blob([stored]).size
  const total = 5 * 1024 * 1024 // Approximate 5MB limit for localStorage

  return {
    used,
    total,
    percentage: (used / total) * 100,
  }
}
