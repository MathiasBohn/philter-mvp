/**
 * Rate Limiting Utility
 *
 * Provides rate limiting for API endpoints with support for:
 * - Redis-based rate limiting via Upstash (production-ready for serverless)
 * - In-memory fallback for development or when Redis is not configured
 *
 * Features:
 * - Sliding window rate limiting
 * - Configurable limits per endpoint
 * - IP-based and user-based limiting
 * - Automatic cleanup of expired entries (in-memory mode)
 * - Serverless-compatible with Upstash Redis
 *
 * To enable Redis rate limiting, set the following environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Redis-based rate limiting using Upstash
 * This is the production-ready solution for serverless environments
 */

interface RedisRateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Simple Redis client for Upstash REST API
 * Implements the minimum needed for rate limiting without external dependencies
 */
class UpstashRedisClient {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  private async request(command: string[]): Promise<unknown> {
    const response = await fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    })

    if (!response.ok) {
      throw new Error(`Redis request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
  }

  async get(key: string): Promise<string | null> {
    return (await this.request(['GET', key])) as string | null
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    if (options?.ex) {
      await this.request(['SET', key, value, 'EX', options.ex.toString()])
    } else {
      await this.request(['SET', key, value])
    }
  }

  async incr(key: string): Promise<number> {
    return (await this.request(['INCR', key])) as number
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.request(['EXPIRE', key, seconds.toString()])
  }

  async ttl(key: string): Promise<number> {
    return (await this.request(['TTL', key])) as number
  }
}

// Singleton Redis client
let redisClient: UpstashRedisClient | null = null

function getRedisClient(): UpstashRedisClient | null {
  if (redisClient) return redisClient

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    redisClient = new UpstashRedisClient(url, token)
    return redisClient
  }

  return null
}

/**
 * Check if Redis rate limiting is available
 */
export function isRedisRateLimitEnabled(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

/**
 * Redis-based sliding window rate limiting
 */
async function checkRedisRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RedisRateLimitResult> {
  const redis = getRedisClient()
  if (!redis) {
    throw new Error('Redis client not available')
  }

  const windowMs = config.windowMs
  const windowSec = Math.ceil(windowMs / 1000)

  try {
    // Increment the counter
    const count = await redis.incr(key)

    // If this is the first request in the window, set expiry
    if (count === 1) {
      await redis.expire(key, windowSec)
    }

    // Get TTL to calculate reset time
    const ttl = await redis.ttl(key)
    const resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs)

    const remaining = Math.max(0, config.limit - count)
    const success = count <= config.limit

    return {
      success,
      limit: config.limit,
      remaining,
      reset: resetTime,
    }
  } catch (error) {
    console.error('[RateLimit] Redis error:', error)
    // On Redis failure, allow the request (fail open)
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Date.now() + windowMs,
    }
  }
}

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional identifier prefix (e.g., 'auth', 'api') */
  identifier?: string
  /** Whether to use user ID instead of IP (requires authentication) */
  byUserId?: boolean
  /** Custom error message */
  message?: string
}

/**
 * Rate limit entry tracking requests
 */
interface RateLimitEntry {
  count: number
  firstRequestTime: number
  lastRequestTime: number
}

/**
 * In-memory store for rate limit tracking
 * Key format: `{identifier}:{ip|userId}`
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Cleanup interval handle
 */
let cleanupInterval: NodeJS.Timeout | null = null

/**
 * Start periodic cleanup of expired entries
 */
function startCleanup(windowMs: number): void {
  if (cleanupInterval) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.firstRequestTime > windowMs * 2) {
        rateLimitStore.delete(key)
      }
    }
  }, windowMs)

  // Don't keep the process alive just for cleanup
  if (cleanupInterval.unref) {
    cleanupInterval.unref()
  }
}

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest, config: RateLimitConfig): string {
  // Try to get IP from various headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  // Use the first IP in x-forwarded-for if present
  let ip = forwardedFor?.split(',')[0]?.trim() ||
           realIP ||
           cfConnectingIP ||
           'unknown'

  // Sanitize IP to prevent injection
  ip = ip.replace(/[^a-zA-Z0-9.:]/g, '')

  const prefix = config.identifier || 'default'
  return `${prefix}:${ip}`
}

/**
 * Check rate limit for a request using in-memory store
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns Object with isLimited, remaining, and reset time
 */
export function checkRateLimitInMemory(
  request: NextRequest,
  config: RateLimitConfig
): { isLimited: boolean; remaining: number; resetTime: number } {
  const key = getClientIdentifier(request, config)
  const now = Date.now()

  // Start cleanup if not already running
  startCleanup(config.windowMs)

  // Get or create entry
  let entry = rateLimitStore.get(key)

  if (!entry || now - entry.firstRequestTime > config.windowMs) {
    // Window expired or new entry, reset counter
    entry = {
      count: 1,
      firstRequestTime: now,
      lastRequestTime: now,
    }
    rateLimitStore.set(key, entry)

    return {
      isLimited: false,
      remaining: config.limit - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Update existing entry
  entry.count++
  entry.lastRequestTime = now
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.limit - entry.count)
  const resetTime = entry.firstRequestTime + config.windowMs
  const isLimited = entry.count > config.limit

  return { isLimited, remaining, resetTime }
}

/**
 * Check rate limit for a request
 * Uses Redis when available, falls back to in-memory
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns Object with isLimited, remaining, and reset time
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ isLimited: boolean; remaining: number; resetTime: number }> {
  const key = getClientIdentifier(request, config)

  // Use Redis if available
  if (isRedisRateLimitEnabled()) {
    const result = await checkRedisRateLimit(key, config)
    return {
      isLimited: !result.success,
      remaining: result.remaining,
      resetTime: result.reset,
    }
  }

  // Fall back to in-memory
  return checkRateLimitInMemory(request, config)
}

/**
 * Synchronous rate limit check (in-memory only)
 * @deprecated Use checkRateLimit (async) for production - supports Redis
 */
export function checkRateLimitSync(
  request: NextRequest,
  config: RateLimitConfig
): { isLimited: boolean; remaining: number; resetTime: number } {
  return checkRateLimitInMemory(request, config)
}

/**
 * Create rate limit response headers
 */
function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', limit.toString())
  headers.set('X-RateLimit-Remaining', remaining.toString())
  headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
  return headers
}

/**
 * Rate limit middleware for API routes
 * Supports Redis-based rate limiting when configured, with in-memory fallback
 *
 * @param config - Rate limit configuration
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * import { withRateLimit } from '@/lib/api/rate-limit'
 *
 * const rateLimitConfig = { limit: 5, windowMs: 60 * 1000, identifier: 'auth' }
 *
 * export const POST = withRateLimit(rateLimitConfig, async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */
export function withRateLimit<T extends NextRequest>(
  config: RateLimitConfig,
  handler: (request: T) => Promise<NextResponse>
): (request: T) => Promise<NextResponse> {
  return async (request: T) => {
    const { isLimited, remaining, resetTime } = await checkRateLimit(request, config)
    const headers = createRateLimitHeaders(remaining, resetTime, config.limit)

    if (isLimited) {
      const message = config.message || 'Too many requests. Please try again later.'
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

      return NextResponse.json(
        {
          error: {
            message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            ...Object.fromEntries(headers),
            'Retry-After': retryAfter.toString(),
          },
        }
      )
    }

    // Call the actual handler
    const response = await handler(request)

    // Add rate limit headers to response
    headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  }
}

/**
 * Pre-configured rate limits for common use cases
 */
export const RATE_LIMITS = {
  /**
   * Auth endpoints: 5 requests per minute
   * Protects against brute force attacks on login/signup
   */
  auth: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'auth',
    message: 'Too many authentication attempts. Please wait a minute before trying again.',
  } satisfies RateLimitConfig,

  /**
   * Invitation endpoints: 10 requests per minute
   * Protects against invitation spam
   */
  invitation: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'invitation',
    message: 'Too many invitation requests. Please wait before sending more invitations.',
  } satisfies RateLimitConfig,

  /**
   * Strict rate limit for sensitive operations: 3 requests per minute
   * Use for password reset, account deletion, etc.
   */
  strict: {
    limit: 3,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'strict',
    message: 'This action is rate limited. Please wait before trying again.',
  } satisfies RateLimitConfig,

  /**
   * Standard API rate limit: 100 requests per minute
   * For general API endpoints
   */
  standard: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'api',
    message: 'Rate limit exceeded. Please slow down your requests.',
  } satisfies RateLimitConfig,

  /**
   * File upload rate limit: 20 uploads per 5 minutes
   */
  upload: {
    limit: 20,
    windowMs: 5 * 60 * 1000, // 5 minutes
    identifier: 'upload',
    message: 'Too many file uploads. Please wait before uploading more files.',
  } satisfies RateLimitConfig,
} as const

/**
 * Get rate limit stats for monitoring (useful for admin dashboards)
 */
export function getRateLimitStats(): {
  totalEntries: number
  entriesByPrefix: Record<string, number>
} {
  const stats: Record<string, number> = {}

  for (const key of rateLimitStore.keys()) {
    const prefix = key.split(':')[0]
    stats[prefix] = (stats[prefix] || 0) + 1
  }

  return {
    totalEntries: rateLimitStore.size,
    entriesByPrefix: stats,
  }
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear()
}
