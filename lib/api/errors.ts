/**
 * API Error Handling Utilities
 *
 * This module provides standardized error types, formatters, and logging
 * for API routes to ensure consistent error responses across the application.
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Base error class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR')
  }
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: {
    message: string
    code?: string
    details?: unknown
    timestamp: string
    path?: string
  }
}

/**
 * Format error response for API
 */
export function formatErrorResponse(
  error: Error | APIError | ZodError,
  path?: string
): ErrorResponse {
  const timestamp = new Date().toISOString()

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        timestamp,
        path,
      },
    }
  }

  // Handle custom API errors
  if (error instanceof APIError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp,
        path,
      },
    }
  }

  // Handle generic errors (don't expose internal details in production)
  const isDevelopment = process.env.NODE_ENV === 'development'
  return {
    error: {
      message: isDevelopment ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      details: isDevelopment ? { stack: error.stack } : undefined,
      timestamp,
      path,
    },
  }
}

/**
 * Create error response with appropriate status code
 */
export function createErrorResponse(
  error: Error | APIError | ZodError,
  path?: string
): NextResponse<ErrorResponse> {
  const statusCode =
    error instanceof APIError ? error.statusCode :
    error instanceof ZodError ? 400 :
    500

  const formattedError = formatErrorResponse(error, path)

  // Log error server-side
  logError(error, { path, statusCode })

  return NextResponse.json(formattedError, { status: statusCode })
}

/**
 * Log error to console (and optionally to external service)
 */
export function logError(
  error: Error | APIError | ZodError,
  context?: {
    path?: string
    statusCode?: number
    userId?: string
    requestId?: string
    [key: string]: unknown
  }
): void {
  const logEntry = {
    level: 'error',
    message: error.message,
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', JSON.stringify(logEntry, null, 2))
  } else {
    // Structured logging for production
    console.error(JSON.stringify(logEntry))
  }

  // TODO: Send to external logging service (Sentry, LogRocket, etc.)
  // Example:
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { contexts: { custom: context } })
  // }
}

/**
 * Async error handler wrapper for API routes
 *
 * Usage:
 * ```typescript
 * export const GET = withErrorHandler(async (request) => {
 *   // Your handler code
 * })
 * ```
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      // Get request path from args if available
      const request = args[0] as Request | undefined
      const path = request?.url

      // Handle known error types
      if (error instanceof Error || error instanceof ZodError) {
        return createErrorResponse(error, path)
      }

      // Handle unknown error types
      return createErrorResponse(new InternalServerError(), path)
    }
  }) as T
}

/**
 * Assert that a value is defined (not null or undefined)
 * Throws NotFoundError if the value is null or undefined
 */
export function assertExists<T>(
  value: T | null | undefined,
  resourceName: string = 'Resource'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resourceName)
  }
}

/**
 * Assert that user is authenticated
 * Throws AuthenticationError if userId is null or undefined
 */
export function assertAuthenticated(
  userId: string | null | undefined
): asserts userId is string {
  if (!userId) {
    throw new AuthenticationError()
  }
}

/**
 * Assert that user has required role
 * Throws AuthorizationError if user doesn't have the role
 */
export function assertAuthorized(
  condition: boolean,
  message: string = 'Insufficient permissions'
): asserts condition {
  if (!condition) {
    throw new AuthorizationError(message)
  }
}
