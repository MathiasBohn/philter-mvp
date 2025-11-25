/**
 * Typing Indicator Component
 *
 * Shows animated "User is typing..." indicator in message threads.
 *
 * @module components/shared/typing-indicator
 */

'use client'

import { cn } from '@/lib/utils'

interface TypingUser {
  id: string
  name: string
}

interface TypingIndicatorProps {
  /** List of users currently typing */
  users: TypingUser[]
  /** Additional class names */
  className?: string
  /** Whether to show the animated dots */
  showDots?: boolean
}

/**
 * Animated dots component
 */
function AnimatedDots() {
  return (
    <span className="inline-flex items-center ml-1">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s]">.</span>
      <span className="animate-bounce">.</span>
    </span>
  )
}

/**
 * Format typing users into a readable string
 */
function formatTypingUsers(users: TypingUser[]): string {
  if (users.length === 0) return ''
  if (users.length === 1) return users[0].name
  if (users.length === 2) return `${users[0].name} and ${users[1].name}`
  return `${users[0].name} and ${users.length - 1} others`
}

/**
 * Typing Indicator Component
 *
 * @example
 * ```tsx
 * function MessageThread({ typingUsers }) {
 *   return (
 *     <div>
 *       <MessageList />
 *       <TypingIndicator users={typingUsers} />
 *       <MessageInput />
 *     </div>
 *   )
 * }
 * ```
 */
export function TypingIndicator({
  users,
  className,
  showDots = true
}: TypingIndicatorProps) {
  if (users.length === 0) {
    return null
  }

  const typingText = formatTypingUsers(users)
  const verb = users.length === 1 ? 'is' : 'are'

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground',
        className
      )}
    >
      <TypingAnimation />
      <span>
        <span className="font-medium">{typingText}</span>
        {' '}{verb} typing
        {showDots && <AnimatedDots />}
      </span>
    </div>
  )
}

/**
 * Animated typing bubble (alternative visual)
 */
function TypingAnimation() {
  return (
    <div className="flex items-center space-x-1">
      <div
        className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse"
        style={{ animationDelay: '0ms' }}
      />
      <div
        className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse"
        style={{ animationDelay: '150ms' }}
      />
      <div
        className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}

/**
 * Compact typing indicator for tight spaces
 */
export function TypingIndicatorCompact({
  users,
  className
}: Omit<TypingIndicatorProps, 'showDots'>) {
  if (users.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs text-muted-foreground',
        className
      )}
    >
      <TypingAnimation />
    </div>
  )
}

/**
 * Typing indicator specifically for RFI/chat contexts
 */
export function RFITypingIndicator({
  users,
  className
}: TypingIndicatorProps) {
  if (users.length === 0) {
    return null
  }

  const typingText = formatTypingUsers(users)
  const verb = users.length === 1 ? 'is' : 'are'

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-200',
        className
      )}
    >
      <div className="flex items-center space-x-0.5">
        <div
          className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
        />
        <div
          className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: '150ms', animationDuration: '0.6s' }}
        />
        <div
          className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: '300ms', animationDuration: '0.6s' }}
        />
      </div>
      <span>
        {typingText} {verb} typing...
      </span>
    </div>
  )
}
