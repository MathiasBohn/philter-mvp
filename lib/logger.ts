/**
 * Secure Logger Utility
 *
 * Provides logging with log levels and automatic redaction of sensitive data.
 * In production, only warnings and errors are logged.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// In production, only log warnings and errors
const currentLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug'

// Keys that should be redacted from logs
const SENSITIVE_KEYS = [
  'token',
  'password',
  'ssn',
  'key',
  'secret',
  'authorization',
  'cookie',
  'session',
  'credential',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
  'id_token'
]

/**
 * Redact sensitive data from an object
 */
function redactSensitive(data: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...data }

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase()

    // Check if the key contains any sensitive keywords
    if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
      redacted[key] = '[REDACTED]'
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      // Recursively redact nested objects
      redacted[key] = redactSensitive(redacted[key] as Record<string, unknown>)
    }
  }

  return redacted
}

/**
 * Log a message with optional data
 *
 * @param level - Log level (debug, info, warn, error)
 * @param message - Log message
 * @param data - Optional data to include (sensitive fields will be redacted)
 */
export function logger(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) {
    return
  }

  // Redact sensitive fields from data
  const safeData = data ? redactSensitive(data) : undefined

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  const logFn = level === 'error'
    ? console.error
    : level === 'warn'
      ? console.warn
      : console.log

  if (safeData) {
    logFn(`${prefix} ${message}`, safeData)
  } else {
    logFn(`${prefix} ${message}`)
  }
}

/**
 * Convenience methods for different log levels
 */
export const log = {
  debug: (message: string, data?: Record<string, unknown>) =>
    logger('debug', message, data),

  info: (message: string, data?: Record<string, unknown>) =>
    logger('info', message, data),

  warn: (message: string, data?: Record<string, unknown>) =>
    logger('warn', message, data),

  error: (message: string, data?: Record<string, unknown>) =>
    logger('error', message, data)
}

/**
 * Check if debug logging is enabled
 */
export function isDebugEnabled(): boolean {
  return LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]
}
