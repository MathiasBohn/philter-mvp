"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Base props shared by all LazyImage variants
 */
interface LazyImageBaseProps {
  src: string
  alt: string
  className?: string
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
 * Props for fixed-dimension images
 * Requires both width and height to prevent layout shifts
 */
interface LazyImageFixedProps extends LazyImageBaseProps {
  /** Image width in pixels - required for fixed dimension mode */
  width: number
  /** Image height in pixels - required for fixed dimension mode */
  height: number
  /** Must be false or omitted for fixed dimension mode */
  fill?: false
}

/**
 * Props for fill mode images
 * Parent container must have position: relative and defined dimensions
 */
interface LazyImageFillProps extends LazyImageBaseProps {
  /** Fill mode - image fills parent container */
  fill: true
  /** Width not allowed with fill mode */
  width?: never
  /** Height not allowed with fill mode */
  height?: never
}

/**
 * LazyImage props - enforces either fixed dimensions or fill mode
 * to prevent Cumulative Layout Shift (CLS)
 */
type LazyImageProps = LazyImageFixedProps | LazyImageFillProps

/**
 * Lazy-loading wrapper for images
 * Uses Intersection Observer to only load images when they're near the viewport
 *
 * @example Fixed dimensions (prevents layout shift)
 * ```tsx
 * <LazyImage src="/photo.jpg" alt="Photo" width={400} height={300} />
 * ```
 *
 * @example Fill mode (parent must have position: relative and dimensions)
 * ```tsx
 * <div className="relative w-full h-64">
 *   <LazyImage src="/photo.jpg" alt="Photo" fill />
 * </div>
 * ```
 */
export function LazyImage(props: LazyImageProps) {
  const {
    src,
    alt,
    className,
    priority = false,
    rootMargin = "200px",
    placeholder,
    blurDataURL,
  } = props

  // Type-safe dimension extraction
  const fill = 'fill' in props ? props.fill : false
  const width = 'width' in props ? props.width : undefined
  const height = 'height' in props ? props.height : undefined
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
