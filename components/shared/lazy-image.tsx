"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  /**
   * Load image only when it's within this many pixels of the viewport
   */
  rootMargin?: string
  /**
   * Placeholder to show while loading
   */
  placeholder?: "blur" | "empty"
  blurDataURL?: string
}

/**
 * Lazy-loading wrapper for images
 * Uses Intersection Observer to only load images when they're near the viewport
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
  priority = false,
  rootMargin = "200px",
  placeholder,
  blurDataURL,
}: LazyImageProps) {
  const [shouldLoad, setShouldLoad] = useState(priority) // Load immediately if priority
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return // Skip observer if priority image

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
  }, [priority, rootMargin])

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        fill
          ? { position: "relative" }
          : width && height
          ? { width, height }
          : undefined
      }
    >
      {shouldLoad ? (
        <>
          {isLoading && (
            <Skeleton
              className="absolute inset-0"
              style={fill ? undefined : { width, height }}
            />
          )}
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            className={className}
            loading={priority ? "eager" : "lazy"}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={() => setIsLoading(false)}
          />
        </>
      ) : (
        <Skeleton style={fill ? undefined : { width, height }} className={className} />
      )}
    </div>
  )
}
