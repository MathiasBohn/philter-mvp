/**
 * Real-Time Hooks Index
 *
 * Re-exports all real-time related hooks for easier importing.
 *
 * @module lib/hooks/realtime
 *
 * @example
 * ```typescript
 * import {
 *   useRealtimeApplication,
 *   useRealtimeRFI,
 *   useRealtimeDocuments,
 *   usePresence,
 *   useTypingIndicator,
 *   useNotifications
 * } from '@/lib/hooks/realtime'
 * ```
 */

// Application real-time hooks
export {
  useRealtimeApplication,
  useRealtimeApplicationList
} from './use-realtime-application'

// RFI real-time hooks
export {
  useRealtimeRFI,
  useRealtimeApplicationRFIs
} from './use-realtime-rfi'

// Document real-time hooks
export { useRealtimeDocuments } from './use-realtime-documents'

// Presence hooks
export { usePresence, useOnlineCount, type PresenceUser } from './use-presence'

// Typing indicator hooks
export { useTypingIndicator } from './use-typing-indicator'

// Notification hooks
export {
  useNotifications,
  useUnreadNotificationCount,
  type Notification,
  type NotificationType
} from './use-notifications'
