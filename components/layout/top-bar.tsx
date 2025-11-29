"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/lib/contexts/auth-context"
import { getRoleLabel } from "@/lib/constants/labels"
import { PhilterLogo } from "@/components/brand/philter-logo"
import { NotificationBell } from "@/components/layout/notification-bell"
import { Role } from "@/lib/types"
import { getDashboardForRole, getDashboardLabel } from "@/lib/routing"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    console.log('[TopBar] Starting sign out...')
    // Don't await - signOut clears state immediately, redirect right away
    // The Supabase network call happens in background with timeout
    signOut()
    // Use window.location for a full page reload to clear all state
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PhilterLogo size="sm" />
          </Link>
        </div>

        {/* Right: Role Badge + Notifications + Theme Toggle + User Menu */}
        <div className="flex items-center gap-4">
          {user && (
            <Badge variant="secondary" className="hidden sm:flex">
              {getRoleLabel(user.role)}
            </Badge>
          )}

          {user && <NotificationBell />}

          <ThemeToggle />

          {user && !isLoading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 rounded-full px-3 gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Role-specific dashboard link - always shown */}
                <DropdownMenuItem onClick={() => router.push(getDashboardForRole(user.role))}>
                  {getDashboardLabel(user.role)}
                </DropdownMenuItem>
                {/* Broker-specific: Quick link to pipeline (same as dashboard but clearer) */}
                {user.role === Role.BROKER && (
                  <DropdownMenuItem onClick={() => router.push('/broker/new')}>
                    Create Application
                  </DropdownMenuItem>
                )}
                {/* Agent-specific: Templates link */}
                {user.role === Role.ADMIN && (
                  <DropdownMenuItem onClick={() => router.push('/agent/templates')}>
                    Templates
                  </DropdownMenuItem>
                )}
                {/* Board-specific: Decisions link */}
                {user.role === Role.BOARD && (
                  <DropdownMenuItem onClick={() => router.push('/board/decisions')}>
                    Decisions
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/help-support')}>
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
