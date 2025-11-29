/**
 * API Request Validation Utilities
 *
 * This module provides validation middleware for API routes using Zod schemas.
 * It ensures that request bodies, query parameters, and other inputs are validated
 * before processing.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema, ZodError } from 'zod'
import { ValidationError } from './errors'

// Lazy load DOMPurify to avoid serverless cold start issues
let DOMPurify: typeof import('isomorphic-dompurify').default | null = null

async function getDOMPurify() {
  if (!DOMPurify) {
    const module = await import('isomorphic-dompurify')
    DOMPurify = module.default
  }
  return DOMPurify
}

/**
 * Validate request body against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const data = await validateRequestBody(request, createApplicationSchema)
 *   // data is now typed and validated
 * }
 * ```
 */
export async function validateRequestBody<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    // Parse JSON body
    const body = await request.json().catch(() => {
      throw new ValidationError('Invalid JSON in request body')
    })

    // Validate against schema
    const result = schema.parse(body)
    return result
  } catch (error) {
    if (error instanceof ZodError) {
      // Re-throw as ZodError to be handled by error handler
      throw error
    }
    if (error instanceof ValidationError) {
      throw error
    }
    throw new ValidationError('Request validation failed')
  }
}

/**
 * Validate query parameters against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated and typed query parameters
 * @throws ValidationError if validation fails
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const params = validateQueryParams(request, querySchema)
 *   // params is now typed and validated
 * }
 * ```
 */
export function validateQueryParams<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  try {
    const { searchParams } = new URL(request.url)

    // Convert URLSearchParams to object
    const params: Record<string, string | string[]> = {}
    searchParams.forEach((value, key) => {
      const existing = params[key]
      if (existing) {
        // Handle multiple values for same key
        params[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value]
      } else {
        params[key] = value
      }
    })

    // Validate against schema
    const result = schema.parse(params)
    return result
  } catch (error) {
    if (error instanceof ZodError) {
      throw error
    }
    throw new ValidationError('Query parameter validation failed')
  }
}

/**
 * Validate route parameters against a Zod schema
 *
 * @param params - Route parameters from Next.js
 * @param schema - Zod schema to validate against
 * @returns Validated and typed route parameters
 * @throws ValidationError if validation fails
 *
 * @example
 * ```typescript
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: { id: string } }
 * ) {
 *   const validated = validateRouteParams(params, z.object({ id: z.string().uuid() }))
 *   // validated.id is now a valid UUID
 * }
 * ```
 */
export function validateRouteParams<T extends ZodSchema>(
  params: unknown,
  schema: T
): z.infer<T> {
  try {
    const result = schema.parse(params)
    return result
  } catch (error) {
    if (error instanceof ZodError) {
      throw error
    }
    throw new ValidationError('Route parameter validation failed')
  }
}

/**
 * Validate partial data (useful for PATCH requests)
 *
 * @param data - Data to validate
 * @param schema - Zod schema to validate against
 * @returns Validated and typed partial data
 * @throws ValidationError if validation fails
 *
 * @example
 * ```typescript
 * export async function PATCH(request: NextRequest) {
 *   const body = await request.json()
 *   const data = validatePartial(body, updateApplicationSchema)
 *   // Only provided fields are validated
 * }
 * ```
 */
export function validatePartial<T extends z.ZodObject<z.ZodRawShape>>(
  data: unknown,
  schema: T
): Partial<z.infer<T>> {
  try {
    // Make all fields optional for partial validation
    const partialSchema = schema.partial()
    const result = partialSchema.parse(data) as Partial<z.infer<T>>
    return result
  } catch (error) {
    if (error instanceof ZodError) {
      throw error
    }
    throw new ValidationError('Partial data validation failed')
  }
}

/**
 * UUID validation result type
 */
export type UUIDValidationResult =
  | { valid: true; id: string }
  | { valid: false; error: string }

/**
 * Validate a UUID string
 *
 * @param id - The string to validate as UUID
 * @returns Validation result with typed id if valid
 *
 * @example
 * ```typescript
 * const result = validateUUID(id)
 * if (!result.valid) {
 *   return NextResponse.json({ error: result.error }, { status: 400 })
 * }
 * // Use result.id (typed as string)
 * ```
 */
export function validateUUID(id: string): UUIDValidationResult {
  const uuidSchema = z.string().uuid('Invalid ID format')
  const result = uuidSchema.safeParse(id)

  if (result.success) {
    return { valid: true, id: result.data }
  }

  // Zod v4 uses issues instead of errors
  const issues = result.error.issues || []
  return {
    valid: false,
    error: issues[0]?.message || 'Invalid ID format',
  }
}

/**
 * Validate route params containing an ID
 * Returns a NextResponse if validation fails, null if valid
 *
 * @param params - Route params (can be Promise for Next.js 15+)
 * @returns Validated ID or error response
 *
 * @example
 * ```typescript
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: Promise<{ id: string }> }
 * ) {
 *   const validationResult = await validateRouteUUID(params)
 *   if (validationResult.error) {
 *     return validationResult.error
 *   }
 *   const { id } = validationResult
 *   // id is now validated as a UUID
 * }
 * ```
 */
export async function validateRouteUUID(
  params: Promise<{ id: string }> | { id: string }
): Promise<{ id: string; error?: never } | { error: NextResponse; id?: never }> {
  const resolvedParams = params instanceof Promise ? await params : params
  const validation = validateUUID(resolvedParams.id)

  if (!validation.valid) {
    return {
      error: NextResponse.json(
        { error: validation.error, code: 'INVALID_UUID' },
        { status: 400 }
      ),
    }
  }

  return { id: validation.id }
}

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  /**
   * UUID parameter schema
   */
  uuidParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  /**
   * Pagination query schema
   */
  pagination: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    cursor: z.string().optional(),
  }),

  /**
   * Search query schema
   */
  search: z.object({
    q: z.string().min(1, 'Search query cannot be empty').max(200),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),

  /**
   * Date range query schema
   */
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate
      }
      return true
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['startDate'],
    }
  ),

  /**
   * Sort query schema
   */
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  /**
   * Common filters schema
   */
  filters: z.object({
    status: z.string().optional(),
    buildingId: z.string().uuid().optional(),
    transactionType: z.string().optional(),
  }),
}

/**
 * Compose multiple validation schemas together
 *
 * @example
 * ```typescript
 * const listQuerySchema = composeSchemas(
 *   commonSchemas.pagination,
 *   commonSchemas.filters,
 *   commonSchemas.sort
 * )
 * ```
 */
export function composeSchemas<T extends z.ZodObject<z.ZodRawShape>[]>(...schemas: T) {
  return z.object(
    schemas.reduce((acc, schema) => {
      return { ...acc, ...schema.shape }
    }, {})
  )
}

/**
 * Sanitize string input to prevent XSS attacks.
 * Uses DOMPurify to remove all HTML/script content.
 */
export async function sanitizeString(input: string): Promise<string> {
  const purify = await getDOMPurify()
  // Remove all HTML/script content using DOMPurify
  const clean = purify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: []
  })
  return clean.trim()
}

/**
 * Sanitize rich text input where some HTML is allowed.
 * Use this for fields that explicitly support formatting.
 */
export async function sanitizeRichText(input: string): Promise<string> {
  const purify = await getDOMPurify()
  return purify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  }).trim()
}

/**
 * Sanitize object by applying sanitizeString to all string values
 */
export async function sanitizeObject<T extends Record<string, unknown>>(obj: T): Promise<T> {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    const value = sanitized[key]

    if (typeof value === 'string') {
      sanitized[key] = await sanitizeString(value) as T[typeof key]
    } else if (Array.isArray(value)) {
      sanitized[key] = await Promise.all(
        value.map(async (item: unknown) =>
          typeof item === 'string' ? await sanitizeString(item) : item
        )
      ) as T[typeof key]
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = await sanitizeObject(value as Record<string, unknown>) as T[typeof key]
    }
  }

  return sanitized
}
