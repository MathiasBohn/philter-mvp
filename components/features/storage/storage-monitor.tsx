"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { checkStorageQuota } from '@/lib/indexed-db'

/**
 * StorageMonitor Component
 *
 * Monitors browser storage usage and displays warnings when storage
 * is running low (>80%) or critically low (>90%).
 *
 * Checks storage every 5 minutes and on mount.
 */
export function StorageMonitor() {
  const [storageInfo, setStorageInfo] = useState<{
    percentUsed: number
    usage: number
    quota: number
  } | null>(null)

  useEffect(() => {
    const checkStorage = async () => {
      const info = await checkStorageQuota()
      setStorageInfo(info)
    }

    checkStorage()

    // Check every 5 minutes
    const interval = setInterval(checkStorage, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Don't show anything if storage is below 80%
  if (!storageInfo || storageInfo.percentUsed < 80) {
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
