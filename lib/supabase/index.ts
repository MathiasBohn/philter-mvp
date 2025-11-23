/**
 * Supabase Client Utilities - Barrel Export
 *
 * This file provides convenient exports for all Supabase utilities.
 * Use the appropriate client based on your context:
 *
 * - Browser/Client Components: Use createClient from './client'
 * - Server Components/Route Handlers: Use createClient from './server'
 * - Proxy (Next.js 16): Use updateSession from './middleware'
 *
 * Note: The './middleware' file provides proxy utilities for Next.js 16's
 * proxy convention (formerly called middleware in earlier versions).
 */

// Note: We don't re-export here to avoid confusion between client and server createClient
// Import directly from './client' or './server' as needed

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient, createAdminClient } from './server'
export { updateSession, isAuthenticated } from './middleware'
