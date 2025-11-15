"use client"

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

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  // Mock user data - will be replaced with real data later
  const user = {
    name: "John Applicant",
    email: "john@example.com",
    role: "APPLICANT" as const,
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      APPLICANT: "Applicant",
      CO_APPLICANT: "Co-applicant",
      GUARANTOR: "Guarantor",
      BROKER: "Broker",
      ADMIN: "Admin",
      BOARD: "Board Member",
    }
    return labels[role] || role
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
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

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">philter</h1>
          </div>
        </div>

        {/* Right: Role Badge + Theme Toggle + User Menu */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="hidden sm:flex">
            {getRoleLabel(user.role)}
          </Badge>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {user.name.charAt(0)}
                </div>
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
              <DropdownMenuItem>My Applications</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
