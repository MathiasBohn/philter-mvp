"use client"

import { useEffect, useState } from 'react'
import {
  hasLocalStorageFilesToMigrate,
  migrateFilesFromLocalStorage
} from '@/lib/upload-manager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

/**
 * MigrationChecker Component
 *
 * Automatically checks for and migrates files from the legacy localStorage
 * storage system to the new IndexedDB storage system on app load.
 *
 * This component:
 * - Checks if there are files in localStorage that need migration
 * - Migrates them to IndexedDB
 * - Shows progress/success/error messages to the user
 * - Clears localStorage after successful migration
 */
export function MigrationChecker() {
  const [migrationStatus, setMigrationStatus] = useState<
    'checking' | 'migrating' | 'complete' | 'error' | null
  >(null)
  const [migrationResult, setMigrationResult] = useState<{
    migratedCount: number
    failedCount: number
    errors: string[]
  } | null>(null)

  useEffect(() => {
    const checkAndMigrate = async () => {
      // Only run in the browser
      if (typeof window === 'undefined') return

      // Check if there are files to migrate
      if (hasLocalStorageFilesToMigrate()) {
        setMigrationStatus('migrating')

        try {
          // Migrate files and clear localStorage on success
          const result = await migrateFilesFromLocalStorage(true)

          setMigrationResult(result)
          setMigrationStatus(result.success ? 'complete' : 'error')

          // Clear status after 10 seconds for successful migrations
          if (result.success) {
            setTimeout(() => setMigrationStatus(null), 10000)
          }
        } catch (error) {
          console.error('Migration error:', error)
          setMigrationStatus('error')
          setMigrationResult({
            migratedCount: 0,
            failedCount: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error occurred']
          })
        }
      }
    }

    checkAndMigrate()
  }, [])

  // Show loading state while migrating
  if (migrationStatus === 'migrating') {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Migrating your files to new storage system...
        </AlertDescription>
      </Alert>
    )
  }

  // Show success message
  if (migrationStatus === 'complete' && migrationResult) {
    return (
      <Alert className="mb-4">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Successfully migrated {migrationResult.migratedCount} file(s)
          to the new storage system.
        </AlertDescription>
      </Alert>
    )
  }

  // Show error message
  if (migrationStatus === 'error' && migrationResult) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to migrate some files.
          {migrationResult.migratedCount > 0 &&
            ` ${migrationResult.migratedCount} files migrated successfully.`}
          {migrationResult.failedCount > 0 &&
            ` ${migrationResult.failedCount} files failed.`}
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
