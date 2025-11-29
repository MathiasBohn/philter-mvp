"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { checkStorageQuota } from '@/lib/indexed-db'

/**
 * Routes where StorageMonitor should be active
 * These are pages that involve document uploads or storage management
 */
const STORAGE_RELEVANT_ROUTES = [
  '/settings',
  '/admin',
  '/documents',
  '/applications', // Document uploads happen here
]

/**
 * StorageMonitor Component
 *
 * Monitors browser storage usage and displays warnings when storage
 * is running low (>80%) or critically low (>90%).
 *
 * Only active on routes where storage is relevant (settings, documents, applications).
 * Checks storage every 5 minutes and on mount.
 */
export function StorageMonitor() {
  const pathname = usePathname()
  const [storageInfo, setStorageInfo] = useState<{
    percentUsed: number
    usage: number
    quota: number
  } | null>(null)

  // Check if we're on a route where storage monitoring is relevant
  const shouldMonitor = STORAGE_RELEVANT_ROUTES.some(route => pathname?.includes(route))

  useEffect(() => {
    // Skip storage checks on irrelevant routes
    if (!shouldMonitor) return

    const checkStorage = async () => {
      const info = await checkStorageQuota()
      setStorageInfo(info)
    }

    checkStorage()

    // Check every 5 minutes
    const interval = setInterval(checkStorage, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [shouldMonitor])

  // Don't show anything on irrelevant routes or if storage is below 80%
  if (!shouldMonitor || !storageInfo || storageInfo.percentUsed < 80) {
    return null
  }

  const isDestructive = storageInfo.percentUsed > 90

  return (
    <Alert variant={isDestructive ? 'destructive' : 'default'} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Storage is {Math.round(storageInfo.percentUsed)}% full
        ({formatBytes(storageInfo.usage)} of {formatBytes(storageInfo.quota)} used).
        {isDestructive && ' Please delete some files to free up space.'}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}
