import { useState, useEffect } from "react"

/**
 * Hook to manage form loading state
 * Provides a consistent loading experience across all forms
 */
export function useFormLoading(loadFn: () => void | Promise<void>, minLoadingTime = 300) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const startTime = Date.now()

      try {
        await loadFn()
      } catch (error) {
        console.error("Error loading form data:", error)
      }

      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime
      const remaining = minLoadingTime - elapsed

      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }

      setIsLoading(false)
    }

    load()
  }, [])

  return isLoading
}
