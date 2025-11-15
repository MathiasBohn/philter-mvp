"use client"

import { ErrorBoundary } from "@/components/error/error-boundary"

export default function DashboardError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary {...props} variant="dashboard" />
}
