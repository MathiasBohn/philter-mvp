'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-center text-xl">Something went wrong</CardTitle>
          <CardDescription className="text-center">
            We encountered an error while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">Error Details:</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Reference: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/')} variant="outline" className="flex-1">
              Back to Dashboard
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
