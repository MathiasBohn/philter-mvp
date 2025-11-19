/**
 * useFilePreview Hook
 *
 * Manages file preview URLs (created with URL.createObjectURL) and automatically
 * cleans them up to prevent memory leaks.
 *
 * Memory leaks occur when URL.createObjectURL is called but URL.revokeObjectURL
 * is never called. This hook tracks all preview URLs and revokes them when:
 * 1. Files are removed from the list
 * 2. Component unmounts
 */

import { useEffect, useRef } from 'react'

interface FileWithPreview {
  id: string
  preview?: string
}

/**
 * Automatically manages and cleans up file preview URLs
 * @param files - Array of files that may have preview URLs
 */
export function useFilePreview(files: FileWithPreview[]) {
  const prevFilesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const currentPreviews = new Set(
      files.filter(f => f.preview).map(f => f.preview!)
    )

    // Revoke previews that are no longer in the list
    prevFilesRef.current.forEach(preview => {
      if (!currentPreviews.has(preview)) {
        URL.revokeObjectURL(preview)
      }
    })

    prevFilesRef.current = currentPreviews

    // Cleanup all on unmount
    return () => {
      prevFilesRef.current.forEach(preview => {
        URL.revokeObjectURL(preview)
      })
      prevFilesRef.current.clear()
    }
  }, [files])
}
