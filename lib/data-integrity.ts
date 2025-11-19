/**
 * Data Integrity Utilities
 *
 * Provides functions to verify that file references in metadata match
 * actual files stored in IndexedDB, and to clean up orphaned files.
 */

import { getStoredFiles, deleteStoredFile } from './upload-manager'
import { storageService, STORAGE_KEYS } from './persistence'

/**
 * Document structure from metadata (for type safety)
 */
interface DocumentMetadata {
  id: string
  file: {
    name: string
  }
}

interface CategoryMetadata {
  id: string
  documents: DocumentMetadata[]
}

/**
 * Check data integrity for a specific application
 *
 * Verifies that all file references in the application's metadata
 * have corresponding files in IndexedDB storage.
 *
 * @param applicationId - The ID of the application to check
 * @returns Object containing validation results
 */
export async function checkDataIntegrity(applicationId: string): Promise<{
  valid: boolean
  issues: string[]
  orphanedFiles: string[]
  missingFiles: string[]
}> {
  const issues: string[] = []
  const orphanedFiles: string[] = []
  const missingFiles: string[] = []

  try {
    // Get all file references from metadata
    const referencedFileIds = new Set<string>()

    // Get all actual stored files
    const storedFiles = await getStoredFiles()
    const storedFileIds = new Set(Object.keys(storedFiles))

    // Check documents page data
    const documentsData = storageService.get(
      STORAGE_KEYS.documentsData(applicationId),
      null
    )

    if (documentsData) {
      const data = typeof documentsData === 'string'
        ? JSON.parse(documentsData)
        : documentsData

      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((cat: CategoryMetadata) => {
          if (cat.documents && Array.isArray(cat.documents)) {
            cat.documents.forEach((doc: DocumentMetadata) => {
              referencedFileIds.add(doc.id)

              // Check if file exists in storage
              if (!storedFileIds.has(doc.id)) {
                missingFiles.push(doc.id)
                issues.push(
                  `Document "${doc.file.name}" (${doc.id}) referenced but not found in storage`
                )
              }
            })
          }
        })
      }
    }

    // Check income page data
    const incomeData = storageService.get(
      STORAGE_KEYS.incomeData(applicationId),
      null
    )

    if (incomeData) {
      const data = typeof incomeData === 'string'
        ? JSON.parse(incomeData)
        : incomeData

      // Check employment verification documents
      if (data.documents && Array.isArray(data.documents)) {
        data.documents.forEach((doc: DocumentMetadata) => {
          referencedFileIds.add(doc.id)

          if (!storedFileIds.has(doc.id)) {
            missingFiles.push(doc.id)
            issues.push(
              `Income document "${doc.file.name}" (${doc.id}) referenced but not found in storage`
            )
          }
        })
      }

      // Check CPA letter documents
      if (data.cpaLetterDocuments && Array.isArray(data.cpaLetterDocuments)) {
        data.cpaLetterDocuments.forEach((doc: DocumentMetadata) => {
          referencedFileIds.add(doc.id)

          if (!storedFileIds.has(doc.id)) {
            missingFiles.push(doc.id)
            issues.push(
              `CPA letter "${doc.file.name}" (${doc.id}) referenced but not found in storage`
            )
          }
        })
      }
    }

    // Check for orphaned files (files in storage but not referenced in metadata)
    // Note: This is application-specific, so we can only find orphans for this app
    // A full cleanup would need to check all applications
    for (const fileId of storedFileIds) {
      if (!referencedFileIds.has(fileId)) {
        // This might be a file from another application, so we don't mark it as orphaned
        // Only mark as orphaned if we can determine it belongs to this app
        // For now, we skip this check at the application level
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      orphanedFiles,
      missingFiles
    }
  } catch (error) {
    console.error('Error checking data integrity:', error)
    return {
      valid: false,
      issues: [`Error during integrity check: ${error}`],
      orphanedFiles: [],
      missingFiles: []
    }
  }
}

/**
 * Check for orphaned files across all applications
 *
 * Identifies files in IndexedDB that are not referenced by any
 * application's metadata.
 *
 * @returns Array of orphaned file IDs
 */
export async function findOrphanedFiles(): Promise<{
  orphanedFileIds: string[]
  totalFiles: number
  referencedFiles: number
}> {
  try {
    // Collect all referenced file IDs from all applications
    const allReferencedIds = new Set<string>()

    // Get all storage keys that might contain file references
    // We'll need to iterate through potential application IDs
    // For now, we'll check localStorage for all keys
    const allKeys = Object.keys(localStorage)

    for (const key of allKeys) {
      // Check for documents data keys
      if (key.startsWith('documents-data-') || key.startsWith('documents_data_')) {
        const data = storageService.get(key, null)
        if (data) {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          if (parsed.categories && Array.isArray(parsed.categories)) {
            parsed.categories.forEach((cat: CategoryMetadata) => {
              if (cat.documents && Array.isArray(cat.documents)) {
                cat.documents.forEach((doc: DocumentMetadata) => {
                  allReferencedIds.add(doc.id)
                })
              }
            })
          }
        }
      }

      // Check for income data keys
      if (key.startsWith('income-data-') || key.startsWith('income_data_')) {
        const data = storageService.get(key, null)
        if (data) {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          if (parsed.documents && Array.isArray(parsed.documents)) {
            parsed.documents.forEach((doc: DocumentMetadata) => {
              allReferencedIds.add(doc.id)
            })
          }
          if (parsed.cpaLetterDocuments && Array.isArray(parsed.cpaLetterDocuments)) {
            parsed.cpaLetterDocuments.forEach((doc: DocumentMetadata) => {
              allReferencedIds.add(doc.id)
            })
          }
        }
      }
    }

    // Get all stored files
    const storedFiles = await getStoredFiles()
    const storedFileIds = Object.keys(storedFiles)

    // Find orphaned files
    const orphanedFileIds = storedFileIds.filter(
      fileId => !allReferencedIds.has(fileId)
    )

    return {
      orphanedFileIds,
      totalFiles: storedFileIds.length,
      referencedFiles: allReferencedIds.size
    }
  } catch (error) {
    console.error('Error finding orphaned files:', error)
    return {
      orphanedFileIds: [],
      totalFiles: 0,
      referencedFiles: 0
    }
  }
}

/**
 * Clean up orphaned files from IndexedDB
 *
 * Deletes files that are not referenced by any application's metadata.
 * Use with caution - this operation cannot be undone.
 *
 * @param dryRun - If true, only reports what would be deleted without actually deleting
 * @returns Number of files deleted (or would be deleted in dry run mode)
 */
export async function cleanupOrphanedFiles(
  dryRun = true
): Promise<{
  deletedCount: number
  orphanedFileIds: string[]
  errors: string[]
}> {
  const errors: string[] = []
  let deletedCount = 0

  try {
    const { orphanedFileIds } = await findOrphanedFiles()

    if (dryRun) {
      console.log('[DRY RUN] Would delete the following files:', orphanedFileIds)
      return {
        deletedCount: orphanedFileIds.length,
        orphanedFileIds,
        errors: []
      }
    }

    // Actually delete the files
    for (const fileId of orphanedFileIds) {
      try {
        await deleteStoredFile(fileId)
        deletedCount++
      } catch (error) {
        errors.push(`Failed to delete file ${fileId}: ${error}`)
        console.error(`Error deleting file ${fileId}:`, error)
      }
    }

    return {
      deletedCount,
      orphanedFileIds,
      errors
    }
  } catch (error) {
    console.error('Error during cleanup:', error)
    return {
      deletedCount: 0,
      orphanedFileIds: [],
      errors: [`Cleanup failed: ${error}`]
    }
  }
}

/**
 * Repair data integrity issues
 *
 * Attempts to fix common data integrity issues:
 * - Removes references to missing files from metadata
 * - Optionally cleans up orphaned files
 *
 * @param applicationId - The application ID to repair
 * @param cleanupOrphans - Whether to also clean up orphaned files
 * @returns Repair results
 */
export async function repairDataIntegrity(
  applicationId: string,
  cleanupOrphans = false
): Promise<{
  success: boolean
  repairedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  let repairedCount = 0

  try {
    // Check current state
    const integrity = await checkDataIntegrity(applicationId)

    if (integrity.valid) {
      return {
        success: true,
        repairedCount: 0,
        errors: []
      }
    }

    // Repair documents data
    const documentsData = storageService.get(
      STORAGE_KEYS.documentsData(applicationId),
      null
    )

    if (documentsData) {
      const data = typeof documentsData === 'string'
        ? JSON.parse(documentsData)
        : documentsData

      if (data.categories && Array.isArray(data.categories)) {
        // Get current stored files
        const storedFiles = await getStoredFiles()
        const storedFileIds = new Set(Object.keys(storedFiles))

        // Filter out documents that don't have corresponding files
        data.categories = data.categories.map((cat: CategoryMetadata) => ({
          ...cat,
          documents: cat.documents.filter((doc: DocumentMetadata) => {
            const exists = storedFileIds.has(doc.id)
            if (!exists) repairedCount++
            return exists
          })
        }))

        // Save repaired data
        storageService.set(STORAGE_KEYS.documentsData(applicationId), data)
      }
    }

    // Repair income data
    const incomeData = storageService.get(
      STORAGE_KEYS.incomeData(applicationId),
      null
    )

    if (incomeData) {
      const data = typeof incomeData === 'string'
        ? JSON.parse(incomeData)
        : incomeData

      const storedFiles = await getStoredFiles()
      const storedFileIds = new Set(Object.keys(storedFiles))

      // Filter out missing documents
      if (data.documents && Array.isArray(data.documents)) {
        const originalLength = data.documents.length
        data.documents = data.documents.filter((doc: DocumentMetadata) =>
          storedFileIds.has(doc.id)
        )
        repairedCount += originalLength - data.documents.length
      }

      if (data.cpaLetterDocuments && Array.isArray(data.cpaLetterDocuments)) {
        const originalLength = data.cpaLetterDocuments.length
        data.cpaLetterDocuments = data.cpaLetterDocuments.filter(
          (doc: DocumentMetadata) => storedFileIds.has(doc.id)
        )
        repairedCount += originalLength - data.cpaLetterDocuments.length
      }

      // Save repaired data
      storageService.set(STORAGE_KEYS.incomeData(applicationId), data)
    }

    // Optionally cleanup orphaned files
    if (cleanupOrphans) {
      const cleanupResult = await cleanupOrphanedFiles(false)
      repairedCount += cleanupResult.deletedCount
      errors.push(...cleanupResult.errors)
    }

    return {
      success: errors.length === 0,
      repairedCount,
      errors
    }
  } catch (error) {
    console.error('Error repairing data integrity:', error)
    return {
      success: false,
      repairedCount,
      errors: [...errors, `Repair failed: ${error}`]
    }
  }
}
