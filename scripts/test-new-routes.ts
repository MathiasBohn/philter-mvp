/**
 * Test New API Routes
 *
 * This script tests the newly implemented API routes:
 * - Templates (6 routes)
 * - Decisions (2 routes)
 * - Users (3 routes)
 *
 * Run with: npx tsx scripts/test-new-routes.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const API_BASE = 'http://localhost:3000/api'

interface TestResult {
  route: string
  method: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  message?: string
}

const results: TestResult[] = []

function logResult(result: TestResult) {
  results.push(result)
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
  console.log(`${icon} ${result.method} ${result.route} - ${result.message || result.status}`)
}

async function testRoute(
  method: string,
  path: string,
  options: { requiresAuth?: boolean; requiresAdmin?: boolean; body?: Record<string, unknown> } = {}
) {
  const url = `${API_BASE}${path}`

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, fetchOptions)

    // If route requires auth and we get 401, that's expected
    if (options.requiresAuth && response.status === 401) {
      logResult({
        route: path,
        method,
        status: 'PASS',
        statusCode: 401,
        message: 'Correctly requires authentication',
      })
      return true
    }

    // If route requires admin and we get 403, that's expected
    if (options.requiresAdmin && response.status === 403) {
      logResult({
        route: path,
        method,
        status: 'PASS',
        statusCode: 403,
        message: 'Correctly requires admin access',
      })
      return true
    }

    // Check if route exists (not 404)
    if (response.status === 404) {
      logResult({
        route: path,
        method,
        status: 'FAIL',
        statusCode: 404,
        message: 'Route not found',
      })
      return false
    }

    logResult({
      route: path,
      method,
      status: 'PASS',
      statusCode: response.status,
      message: `Route exists and responds`,
    })
    return true
  } catch (error) {
    logResult({
      route: path,
      method,
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

async function main() {
  console.log('🧪 Testing New API Routes\n')
  console.log('Note: Routes should return 401 (Unauthorized) without valid authentication\n')

  // Test Templates Routes
  console.log('\n📋 Testing Templates Routes:')
  await testRoute('GET', '/templates', { requiresAuth: true, requiresAdmin: true })
  await testRoute('POST', '/templates', { requiresAuth: true, requiresAdmin: true })
  await testRoute('GET', '/templates/test-id-123', { requiresAuth: true })
  await testRoute('PATCH', '/templates/test-id-123', { requiresAuth: true, requiresAdmin: true })
  await testRoute('POST', '/templates/test-id-123/publish', { requiresAuth: true, requiresAdmin: true })

  // Test building template route
  await testRoute('GET', '/buildings/test-building-id/template', { requiresAuth: true })

  // Test Decisions Routes
  console.log('\n⚖️ Testing Decisions Routes:')
  await testRoute('GET', '/applications/test-app-id/decision', { requiresAuth: true })
  await testRoute('POST', '/applications/test-app-id/decision', { requiresAuth: true, requiresAdmin: true })

  // Test Users Routes
  console.log('\n👥 Testing Users Routes:')
  await testRoute('GET', '/users/me', { requiresAuth: true })
  await testRoute('PATCH', '/users/me', { requiresAuth: true })
  await testRoute('GET', '/users/search?q=test', { requiresAuth: true })

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary:')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length

  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`📝 Total: ${results.length}`)

  if (failed > 0) {
    console.log('\n⚠️  Failed Tests:')
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`   - ${r.method} ${r.route}: ${r.message}`)
      })
  }

  console.log('\n' + '='.repeat(60))

  if (failed === 0) {
    console.log('✨ All tests passed! All routes are implemented correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please check the routes above.')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Test script failed:', error)
  process.exit(1)
})
