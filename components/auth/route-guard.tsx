"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { Role } from "@/lib/types"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: Role[]
  redirectTo?: string
}

export function RouteGuard({ children, allowedRoles, redirectTo = "/" }: RouteGuardProps) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // If no user is logged in, redirect to landing page
      if (!user) {
        router.push(redirectTo)
        return
      }

      // If user doesn't have permission, redirect to landing page
      if (!allowedRoles.includes(user.role)) {
        router.push(redirectTo)
        return
      }
    }
  }, [user, isLoading, allowedRoles, router, redirectTo])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if user is not authenticated or doesn't have permission
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
