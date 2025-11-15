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
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-950">
      {/* Skip Links for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex">
        {showSidebar && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-r lg:bg-white dark:bg-gray-950 dark:border-gray-800" aria-label="Sidebar navigation">
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
        <main id="main-content" className={`flex-1 ${showSidebar ? 'lg:ml-64' : ''}`} tabIndex={-1}>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
