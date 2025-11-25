"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Upload,
  Home,
  Inbox,
  Settings,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/lib/contexts/auth-context"
import { Role } from "@/lib/types"

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useUser()

  // Define navigation sections based on user role
  const getNavigationForRole = () => {
    if (!user) return []

    switch (user.role) {
      case Role.APPLICANT:
      case Role.CO_APPLICANT:
      case Role.GUARANTOR:
        // For applicants, show high-level navigation only
        // Application sections are handled by ApplicationSidebar
        return [
          {
            label: "My Applications",
            href: `/my-applications`,
            icon: Home,
          },
          {
            label: "Settings",
            href: `/settings`,
            icon: Settings,
          },
        ]

      case Role.BROKER:
        return [
          {
            label: "My Applications",
            href: `/my-applications`,
            icon: Home,
          },
          {
            label: "Pipeline",
            href: `/broker/pipeline`,
            icon: ClipboardList,
          },
          {
            label: "Settings",
            href: `/settings`,
            icon: Settings,
          },
        ]

      case Role.ADMIN:
        return [
          {
            label: "Applications Inbox",
            href: `/agent/inbox`,
            icon: Inbox,
          },
          {
            label: "Submit to Board",
            href: `/agent/submit`,
            icon: Upload,
          },
          {
            label: "Templates",
            href: `/agent/templates`,
            icon: Settings,
          },
        ]

      case Role.BOARD:
        return [
          {
            label: "Applications Overview",
            href: `/board`,
            icon: Home,
          },
          {
            label: "Pending Decisions",
            href: `/board/decisions`,
            icon: ClipboardList,
          },
        ]

      default:
        return []
    }
  }

  const sections = getNavigationForRole()

  const getSectionTitle = () => {
    if (!user) return "Navigation"

    switch (user.role) {
      case Role.APPLICANT:
      case Role.CO_APPLICANT:
      case Role.GUARANTOR:
        return "Main Menu"
      case Role.BROKER:
        return "Main Menu"
      case Role.ADMIN:
        return "Transaction Agent"
      case Role.BOARD:
        return "Board Review"
      default:
        return "Navigation"
    }
  }

  if (!user) return null

  return (
    <nav className="flex h-full flex-col gap-2 p-4">
      <div className="mb-2">
        <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {getSectionTitle()}
        </h2>
      </div>

      <div className="flex flex-col gap-1">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = pathname === section.href

          return (
            <Link
              key={section.href}
              href={section.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{section.label}</span>
              {('complete' in section && section.complete) ? (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  ✓
                </Badge>
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
