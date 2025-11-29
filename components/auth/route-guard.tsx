"use client"

import { useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Role } from "@/lib/types"
import { getDashboardForRole } from "@/lib/routing"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: Role[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, profile, isLoading, isProfileLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Determine the effective role - prefer profile role (authoritative), fallback to user.role
  const effectiveRole = useMemo(() => {
    if (profile) return profile.role
    if (user) return user.role
    return null
  }, [profile, user])

  // Compute whether we should wait for profile
  const shouldWaitForProfile = useMemo(() => {
    // If still loading auth, not in "waiting for profile" state yet
    if (isLoading) return false
    // If no user, not waiting (will redirect to sign-in)
    if (!user) return false
    // If profile loaded, not waiting
    if (profile) return false
    // If profile is actively loading, wait for it
    if (isProfileLoading) return true
    // If quick role matches, not waiting (optimistic access)
    if (user.role && allowedRoles.includes(user.role)) return false
    // Profile fetch finished but no profile - don't wait anymore
    return false
  }, [isLoading, user, profile, isProfileLoading, allowedRoles])

  // Handle redirects
  useEffect(() => {
    // Still loading auth state - do nothing
    if (isLoading) {
      return
    }

    // If no user is logged in, redirect to sign-in page with return URL
    if (!user) {
      const signInUrl = `/sign-in?redirectTo=${encodeURIComponent(pathname || '/')}`
      router.push(signInUrl)
      return
    }

    // If profile is still loading, wait for it before making redirect decisions
    if (isProfileLoading) {
      console.log('[RouteGuard] Profile still loading, waiting...')
      return
    }

    // Now we can check role access
    // Use profile.role if available (authoritative), otherwise user.role
    const roleToCheck = profile?.role || user.role

    if (roleToCheck && !allowedRoles.includes(roleToCheck)) {
      // Redirect to the user's appropriate dashboard based on their actual role
      const dashboard = getDashboardForRole(roleToCheck)
      console.log('[RouteGuard] Role mismatch, redirecting to:', dashboard, 'for role:', roleToCheck)
      router.push(dashboard)
    }
  }, [user, profile, isLoading, isProfileLoading, allowedRoles, router, pathname])

  // Show loading state while checking authentication or waiting for profile
  if (isLoading || shouldWaitForProfile) {
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

  // If role is not allowed, show nothing (redirect will happen via useEffect)
  if (effectiveRole && !allowedRoles.includes(effectiveRole)) {
    return null
  }

  return <>{children}</>
}
