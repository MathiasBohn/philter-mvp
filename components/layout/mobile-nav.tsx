"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"

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
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 shadow-xl lg:hidden">
        <div className="flex h-16 items-center justify-between border-b dark:border-gray-800 px-4">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Sidebar onNavigate={onClose} />
      </div>
    </>
  )
}
