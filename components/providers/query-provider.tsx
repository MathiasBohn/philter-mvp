'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '@/lib/query-client'
import { useState } from 'react'

/**
 * Query Provider Component
 *
 * Wraps the application with React Query's QueryClientProvider
 * and includes the DevTools in development mode.
 *
 * This component must be a Client Component because QueryClientProvider
 * uses React Context, which is not supported in Server Components.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable query client instance
  // We use useState to ensure the client is only created once
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
