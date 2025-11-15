"use client"

import { RouteGuard } from "@/components/auth/route-guard"
import { Role } from "@/lib/types"

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard allowedRoles={[Role.BROKER]}>
      {children}
    </RouteGuard>
  )
}
