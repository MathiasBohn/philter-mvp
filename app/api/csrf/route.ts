/**
 * CSRF Token API Endpoint
 *
 * GET /api/csrf - Get a CSRF token for use in subsequent requests
 *
 * This endpoint generates a CSRF token, stores it in an HTTP-only cookie,
 * and returns the token to the client. The client should include this token
 * in the 'x-csrf-token' header for all state-changing requests.
 */

import { NextResponse } from 'next/server'
import { generateCSRFToken, getCSRFConfig } from '@/lib/csrf'

export async function GET() {
  try {
    const token = await generateCSRFToken()
    const config = getCSRFConfig()

    return NextResponse.json({
      token,
      headerName: config.headerName,
      message: 'Include this token in the x-csrf-token header for POST, PUT, PATCH, DELETE requests',
    })
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
