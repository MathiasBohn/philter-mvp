"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Briefcase,
  DollarSign,
  Upload,
  FileCheck,
  CheckCircle,
  Home,
  Inbox,
  Settings,
  ClipboardList,
  Eye,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/lib/user-context"
import { Role } from "@/lib/types"

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useUser()

  // Extract application ID from URL or use default
  const pathParts = pathname.split('/')

  // Determine application ID based on the current route structure
  let applicationId = "app-1" // default

  // Known broker route segments that are NOT application IDs
  const brokerRouteSegments = ['qa', 'new', 'prefill-wizard']

  if (pathname.startsWith('/applications/') && pathParts[2]) {
    // Pattern: /applications/[id]/...
    applicationId = pathParts[2]
  } else if (pathname.startsWith('/broker/') && pathParts[2] && !brokerRouteSegments.includes(pathParts[2])) {
    // Pattern: /broker/[id]/...
    // Exclude known route segments like 'qa', 'new', 'prefill-wizard'
    applicationId = pathParts[2]
  } else if (pathname.startsWith('/agent/review/') && pathParts[3]) {
    // Pattern: /agent/review/[id]
    applicationId = pathParts[3]
  } else if (pathname.startsWith('/board/review/') && pathParts[3]) {
    // Pattern: /board/review/[id]
    applicationId = pathParts[3]
  } else if (pathname.startsWith('/board/summary/') && pathParts[3]) {
    // Pattern: /board/summary/[id]
    applicationId = pathParts[3]
  }

  // Define navigation sections based on user role
  const getNavigationForRole = () => {
    if (!user) return []

    switch (user.role) {
      case Role.APPLICANT:
      case Role.CO_APPLICANT:
      case Role.GUARANTOR:
        return [
          {
            label: "Overview",
            href: `/applications/${applicationId}`,
            icon: Home,
            complete: false,
          },
          {
            label: "Profile",
            href: `/applications/${applicationId}/profile`,
            icon: User,
            complete: false,
          },
          {
            label: "Employment & Income",
            href: `/applications/${applicationId}/income`,
            icon: Briefcase,
            complete: false,
          },
          {
            label: "Financial Summary",
            href: `/applications/${applicationId}/financials`,
            icon: DollarSign,
            complete: false,
          },
          {
            label: "Documents",
            href: `/applications/${applicationId}/documents`,
            icon: Upload,
            complete: false,
          },
          {
            label: "Disclosures",
            href: `/applications/${applicationId}/disclosures`,
            icon: FileCheck,
            complete: false,
          },
          {
            label: "Review & Submit",
            href: `/applications/${applicationId}/review`,
            icon: CheckCircle,
            complete: false,
          },
        ]

      case Role.BROKER:
        return [
          {
            label: "Pipeline",
            href: `/broker`,
            icon: ClipboardList,
          },
          {
            label: "Review Applications",
            href: `/broker/qa`,
            icon: FileCheck,
          },
          {
            label: "Submit Applications",
            href: `/broker/submit`,
            icon: Upload,
          },
        ]

      case Role.ADMIN:
        return [
          {
            label: "Intake Inbox",
            href: `/agent/inbox`,
            icon: Inbox,
          },
          {
            label: "Review Workspace",
            href: `/agent/review/${applicationId}`,
            icon: Eye,
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
            label: "Dashboard",
            href: `/board`,
            icon: Home,
          },
          {
            label: "Application Summary",
            href: `/board/summary/${applicationId}`,
            icon: BarChart3,
          },
          {
            label: "Review Application",
            href: `/board/review/${applicationId}`,
            icon: Eye,
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
        return "Application Sections"
      case Role.BROKER:
        return "Broker Tools"
      case Role.ADMIN:
        return "Admin Tools"
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
              {'complete' in section && section.complete && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  ✓
                </Badge>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
