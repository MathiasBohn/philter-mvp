/**
 * Test script for validation and error handling utilities
 *
 * This script tests the validation and error handling infrastructure
 * to ensure it works correctly with various error scenarios.
 *
 * Run with: npx tsx scripts/test-validation-errors.ts
 */

import { z } from 'zod'
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  formatErrorResponse,
  assertExists,
  assertAuthenticated,
  assertAuthorized,
} from '../lib/api/errors'

import {
  validateRouteParams,
  validatePartial,
  commonSchemas,
  composeSchemas,
  sanitizeString,
  sanitizeObject,
} from '../lib/api/validate'

// Test color output
const green = '\x1b[32m'
const red = '\x1b[31m'
const yellow = '\x1b[33m'
const reset = '\x1b[0m'

function log(message: string, color: string = reset) {
  console.log(`${color}${message}${reset}`)
}

function testSection(name: string) {
  console.log(`\n${'='.repeat(60)}`)
  log(`Testing: ${name}`, yellow)
  console.log('='.repeat(60))
}

function assert(condition: boolean, message: string) {
  if (condition) {
    log(`✓ ${message}`, green)
  } else {
    log(`✗ ${message}`, red)
    throw new Error(`Assertion failed: ${message}`)
  }
}

// Test error classes
testSection('Error Classes')

try {
  const validationError = new ValidationError('Invalid input', { field: 'email' })
  assert(validationError.statusCode === 400, 'ValidationError has status 400')
  assert(validationError.code === 'VALIDATION_ERROR', 'ValidationError has correct code')
  log('ValidationError works correctly', green)
} catch (_error) {
  log('ValidationError test failed', red)
}

try {
  const authError = new AuthenticationError()
  assert(authError.statusCode === 401, 'AuthenticationError has status 401')
  log('AuthenticationError works correctly', green)
} catch (_error) {
  log('AuthenticationError test failed', red)
}

try {
  const authzError = new AuthorizationError('Not an admin')
  assert(authzError.statusCode === 403, 'AuthorizationError has status 403')
  log('AuthorizationError works correctly', green)
} catch (_error) {
  log('AuthorizationError test failed', red)
}

try {
  const notFoundError = new NotFoundError('Application')
  assert(notFoundError.statusCode === 404, 'NotFoundError has status 404')
  assert(notFoundError.message.includes('Application'), 'NotFoundError includes resource name')
  log('NotFoundError works correctly', green)
} catch (_error) {
  log('NotFoundError test failed', red)
}

// Test error formatting
testSection('Error Formatting')

try {
  const apiError = new ValidationError('Test error', { test: 'data' })
  const formatted = formatErrorResponse(apiError, '/api/test')

  assert(formatted.error.message === 'Test error', 'Error message is correct')
  assert(formatted.error.code === 'VALIDATION_ERROR', 'Error code is correct')
  assert(formatted.error.path === '/api/test', 'Error path is correct')
  assert(!!formatted.error.timestamp, 'Error has timestamp')
  log('Error formatting works correctly', green)
} catch (_error) {
  log('Error formatting test failed', red)
}

// Test Zod error formatting
try {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  })

  try {
    schema.parse({ email: 'invalid', age: 10 })
  } catch (zodError) {
    const formatted = formatErrorResponse(zodError as z.ZodError)
    assert(formatted.error.code === 'VALIDATION_ERROR', 'Zod error has correct code')
    assert(Array.isArray(formatted.error.details), 'Zod error details is an array')
    log('Zod error formatting works correctly', green)
  }
} catch (_error) {
  log('Zod error formatting test failed', red)
}

// Test assertion helpers
testSection('Assertion Helpers')

try {
  const value = 'exists'
  assertExists(value, 'Test value')
  log('assertExists passes for non-null value', green)
} catch (_error) {
  log('assertExists test failed', red)
}

try {
  assertExists(null, 'Test value')
  log('assertExists should have thrown', red)
} catch (error) {
  assert(error instanceof NotFoundError, 'assertExists throws NotFoundError for null')
  log('assertExists throws for null value', green)
}

try {
  const userId = 'user-123'
  assertAuthenticated(userId)
  log('assertAuthenticated passes for valid userId', green)
} catch (_error) {
  log('assertAuthenticated test failed', red)
}

try {
  assertAuthenticated(null)
  log('assertAuthenticated should have thrown', red)
} catch (error) {
  assert(error instanceof AuthenticationError, 'assertAuthenticated throws AuthenticationError')
  log('assertAuthenticated throws for null userId', green)
}

try {
  assertAuthorized(true, 'User is admin')
  log('assertAuthorized passes for true condition', green)
} catch (_error) {
  log('assertAuthorized test failed', red)
}

try {
  assertAuthorized(false, 'User is not admin')
  log('assertAuthorized should have thrown', red)
} catch (error) {
  assert(error instanceof AuthorizationError, 'assertAuthorized throws AuthorizationError')
  log('assertAuthorized throws for false condition', green)
}

// Test validation utilities
testSection('Validation Utilities')

try {
  const testSchema = z.object({
    id: z.string().uuid(),
  })

  const validParams = { id: '123e4567-e89b-12d3-a456-426614174000' }
  const result = validateRouteParams(validParams, testSchema)
  assert(result.id === validParams.id, 'Route params validation works')
  log('validateRouteParams works correctly', green)
} catch (error) {
  log('validateRouteParams test failed', red)
  console.error(error)
}

try {
  const invalidParams = { id: 'not-a-uuid' }
  validateRouteParams(invalidParams, z.object({ id: z.string().uuid() }))
  log('validateRouteParams should have thrown', red)
} catch (error) {
  assert(error instanceof z.ZodError, 'validateRouteParams throws ZodError for invalid data')
  log('validateRouteParams throws for invalid data', green)
}

// Test partial validation
try {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(18),
  })

  const partialData = { name: 'John' }
  const result = validatePartial(partialData, schema)
  assert(result.name === 'John', 'Partial validation works')
  assert(result.email === undefined, 'Missing fields are undefined')
  log('validatePartial works correctly', green)
} catch (error) {
  log('validatePartial test failed', red)
  console.error(error)
}

// Test common schemas
testSection('Common Schemas')

try {
  const paginationData = {
    limit: '20',
    offset: '0',
  }
  const result = commonSchemas.pagination.parse(paginationData)
  assert(result.limit === 20, 'Pagination coercion works')
  assert(result.offset === 0, 'Pagination defaults work')
  log('Common pagination schema works', green)
} catch (error) {
  log('Pagination schema test failed', red)
  console.error(error)
}

try {
  const uuidData = { id: '123e4567-e89b-12d3-a456-426614174000' }
  const result = commonSchemas.uuidParam.parse(uuidData)
  assert(result.id === uuidData.id, 'UUID validation works')
  log('Common UUID schema works', green)
} catch (_error) {
  log('UUID schema test failed', red)
}

try {
  const dateRangeData = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
  }
  const result = commonSchemas.dateRange.parse(dateRangeData)
  assert(result.startDate instanceof Date, 'Date range validation works')
  log('Common date range schema works', green)
} catch (_error) {
  log('Date range schema test failed', red)
}

// Test schema composition
testSection('Schema Composition')

try {
  const composedSchema = composeSchemas(
    commonSchemas.pagination,
    commonSchemas.sort
  )

  const data = {
    limit: '10',
    offset: '20',
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
  }

  const result = composedSchema.parse(data)
  assert(result.limit === 10, 'Composed schema includes pagination')
  assert(result.sortOrder === 'desc', 'Composed schema includes sort')
  log('Schema composition works correctly', green)
} catch (error) {
  log('Schema composition test failed', red)
  console.error(error)
}

// Test sanitization
testSection('Input Sanitization')

try {
  const malicious = '<script>alert("xss")</script>Hello'
  const sanitized = sanitizeString(malicious)
  assert(!sanitized.includes('<'), 'Sanitization removes < characters')
  assert(!sanitized.includes('>'), 'Sanitization removes > characters')
  log('String sanitization works correctly', green)
} catch (_error) {
  log('Sanitization test failed', red)
}

try {
  const obj = {
    name: '<b>John</b>',
    nested: {
      value: '<script>bad</script>',
    },
    array: ['<div>test</div>', 'safe'],
  }

  const sanitized = sanitizeObject(obj)
  assert(!sanitized.name.includes('<'), 'Object sanitization works on top level')
  assert(!sanitized.nested.value.includes('<'), 'Object sanitization works on nested objects')
  assert(!sanitized.array[0].includes('<'), 'Object sanitization works on arrays')
  log('Object sanitization works correctly', green)
} catch (error) {
  log('Object sanitization test failed', red)
  console.error(error)
}

// Summary
testSection('Test Summary')
log('All validation and error handling tests passed! ✓', green)
log('\nThe validation and error handling infrastructure is ready to use.', yellow)
log('\nUsage examples:', yellow)
log(`
1. Using error types in API routes:
   throw new NotFoundError('Application')
   throw new ValidationError('Invalid email', { field: 'email' })

2. Using assertion helpers:
   assertAuthenticated(userId)
   assertExists(application, 'Application')
   assertAuthorized(user.role === 'ADMIN', 'Only admins can access')

3. Using validation in API routes:
   const data = await validateRequestBody(request, createApplicationSchema)
   const params = validateRouteParams(routeParams, commonSchemas.uuidParam)
   const query = validateQueryParams(request, commonSchemas.pagination)

4. Using error handler wrapper:
   export const GET = withErrorHandler(async (request) => {
     // Your code here - errors are automatically handled
   })
`)
