/**
 * Test Supabase Connection
 *
 * This is a test route to verify that the Supabase client is properly configured.
 * Visit: http://localhost:3000/api/test-supabase
 *
 * Expected response:
 * - If configured correctly: JSON with connection status and environment info
 * - If missing env vars: Error message about missing configuration
 *
 * This route can be removed after testing is complete.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'NEXT_PUBLIC_SUPABASE_URL is not set',
          message: 'Please add NEXT_PUBLIC_SUPABASE_URL to your .env.local file',
        },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set',
          message: 'Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file',
        },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Check authentication status (doesn't trigger RLS policies)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Supabase client is working if we can call auth methods
    return NextResponse.json({
      success: true,
      message: 'Supabase client initialized successfully!',
      connection: 'established',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
      note: 'Client initialization successful. Database queries will be tested when authentication is implemented.',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Supabase test error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred while testing Supabase connection',
      },
      { status: 500 }
    )
  }
}
