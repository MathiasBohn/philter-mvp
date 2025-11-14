"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  User,
  Briefcase,
  DollarSign,
  Upload,
  FileCheck,
  CheckCircle,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()

  // Mock application ID - will be dynamic later
  const applicationId = "app_123"

  const sections = [
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

  return (
    <nav className="flex h-full flex-col gap-2 p-4">
      <div className="mb-2">
        <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Application Sections
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
              {section.complete && (
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
