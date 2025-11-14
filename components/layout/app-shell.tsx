"use client"

import { ReactNode, useState } from "react"
import { TopBar } from "./top-bar"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"

interface AppShellProps {
  children: ReactNode
  showSidebar?: boolean
}

export function AppShell({ children, showSidebar = true }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex">
        {showSidebar && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-r lg:bg-white">
              <Sidebar />
            </aside>

            {/* Mobile Navigation */}
            <MobileNav
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            />
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? 'lg:ml-64' : ''}`}>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
