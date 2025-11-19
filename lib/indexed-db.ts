/**
 * IndexedDB File Storage
 *
 * Provides persistent file storage with much higher capacity than localStorage.
 * - localStorage: ~5-10MB total
 * - IndexedDB: ~50MB-1GB+ (browser dependent)
 *
 * Stores files as Blobs (binary) instead of base64, saving ~33% space.
 *
 * @module indexed-db
 * @description Core IndexedDB implementation for file storage in philter MVP
 *
 * ## Database Schema
 *
 * Database: `philter_file_storage` (version 1)
 * Object Store: `files` (keyPath: "id")
 * Indexes:
 *   - `category` (non-unique) - Group files by category (e.g., "documents", "income")
 *   - `uploadedAt` (non-unique) - Query files by upload date
 *
 * ## Upgrade Strategy
 *
 * Version 1: Initial schema with files object store and indexes
 * Future versions: Add new indexes or stores, but never remove existing ones for backward compatibility
 *
 * ## Usage Example
 *
 * ```typescript
 * import {
 *   saveFileToIndexedDB,
 *   getFileFromIndexedDB,
 *   getAllFilesFromIndexedDB,
 *   deleteFileFromIndexedDB,
 *   storedFileToFile
 * } from '@/lib/indexed-db'
 *
 * // Save a file
 * const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
 * await saveFileToIndexedDB(file, 'file-123', 'documents')
 *
 * // Retrieve a file
 * const storedFile = await getFileFromIndexedDB('file-123')
 * if (storedFile) {
 *   const file = storedFileToFile(storedFile)
 *   console.log('Retrieved:', file.name, file.size)
 * }
 *
 * // Get all files
 * const allFiles = await getAllFilesFromIndexedDB()
 * Object.values(allFiles).forEach(file => {
 *   console.log(file.filename, file.category)
 * })
 *
 * // Delete a file
 * await deleteFileFromIndexedDB('file-123')
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API}
 */

const DB_NAME = "philter_file_storage";
const DB_VERSION = 1;
const STORE_NAME = "files";

export interface StoredFile {
  id: string;
  filename: string;
  size: number;
  type: string;
  blob: Blob;
  uploadedAt: string;
  category?: string;
}

/**
 * Initialize IndexedDB database
 *
 * Opens the IndexedDB database and creates the object store with indexes if needed.
 * This function handles database versioning and upgrades automatically.
 *
 * @returns Promise that resolves to the opened IDBDatabase instance
 * @throws Error if IndexedDB is not supported or fails to open
 *
 * @internal This function is not exported - use the public API functions instead
 *
 * @example
 * const db = await openDatabase()
 * const transaction = db.transaction(['files'], 'readonly')
 * // ... use the database
 * db.close() // Always close when done
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        // Create indexes for common queries
        objectStore.createIndex("category", "category", { unique: false });
        objectStore.createIndex("uploadedAt", "uploadedAt", { unique: false });
      }
    };
  });
}

/**
 * Save a file to IndexedDB
 *
 * Stores a File object in IndexedDB as a Blob with associated metadata.
 * If a file with the same ID already exists, it will be replaced.
 *
 * @param file - The File object to store
 * @param id - Unique identifier for the file (used as the key)
 * @param category - Optional category for grouping (e.g., "documents", "income", "profile-photo")
 * @returns Promise that resolves when the file is saved
 * @throws IndexedDBError with specific error codes:
 *   - QUOTA_EXCEEDED: Storage limit reached
 *   - NOT_SUPPORTED: IndexedDB not available
 *   - UNKNOWN: Other errors
 *
 * @example
 * // Save a user-uploaded file
 * const file = event.target.files[0]
 * await saveFileToIndexedDB(file, 'doc-123', 'documents')
 *
 * @example
 * // Handle quota exceeded error
 * try {
 *   await saveFileToIndexedDB(file, id, category)
 * } catch (error) {
 *   if (error instanceof IndexedDBError && error.code === 'QUOTA_EXCEEDED') {
 *     alert('Storage full! Please delete some files.')
 *   }
 * }
 */
export async function saveFileToIndexedDB(
  file: File,
  id: string,
  category?: string
): Promise<void> {
  try {
    const db = await openDatabase();

    const storedFile: StoredFile = {
      id,
      filename: file.name,
      size: file.size,
      type: file.type,
      blob: file, // Store as Blob directly (File extends Blob)
      uploadedAt: new Date().toISOString(),
      category,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(storedFile);

      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        reject(handleIndexedDBError(request.error));
      };

      transaction.onerror = () => {
        db.close();
        reject(handleIndexedDBError(transaction.error));
      };
    });
  } catch (error) {
    console.error("Error saving file to IndexedDB:", error);
    throw handleIndexedDBError(error);
  }
}

/**
 * Get a file from IndexedDB
 *
 * Retrieves a stored file by its ID. Returns null if the file doesn't exist.
 *
 * @param id - The unique identifier of the file to retrieve
 * @returns Promise that resolves to the StoredFile or null if not found
 *
 * @example
 * const storedFile = await getFileFromIndexedDB('doc-123')
 * if (storedFile) {
 *   console.log('Found file:', storedFile.filename)
 *   const file = storedFileToFile(storedFile)
 *   // Use the File object
 * } else {
 *   console.log('File not found')
 * }
 */
export async function getFileFromIndexedDB(id: string): Promise<StoredFile | null> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };

      request.onerror = () => {
        db.close();
        reject(new Error("Failed to get file from IndexedDB"));
      };
    });
  } catch (error) {
    console.error("Error getting file from IndexedDB:", error);
    return null;
  }
}

/**
 * Get all files from IndexedDB
 *
 * Retrieves all stored files as a dictionary keyed by file ID.
 * Useful for bulk operations, file restoration, and integrity checks.
 *
 * @returns Promise that resolves to an object mapping file IDs to StoredFile objects
 *
 * @example
 * // Restore all files on page load
 * const allFiles = await getAllFilesFromIndexedDB()
 * Object.entries(allFiles).forEach(([id, storedFile]) => {
 *   const file = storedFileToFile(storedFile)
 *   console.log(`${id}: ${file.name} (${file.size} bytes)`)
 * })
 *
 * @example
 * // Check if specific files exist
 * const allFiles = await getAllFilesFromIndexedDB()
 * const fileIds = ['doc-1', 'doc-2', 'doc-3']
 * const missingIds = fileIds.filter(id => !allFiles[id])
 * if (missingIds.length > 0) {
 *   console.warn('Missing files:', missingIds)
 * }
 */
export async function getAllFilesFromIndexedDB(): Promise<Record<string, StoredFile>> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        db.close();
        const files: Record<string, StoredFile> = {};
        request.result.forEach((file: StoredFile) => {
          files[file.id] = file;
        });
        resolve(files);
      };

      request.onerror = () => {
        db.close();
        reject(new Error("Failed to get files from IndexedDB"));
      };
    });
  } catch (error) {
    console.error("Error getting files from IndexedDB:", error);
    return {};
  }
}

/**
 * Delete a file from IndexedDB
 */
export async function deleteFileFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        reject(new Error("Failed to delete file from IndexedDB"));
      };
    });
  } catch (error) {
    console.error("Error deleting file from IndexedDB:", error);
    throw error;
  }
}

/**
 * Clear all files from IndexedDB
 */
export async function clearAllFilesFromIndexedDB(): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        reject(new Error("Failed to clear files from IndexedDB"));
      };
    });
  } catch (error) {
    console.error("Error clearing files from IndexedDB:", error);
    throw error;
  }
}

/**
 * Get storage usage information
 */
export async function getIndexedDBStorageInfo(): Promise<{
  used: number;
  fileCount: number;
  files: Array<{ id: string; filename: string; size: number }>;
}> {
  try {
    const files = await getAllFilesFromIndexedDB();
    const fileArray = Object.values(files);

    const used = fileArray.reduce((total, file) => total + file.size, 0);

    return {
      used,
      fileCount: fileArray.length,
      files: fileArray.map((f) => ({
        id: f.id,
        filename: f.filename,
        size: f.size,
      })),
    };
  } catch (error) {
    console.error("Error getting storage info:", error);
    return {
      used: 0,
      fileCount: 0,
      files: [],
    };
  }
}

/**
 * Convert StoredFile blob back to File object
 */
export function storedFileToFile(storedFile: StoredFile): File {
  return new File([storedFile.blob], storedFile.filename, {
    type: storedFile.type,
  });
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && !!window.indexedDB;
}

/**
 * Check browser storage quota
 * Returns information about how much storage is being used and available
 */
export async function checkStorageQuota(): Promise<{
  usage: number
  quota: number
  percentUsed: number
  available: number
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const usage = estimate.usage || 0
    const quota = estimate.quota || 0
    return {
      usage,
      quota,
      available: quota - usage,
      percentUsed: quota ? (usage / quota) * 100 : 0
    }
  }
  return { usage: 0, quota: 0, available: 0, percentUsed: 0 }
}

/**
 * IndexedDB Error Types
 */
export class IndexedDBError extends Error {
  constructor(
    message: string,
    public code: 'QUOTA_EXCEEDED' | 'NOT_SUPPORTED' | 'UNKNOWN',
    public originalError?: Error
  ) {
    super(message)
    this.name = 'IndexedDBError'
  }
}

/**
 * Handle IndexedDB errors and convert them to user-friendly messages
 */
export function handleIndexedDBError(error: unknown): IndexedDBError {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return new IndexedDBError(
        'Storage quota exceeded. Please delete some files to free up space.',
        'QUOTA_EXCEEDED',
        error
      )
    }
  }

  if (error instanceof Error && error.message.includes('not supported')) {
    return new IndexedDBError(
      'Your browser does not support file storage. Please use a modern browser.',
      'NOT_SUPPORTED',
      error
    )
  }

  return new IndexedDBError(
    'An error occurred while saving files. Please try again.',
    'UNKNOWN',
    error as Error
  )
}
