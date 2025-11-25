/**
 * Notification Bell Component
 *
 * Displays a bell icon with unread badge and dropdown with recent notifications.
 * Supports real-time updates for new notifications.
 *
 * @module components/layout/notification-bell
 */

'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDate } from '@/lib/utils'
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications'
import Link from 'next/link'

interface NotificationBellProps {
  /** Additional class names */
  className?: string
}

/**
 * Get icon/color for notification type
 */
function getNotificationStyle(type: string): { icon: string; color: string } {
  switch (type) {
    case 'APPLICATION_SUBMITTED':
      return { icon: '📋', color: 'text-blue-500' }
    case 'RFI_CREATED':
      return { icon: '❓', color: 'text-orange-500' }
    case 'RFI_MESSAGE':
      return { icon: '💬', color: 'text-purple-500' }
    case 'RFI_RESOLVED':
      return { icon: '✅', color: 'text-green-500' }
    case 'DECISION_MADE':
      return { icon: '🎯', color: 'text-emerald-500' }
    case 'DOCUMENT_UPLOADED':
      return { icon: '📄', color: 'text-cyan-500' }
    case 'APPLICATION_STATUS_CHANGED':
      return { icon: '🔄', color: 'text-amber-500' }
    case 'INVITATION_RECEIVED':
      return { icon: '✉️', color: 'text-indigo-500' }
    case 'INVITATION_ACCEPTED':
      return { icon: '🤝', color: 'text-teal-500' }
    default:
      return { icon: '🔔', color: 'text-gray-500' }
  }
}

/**
 * Format relative time
 */
function formatRelativeTime(date: string): string {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return formatDate(notificationDate, 'short')
}

/**
 * Single notification item
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onClose
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onClose: () => void
}) {
  const { icon, color } = getNotificationStyle(notification.type)

  const handleClick = async () => {
    if (!notification.read) {
      await onMarkAsRead(notification.id)
    }
    onClose()
  }

  const content = (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-md transition-colors cursor-pointer',
        !notification.read && 'bg-muted/50',
        'hover:bg-muted'
      )}
      onClick={handleClick}
    >
      <span className={cn('text-lg', color)}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium truncate',
              !notification.read && 'font-semibold'
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      {notification.link && (
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
      )}
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return content
}

/**
 * Notification Bell Component
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isRealtimeConnected
  } = useNotifications({
    realtime: true,
    showToasts: true,
    limit: 20
  })

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {isRealtimeConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you when something happens
              </p>
            </div>
          ) : (
            <DropdownMenuGroup className="p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-0 focus:bg-transparent"
                  onSelect={(e) => e.preventDefault()}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClose={() => setOpen(false)}
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="w-full text-center text-sm cursor-pointer"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Compact notification badge (just the count)
 */
export function NotificationBadge({ className }: { className?: string }) {
  const { unreadCount } = useNotifications({ realtime: true, showToasts: false, limit: 0 })

  if (unreadCount === 0) return null

  return (
    <Badge variant="destructive" className={cn('h-5 min-w-[20px] px-1 text-xs', className)}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  )
}
