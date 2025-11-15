"use client"

import { RouteGuard } from "@/components/auth/route-guard"
import { Role } from "@/lib/types"

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard allowedRoles={[Role.APPLICANT, Role.CO_APPLICANT, Role.GUARANTOR, Role.BROKER]}>
      {children}
    </RouteGuard>
  )
}
