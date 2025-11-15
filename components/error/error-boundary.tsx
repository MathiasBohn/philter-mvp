"use client"

import { useEffect } from "react"
import { AlertCircle, AlertTriangle } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  variant?: "page" | "dashboard"
}

/**
 * Reusable error boundary component that displays a user-friendly error message
 * with options to retry or navigate home.
 *
 * @param error - The error object
 * @param reset - Function to reset the error state and retry
 * @param variant - The display variant ("page" for root-level errors, "dashboard" for dashboard errors)
 *
 * @example
 * ```tsx
 * // app/error.tsx
 * export default function Error(props: ErrorProps) {
 *   return <ErrorBoundary {...props} variant="page" />
 * }
 * ```
 */
export function ErrorBoundary({
  error,
  reset,
  variant = "page",
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(`${variant} error:`, error)
  }, [error, variant])

  const Icon = variant === "page" ? AlertCircle : AlertTriangle
  const containerClass =
    variant === "page"
      ? "min-h-screen flex items-center justify-center p-4"
      : "p-8 flex items-center justify-center"
  const homeHref = variant === "page" ? "/" : "/dashboard"
  const homeLabel = variant === "page" ? "Go Home" : "Back to Dashboard"

  return (
    <div className={containerClass}>
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Icon className="h-6 w-6 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            {error.message || "An unexpected error occurred. Please try again."}
          </CardDescription>
          {error.digest && (
            <p className="text-sm text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </CardHeader>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button asChild variant="outline">
            <a href={homeHref}>{homeLabel}</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
