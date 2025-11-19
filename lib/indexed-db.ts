/**
 * IndexedDB File Storage
 *
 * Provides persistent file storage with much higher capacity than localStorage.
 * - localStorage: ~5-10MB total
 * - IndexedDB: ~50MB-1GB+ (browser dependent)
 *
 * Stores files as Blobs (binary) instead of base64, saving ~33% space.
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
        reject(new Error("Failed to save file to IndexedDB"));
      };

      transaction.onerror = () => {
        db.close();
        reject(new Error("Transaction failed"));
      };
    });
  } catch (error) {
    console.error("Error saving file to IndexedDB:", error);
    throw new Error("Failed to save file to IndexedDB");
  }
}

/**
 * Get a file from IndexedDB
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
