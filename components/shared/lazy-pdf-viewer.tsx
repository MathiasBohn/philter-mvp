"use client"

import { useState, useEffect, useRef } from "react"
import { PdfViewer } from "./pdf-viewer"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyPdfViewerProps {
  url: string
  className?: string
  showThumbnails?: boolean
  /**
   * Load PDF only when it's within this many pixels of the viewport
   */
  rootMargin?: string
}

/**
 * Lazy-loading wrapper for PDF viewer
 * Uses Intersection Observer to only load PDFs when they're near the viewport
 */
export function LazyPdfViewer({
  url,
  className,
  showThumbnails,
  rootMargin = "200px",
}: LazyPdfViewerProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect() // Stop observing once loaded
          }
        })
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin])

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <PdfViewer url={url} showThumbnails={showThumbnails} className={className} />
      ) : (
        <div className="flex h-[600px] w-full flex-col gap-4 rounded-lg border bg-muted/5 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-full w-full" />
        </div>
      )}
    </div>
  )
}
