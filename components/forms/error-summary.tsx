"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useRef, forwardRef } from "react"
import { toast } from "sonner"

export interface ErrorItem {
  field: string
  message: string
  anchor?: string
}

interface ErrorSummaryProps {
  errors: ErrorItem[]
  title?: string
  autoFocus?: boolean
  className?: string
}

/**
 * ErrorSummary Component
 *
 * Displays a list of validation errors at the top of a form
 * with ARIA support and focus management
 *
 * Features:
 * - ARIA role="alert" for screen reader announcement
 * - Keyboard accessible error links
 * - Auto-focus on mount (optional)
 * - Focus not obscured by ensuring scroll offset
 * - Anchor links to specific form fields
 */
export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(
  ({ errors, title = "Please fix the following errors", autoFocus = true, className }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null)
    const summaryRef = (ref as React.RefObject<HTMLDivElement>) || internalRef

    useEffect(() => {
      if (autoFocus && errors.length > 0 && summaryRef.current) {
        // Focus the error summary when errors appear
        summaryRef.current.focus()

        // Scroll to top with offset to prevent sticky headers from obscuring
        const yOffset = -100 // Offset for sticky headers
        const element = summaryRef.current
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset

        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }, [errors.length, autoFocus, summaryRef])

    if (errors.length === 0) return null

    /**
     * Handle clicking an error link to navigate to the field
     * Uses multiple strategies to find the element, with toast fallback
     */
    const handleErrorClick = (field: string, anchor?: string) => {
      // Try multiple strategies to find the element
      let element: HTMLElement | null = null

      if (anchor) {
        element = document.getElementById(anchor)
      }

      if (!element) {
        // Try to find by name attribute
        element = document.querySelector(`[name="${field}"]`) as HTMLElement
      }

      if (!element) {
        // Try to find by data-field attribute
        element = document.querySelector(`[data-field="${field}"]`) as HTMLElement
      }

      if (!element) {
        // Try to find by field ID
        element = document.getElementById(field)
      }

      if (element) {
        // Focus the element
        element.focus()

        // Scroll with offset to prevent obscuring by sticky headers
        const yOffset = -120
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset

        window.scrollTo({ top: y, behavior: "smooth" })

        // Add a visual highlight (optional - requires CSS)
        element.classList.add("highlight-error")
        setTimeout(() => {
          element?.classList.remove("highlight-error")
        }, 2000)
      } else {
        // Fallback: Show toast notification when field cannot be found
        const fieldLabel = getFieldLabel(field)
        console.warn(`[ErrorSummary] Could not find field element: ${field}`)
        toast.info(`Please locate the "${fieldLabel}" field and correct the error.`, {
          description: "The field may be in a collapsed section or different tab.",
          duration: 5000,
        })
      }
    }

    /**
     * Get a human-readable field label from field name
     */
    const getFieldLabel = (field: string): string => {
      // Try to find label for the field
      const element = document.querySelector(`[name="${field}"]`)
      const label = element
        ? document.querySelector(`label[for="${element.id}"]`)
        : document.querySelector(`label[for="${field}"]`)

      if (label) {
        return label.textContent || field
      }

      // Convert field name to readable format (e.g., "fullName" -> "Full Name")
      return field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    }

    return (
      <Alert
        ref={summaryRef}
        variant="destructive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        tabIndex={-1}
        className={className}
      >
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle className="text-base font-semibold" id="error-summary-title">
          {title}
        </AlertTitle>
        <AlertDescription>
          <p className="text-sm mb-2" aria-describedby="error-summary-title">
            There {errors.length === 1 ? "is" : "are"} {errors.length} error
            {errors.length === 1 ? "" : "s"} on this page. Please review and correct them before
            continuing.
          </p>
          <ul className="mt-2 space-y-1" aria-label="Error list">
            {errors.map((error, index) => {
              const fieldLabel = getFieldLabel(error.field)
              const anchorId = error.anchor || error.field

              return (
                <li key={`${error.field}-${index}`} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1 text-destructive">
                    •
                  </span>
                  <button
                    type="button"
                    className="text-left underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 rounded px-1 -ml-1"
                    onClick={() => handleErrorClick(error.field, anchorId)}
                    aria-label={`Go to ${fieldLabel}: ${error.message}`}
                  >
                    <span className="font-medium">{fieldLabel}:</span> {error.message}
                  </button>
                </li>
              )
            })}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }
)

ErrorSummary.displayName = "ErrorSummary"
