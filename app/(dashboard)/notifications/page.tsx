/**
 * Notifications Page
 *
 * Displays all user notifications with filtering and bulk actions.
 *
 * @module app/(dashboard)/notifications/page
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Check, CheckCheck, Loader2, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatDate } from '@/lib/utils'
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader } from '@/components/ui/page-header'

/**
 * Get icon/color for notification type
 */
function getNotificationStyle(type: string): { icon: string; color: string; bgColor: string } {
  switch (type) {
    case 'APPLICATION_SUBMITTED':
      return { icon: '📋', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'RFI_CREATED':
      return { icon: '❓', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    case 'RFI_MESSAGE':
      return { icon: '💬', color: 'text-purple-600', bgColor: 'bg-purple-50' }
    case 'RFI_RESOLVED':
      return { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'DECISION_MADE':
      return { icon: '🎯', color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
    case 'DOCUMENT_UPLOADED':
      return { icon: '📄', color: 'text-cyan-600', bgColor: 'bg-cyan-50' }
    case 'APPLICATION_STATUS_CHANGED':
      return { icon: '🔄', color: 'text-amber-600', bgColor: 'bg-amber-50' }
    case 'INVITATION_RECEIVED':
      return { icon: '✉️', color: 'text-indigo-600', bgColor: 'bg-indigo-50' }
    case 'INVITATION_ACCEPTED':
      return { icon: '🤝', color: 'text-teal-600', bgColor: 'bg-teal-50' }
    default:
      return { icon: '🔔', color: 'text-gray-600', bgColor: 'bg-gray-50' }
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
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(notificationDate, 'short')
}

/**
 * Notification Card Component
 */
function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { icon, bgColor } = getNotificationStyle(notification.type)

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        !notification.read && 'border-primary/30 bg-primary/5'
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center text-lg flex-shrink-0',
              bgColor
            )}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={cn(
                    'text-sm',
                    !notification.read ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {notification.title}
                </h3>
                {notification.message && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(notification.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(notification.created_at)}
              </p>

              {notification.link && (
                <Link href={notification.link}>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    View details
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state component
 */
function EmptyState({ filter }: { filter: 'all' | 'read' | 'unread' }) {
  const messages = {
    all: 'No notifications yet',
    read: 'No read notifications',
    unread: 'All caught up!'
  }

  const descriptions = {
    all: "We'll notify you when something important happens",
    read: 'Notifications you\'ve read will appear here',
    unread: 'You have no unread notifications'
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{messages[filter]}</h3>
      <p className="text-sm text-muted-foreground mt-1">{descriptions[filter]}</p>
    </div>
  )
}

/**
 * Notifications Page
 */
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isRealtimeConnected
  } = useNotifications({
    realtime: true,
    showToasts: false,
    limit: 100,
    readFilter: activeTab === 'unread' ? 'unread' : 'all'
  })

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Stay updated with your application activity"
      />

      <div className="space-y-6">
        {/* Stats and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {unreadCount} unread
            </Badge>
            {isRealtimeConnected && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Live updates
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <EmptyState filter="all" />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <EmptyState filter="unread" />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Error state */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">
                Failed to load notifications: {error.message}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
