/**
 * Presence Indicators Component
 *
 * Displays avatars of users currently viewing the same application.
 * Shows tooltip with user name and current section on hover.
 *
 * @module components/shared/presence-indicators
 */

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { PresenceUser } from '@/lib/hooks/use-presence'

interface PresenceIndicatorsProps {
  /** List of present users */
  users: PresenceUser[]
  /** Maximum number of avatars to show */
  maxDisplay?: number
  /** Size of the avatars */
  size?: 'sm' | 'md' | 'lg'
  /** Current user ID (to exclude from display) */
  currentUserId?: string
  /** Additional class names */
  className?: string
  /** Whether to show the online badge */
  showOnlineBadge?: boolean
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base'
}

const overlapClasses = {
  sm: '-ml-2',
  md: '-ml-3',
  lg: '-ml-4'
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * Get a consistent color for a user based on their ID
 */
function getUserColor(userId: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-amber-500',
    'bg-rose-500'
  ]
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/**
 * Format section name for display
 */
function formatSection(section?: string): string {
  if (!section) return 'Viewing application'
  return section
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Presence Indicators Component
 */
export function PresenceIndicators({
  users,
  maxDisplay = 5,
  size = 'md',
  currentUserId,
  className,
  showOnlineBadge = true
}: PresenceIndicatorsProps) {
  // Filter out current user
  const otherUsers = currentUserId
    ? users.filter((u) => u.id !== currentUserId)
    : users

  if (otherUsers.length === 0) {
    return null
  }

  const displayUsers = otherUsers.slice(0, maxDisplay)
  const remainingCount = otherUsers.length - maxDisplay

  return (
    <TooltipProvider>
      <div className={cn('flex items-center', className)}>
        <div className="flex items-center">
          {displayUsers.map((user, index) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'relative',
                    index > 0 && overlapClasses[size]
                  )}
                >
                  <Avatar
                    className={cn(
                      sizeClasses[size],
                      'border-2 border-background ring-2 ring-background'
                    )}
                  >
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback
                      className={cn(
                        getUserColor(user.id),
                        'text-white font-medium'
                      )}
                    >
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {showOnlineBadge && (
                    <span
                      className={cn(
                        'absolute bottom-0 right-0 block rounded-full bg-green-400 ring-2 ring-background',
                        size === 'sm' && 'h-1.5 w-1.5',
                        size === 'md' && 'h-2 w-2',
                        size === 'lg' && 'h-2.5 w-2.5'
                      )}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="font-medium">{user.name}</div>
                {user.role && (
                  <div className="text-muted-foreground capitalize">
                    {user.role.toLowerCase().replace(/_/g, ' ')}
                  </div>
                )}
                <div className="text-muted-foreground">
                  {formatSection(user.currentSection)}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={overlapClasses[size]}>
                  <Avatar
                    className={cn(
                      sizeClasses[size],
                      'border-2 border-background ring-2 ring-background bg-muted'
                    )}
                  >
                    <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="font-medium">
                  {remainingCount} more {remainingCount === 1 ? 'person' : 'people'} viewing
                </div>
                <div className="text-muted-foreground mt-1">
                  {otherUsers.slice(maxDisplay).map((u) => u.name).join(', ')}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {otherUsers.length > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">
            {otherUsers.length} {otherUsers.length === 1 ? 'viewer' : 'viewers'}
          </span>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Compact online indicator (just count)
 */
export function OnlineCount({
  count,
  className
}: {
  count: number
  className?: string
}) {
  if (count <= 1) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>{count} online</span>
    </div>
  )
}
