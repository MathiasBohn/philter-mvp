"use client"

import { useEffect, useRef, useMemo } from "react"
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasRedirectedRef = useRef(false)

  // Compute whether we should wait for profile
  // This avoids setState in effect which causes the lint error
  const shouldWaitForProfile = useMemo(() => {
    // If still loading auth, not waiting yet
    if (isLoading) return false
    // If no user, not waiting (will redirect to sign-in)
    if (!user) return false
    // If profile loaded, not waiting
    if (profile) return false
    // If quick role matches, not waiting (optimistic access)
    if (user.role && allowedRoles.includes(user.role)) return false
    // Quick role doesn't match - need to wait for profile to confirm
    return true
  }, [isLoading, user, profile, allowedRoles])

  // Handle redirects
  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Reset redirect flag when dependencies change
    hasRedirectedRef.current = false

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

    // If we have the authoritative profile, check role access
    if (profile) {
      if (!allowedRoles.includes(profile.role)) {
        // Redirect to the user's appropriate dashboard based on their actual role
        const dashboard = getDashboardForRole(profile.role)
        console.log('[RouteGuard] Profile loaded, redirecting to:', dashboard, 'for role:', profile.role)
        router.push(dashboard)
      }
      return
    }

    // No profile yet - check if quick role allows access
    if (user.role && allowedRoles.includes(user.role)) {
      // Quick role matches - allow access (optimistic)
      return
    }

    // Quick role doesn't match allowed roles
    // Wait for profile to load, but set a timeout
    console.log('[RouteGuard] Quick role mismatch, waiting for profile...', { userRole: user.role, allowedRoles })

    timeoutRef.current = setTimeout(() => {
      // Only redirect if we still don't have profile
      if (!hasRedirectedRef.current && user.role && !allowedRoles.includes(user.role)) {
        console.log('[RouteGuard] Profile timeout, redirecting based on user.role:', user.role)
        hasRedirectedRef.current = true
        const dashboard = getDashboardForRole(user.role)
        router.push(dashboard)
      }
    }, 5000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [user, profile, isLoading, allowedRoles, router, pathname])

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

  // If we have profile and user doesn't have permission, show nothing (redirect happening)
  if (profile && !allowedRoles.includes(profile.role)) {
    return null
  }

  return <>{children}</>
}
