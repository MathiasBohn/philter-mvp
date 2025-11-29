/**
 * CSRF Protection Utility
 *
 * Provides CSRF (Cross-Site Request Forgery) protection for state-changing API endpoints.
 * Uses the double-submit cookie pattern for stateless CSRF protection.
 *
 * How it works:
 * 1. A CSRF token is generated and stored in an HTTP-only cookie
 * 2. The same token is returned to the client to include in request headers
 * 3. On state-changing requests (POST, PUT, PATCH, DELETE), both values are compared
 *
 * Usage:
 * 1. Call generateCSRFToken() on initial page load to set the cookie
 * 2. Include the token in the 'x-csrf-token' header for all state-changing requests
 * 3. Use validateCSRFToken() or csrfMiddleware() to validate requests
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a new CSRF token and store it in a cookie
 *
 * @returns The generated token to send to the client
 *
 * @example
 * ```typescript
 * // In a server component or API route
 * const token = await generateCSRFToken()
 * // Return token to client to use in headers
 * ```
 */
export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    // Token expires in 24 hours
    maxAge: 60 * 60 * 24,
  })

  return token
}

/**
 * Get the current CSRF token from cookies (without generating a new one)
 *
 * @returns The current token or null if none exists
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null
}

/**
 * Validate a CSRF token from a request
 *
 * @param request - The incoming request
 * @returns true if the token is valid, false otherwise
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   if (!await validateCSRFToken(request)) {
 *     return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
 *   }
 *   // Process request...
 * }
 * ```
 */
export async function validateCSRFToken(request: Request): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
    const headerToken = request.headers.get(CSRF_HEADER_NAME)

    // Both tokens must be present
    if (!cookieToken || !headerToken) {
      return false
    }

    // Tokens must match (constant-time comparison to prevent timing attacks)
    return timingSafeEqual(cookieToken, headerToken)
  } catch {
    return false
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * CSRF validation result
 */
export interface CSRFValidationResult {
  valid: boolean
  error?: string
}

/**
 * CSRF middleware for API routes
 * Returns null if valid, or an error response if invalid
 *
 * @param request - The incoming request
 * @returns null if valid, NextResponse with error if invalid
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const csrfError = await csrfMiddleware(request)
 *   if (csrfError) return csrfError
 *
 *   // Process request...
 * }
 * ```
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const method = request.method.toUpperCase()

  // Only validate state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null
  }

  // Skip CSRF validation for:
  // 1. API routes that handle their own auth (like OAuth callbacks)
  // 2. Public APIs that use other authentication mechanisms
  const pathname = new URL(request.url).pathname

  // Allow auth callback routes (they use their own validation)
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/api/auth/callback')) {
    return null
  }

  // Validate CSRF token
  const isValid = await validateCSRFToken(request)

  if (!isValid) {
    return NextResponse.json(
      {
        error: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Your session may have expired. Please refresh the page and try again.',
      },
      { status: 403 }
    )
  }

  return null
}

/**
 * Higher-order function to wrap route handlers with CSRF protection
 *
 * @param handler - The route handler to wrap
 * @returns Wrapped handler with CSRF validation
 *
 * @example
 * ```typescript
 * import { withCSRFProtection } from '@/lib/csrf'
 *
 * export const POST = withCSRFProtection(async (request) => {
 *   // Your handler logic - CSRF is already validated
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */
export function withCSRFProtection<T extends NextRequest>(
  handler: (request: T) => Promise<NextResponse>
): (request: T) => Promise<NextResponse> {
  return async (request: T) => {
    const csrfError = await csrfMiddleware(request)
    if (csrfError) {
      return csrfError
    }

    return handler(request)
  }
}

/**
 * Get CSRF configuration for client-side use
 *
 * @returns Configuration object with header name and token endpoint
 */
export function getCSRFConfig() {
  return {
    headerName: CSRF_HEADER_NAME,
    cookieName: CSRF_COOKIE_NAME,
  }
}
