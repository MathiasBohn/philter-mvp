"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Role } from "@/lib/types"
import { getDashboardForRole } from "@/lib/routing"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: Role[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Use profile role if available, otherwise fall back to user.role
  // The auth context sets isLoading=false once profile fetch completes (even if it returned null)
  const actualRole = profile?.role ?? user?.role

  useEffect(() => {
    if (!isLoading) {
      // If no user is logged in, redirect to sign-in page with return URL
      if (!user) {
        const signInUrl = `/sign-in?redirectTo=${encodeURIComponent(pathname || '/')}`
        router.push(signInUrl)
        return
      }

      // Check role access - use whatever role we have
      if (actualRole && !allowedRoles.includes(actualRole)) {
        // Redirect to the user's appropriate dashboard based on their actual role
        const dashboard = getDashboardForRole(actualRole)
        router.push(dashboard)
        return
      }
    }
  }, [user, isLoading, actualRole, allowedRoles, router, pathname])

  // Show loading state while checking authentication
  // Trust isLoading from auth context - it's set to false once auth state is determined
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

  // If user is not authenticated, show nothing (redirect will happen via useEffect)
  if (!user) {
    return null
  }

  // If user doesn't have permission, show nothing (redirect will happen via useEffect)
  if (actualRole && !allowedRoles.includes(actualRole)) {
    return null
  }

  return <>{children}</>
}
