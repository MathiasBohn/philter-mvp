"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"
import { PhilterLogo } from "@/components/brand/philter-logo"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-xl lg:hidden border-r border-border">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <PhilterLogo size="sm" />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Sidebar onNavigate={onClose} />
      </div>
    </>
  )
}
