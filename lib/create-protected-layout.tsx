"use client"

import { ReactNode } from "react"
import { RouteGuard } from "@/components/auth/route-guard"
import { Role } from "@/lib/types"

/**
 * Factory function to create protected layout components
 * @param allowedRoles - Array of roles that are allowed to access this route
 * @returns A layout component that wraps children with RouteGuard
 *
 * @example
 * ```tsx
 * // app/(dashboard)/broker/layout.tsx
 * import { createProtectedLayout } from "@/lib/create-protected-layout"
 * import { Role } from "@/lib/types"
 *
 * export default createProtectedLayout([Role.BROKER])
 * ```
 */
export function createProtectedLayout(allowedRoles: Role[]) {
  return function ProtectedLayout({ children }: { children: ReactNode }) {
    return <RouteGuard allowedRoles={allowedRoles}>{children}</RouteGuard>
  }
}
