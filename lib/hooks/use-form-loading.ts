import { useState, useEffect, useRef } from "react"

/**
 * Hook to manage form loading state with error handling
 * Provides a consistent loading experience across all forms
 *
 * Uses ref pattern for loadFn to prevent infinite loops when
 * callers don't memoize their load function.
 *
 * @param loadFn - Function to call for loading data (doesn't need to be memoized)
 * @param minLoadingTime - Minimum loading time in ms for better UX (default: 300)
 * @returns Object with isLoading state and any error that occurred
 */
export function useFormLoading(
  loadFn: () => void | Promise<void>,
  minLoadingTime = 300
): { isLoading: boolean; error: Error | null } {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use ref to store loadFn - prevents re-runs when caller doesn't memoize
  const loadFnRef = useRef(loadFn)

  // Update ref on every render (no effect trigger)
  useEffect(() => {
    loadFnRef.current = loadFn
  })

  useEffect(() => {
    let mounted = true
    const startTime = Date.now()

    const load = async () => {
      try {
        await loadFnRef.current()
      } catch (err) {
        if (mounted) {
          const errorObj = err instanceof Error ? err : new Error('Load failed')
          setError(errorObj)
          console.error("Error loading form data:", errorObj)
        }
      } finally {
        if (mounted) {
          // Ensure minimum loading time for better UX
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, minLoadingTime - elapsed)

          if (remaining > 0) {
            setTimeout(() => {
              if (mounted) setIsLoading(false)
            }, remaining)
          } else {
            setIsLoading(false)
          }
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [minLoadingTime]) // Only minLoadingTime in deps - loadFn accessed via ref

  return { isLoading, error }
}
