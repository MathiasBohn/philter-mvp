"use client"

import { RouteGuard } from "@/components/auth/route-guard"
import { Role } from "@/lib/types"

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard allowedRoles={[Role.BOARD]}>
      {children}
    </RouteGuard>
  )
}
