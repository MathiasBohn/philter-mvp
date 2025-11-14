"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorItem {
  field: string
  message: string
  anchor?: string
}

interface ErrorSummaryProps {
  errors: ErrorItem[]
  title?: string
}

export function ErrorSummary({ errors, title = "Please fix the following errors" }: ErrorSummaryProps) {
  if (errors.length === 0) return null

  const handleErrorClick = (anchor?: string) => {
    if (anchor) {
      const element = document.getElementById(anchor)
      if (element) {
        element.focus()
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  return (
    <Alert variant="destructive" role="alert" aria-live="assertive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {errors.map((error, index) => (
            <li key={index}>
              {error.anchor ? (
                <button
                  type="button"
                  className="underline hover:no-underline focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                  onClick={() => handleErrorClick(error.anchor)}
                >
                  {error.message}
                </button>
              ) : (
                error.message
              )}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
