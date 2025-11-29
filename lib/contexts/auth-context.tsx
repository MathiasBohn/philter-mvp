"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react"
import { User as SupabaseUser, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { User, Role } from "@/lib/types"
import { log } from "@/lib/logger"

// Auth timing configuration - all timeouts in milliseconds
const AUTH_CONFIG = {
  /** Timeout for fetching user profile from database (increased for Vercel cold starts) */
  PROFILE_FETCH_TIMEOUT_MS: 15000,
  /** Delay to wait for SIGNED_IN event after INITIAL_SESSION */
  AUTH_SETTLE_DELAY_MS: 1000,
  /** Additional delay before concluding no user exists */
  FINAL_CHECK_DELAY_MS: 500,
  /** Fallback timeout if onAuthStateChange doesn't settle */
  FALLBACK_TIMEOUT_MS: 5000,
  /** Number of retries for profile fetch */
  PROFILE_FETCH_RETRIES: 2,
  /** Delay between retries */
  PROFILE_FETCH_RETRY_DELAY_MS: 1000,
} as const

interface UserProfile {
  id: string
  role: Role
  first_name: string
  last_name: string
  phone: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a singleton Supabase client for the auth context
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClient()
    } catch (error) {
      log.error('[AuthContext] Failed to create Supabase client', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }
  return supabaseClient
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initializingRef = useRef(false)
  // Track if we've received the initial auth state - don't set isLoading=false until we're sure there's no session
  const hasReceivedInitialStateRef = useRef(false)
  const pendingAuthCheckRef = useRef<NodeJS.Timeout | null>(null)

  // Convert Supabase user + profile to our User type
  // Returns a minimal user object even if profile is not available
  const createUserObject = useCallback((authUser: SupabaseUser, userProfile: UserProfile | null): User | null => {
    // If no profile, still create a basic user object with auth info
    // This allows the app to function while profile loads or if profile fetch fails
    if (!userProfile) {
      log.debug('[AuthContext] Creating user without profile (profile unavailable)')
      return {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email!,
        role: 'APPLICANT' as Role, // Default role, will be updated when profile loads
        createdAt: new Date(authUser.created_at),
      }
    }

    return {
      id: authUser.id,
      name: `${userProfile.first_name} ${userProfile.last_name}`,
      email: authUser.email!,
      role: userProfile.role,
      createdAt: new Date(authUser.created_at),
    }
  }, [])

  // Fetch user profile from database with timeout and retry
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      log.warn('[AuthContext] Cannot fetch profile: Supabase client not available')
      return null
    }

    // Retry wrapper for profile fetch
    const attemptFetch = async (attempt: number): Promise<UserProfile | null> => {
      try {
        log.debug('[AuthContext] Fetching profile', { attempt: attempt + 1 })

        // Add timeout to prevent hanging indefinitely
        let timeoutId: NodeJS.Timeout | null = null
        let didTimeout = false

        const timeoutPromise = new Promise<null>((resolve) => {
          timeoutId = setTimeout(() => {
            didTimeout = true
            log.warn('[AuthContext] Profile fetch timed out', { attempt: attempt + 1 })
            resolve(null)
          }, AUTH_CONFIG.PROFILE_FETCH_TIMEOUT_MS)
        })

        const fetchPromise = (async () => {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single()

          // Clear the timeout since fetch completed
          if (timeoutId) {
            clearTimeout(timeoutId)
          }

          if (error) {
            log.error('[AuthContext] Error fetching profile', { errorMessage: error.message, attempt: attempt + 1 })
            return null
          }

          // Only log success if we didn't timeout
          if (!didTimeout) {
            log.debug('[AuthContext] Profile fetched', { hasRole: !!data?.role, role: data?.role })
          }
          return data as UserProfile
        })()

        const result = await Promise.race([fetchPromise, timeoutPromise])
        return result
      } catch (error) {
        log.error('[AuthContext] Exception fetching profile', {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: attempt + 1
        })
        return null
      }
    }

    // Try fetching with retries
    for (let attempt = 0; attempt <= AUTH_CONFIG.PROFILE_FETCH_RETRIES; attempt++) {
      const result = await attemptFetch(attempt)
      if (result) {
        return result
      }

      // Wait before retrying (unless this was the last attempt)
      if (attempt < AUTH_CONFIG.PROFILE_FETCH_RETRIES) {
        log.debug('[AuthContext] Retrying profile fetch...', { nextAttempt: attempt + 2 })
        await new Promise(resolve => setTimeout(resolve, AUTH_CONFIG.PROFILE_FETCH_RETRY_DELAY_MS))
      }
    }

    log.warn('[AuthContext] All profile fetch attempts failed')
    return null
  }, [])

  // Quick role fetch - fast query with proper timeout using Promise.race
  const fetchUserRole = useCallback(async (userId: string): Promise<Role | null> => {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          log.warn('[AuthContext] Quick role fetch timed out after 5s')
          resolve(null)
        }, 5000)
      })

      // Create fetch promise
      const fetchPromise = (async () => {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single()

        if (error) {
          log.error('[AuthContext] Quick role fetch failed', { errorMessage: error.message })
          return null
        }

        return data?.role as Role || null
      })()

      // Race between fetch and timeout
      const result = await Promise.race([fetchPromise, timeoutPromise])
      return result
    } catch (error) {
      log.error('[AuthContext] Quick role fetch exception', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }, [])

  // Load user and set up auth state
  // Strategy: Quick role fetch (5s timeout), then set user. Full profile loads in background.
  const loadUser = useCallback(async (authUser: SupabaseUser) => {
    log.debug('[AuthContext] Loading user')

    // First, try quick role fetch (this should be fast)
    const role = await fetchUserRole(authUser.id)

    // Create user with role (or fallback to APPLICANT)
    const userWithRole: User = {
      id: authUser.id,
      name: authUser.email?.split('@')[0] || 'User',
      email: authUser.email!,
      role: role || ('APPLICANT' as Role),
      createdAt: new Date(authUser.created_at),
    }

    setUser(userWithRole)
    setIsLoading(false)
    log.debug('[AuthContext] User set with role', { role: userWithRole.role })

    // Fetch full profile in background (for additional data like name)
    try {
      const userProfile = await fetchUserProfile(authUser.id)
      if (userProfile) {
        setProfile(userProfile)
        // Update user with full profile data
        const fullUser = createUserObject(authUser, userProfile)
        log.debug('[AuthContext] Full profile loaded', { name: fullUser?.name, role: fullUser?.role })
        setUser(fullUser)
      }
    } catch (error) {
      log.warn('[AuthContext] Full profile fetch failed, using basic user', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [fetchUserRole, fetchUserProfile, createUserObject])

  // Clear user state
  const clearUser = useCallback(() => {
    log.debug('[AuthContext] Clearing user state')
    setUser(null)
    setProfile(null)
    setIsLoading(false)
  }, [])

  // Initialize auth on mount
  useEffect(() => {
    const supabase = getSupabaseClient()

    if (!supabase) {
      log.warn('[AuthContext] Supabase client not available')
      // Schedule state update asynchronously to avoid synchronous setState in effect
      queueMicrotask(() => setIsLoading(false))
      return
    }

    // Prevent double initialization in React 18 Strict Mode
    if (initializingRef.current) return
    initializingRef.current = true

    log.debug('[AuthContext] Initializing auth...')

    let isSubscribed = true

    // Set up auth state change listener
    // This fires immediately with current state AND on any state changes
    // IMPORTANT: INITIAL_SESSION often fires first with no session (from memory),
    // then SIGNED_IN fires shortly after (from cookies). We need to wait before
    // concluding there's no session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        log.debug('[AuthContext] Auth state changed', { event, hasSession: !!session })

        if (!isSubscribed) return

        // Clear any pending auth check since we got a new event
        if (pendingAuthCheckRef.current) {
          clearTimeout(pendingAuthCheckRef.current)
          pendingAuthCheckRef.current = null
        }

        if (session?.user) {
          // User is authenticated - load their profile
          hasReceivedInitialStateRef.current = true
          log.debug('[AuthContext] Loading user profile...')
          await loadUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          // Explicit sign out - clear immediately
          log.debug('[AuthContext] User signed out, clearing state')
          hasReceivedInitialStateRef.current = true
          clearUser()
        } else {
          // No session in this event (likely INITIAL_SESSION), but don't immediately conclude there's no user.
          // INITIAL_SESSION fires first (often with no session from memory),
          // then SIGNED_IN may fire shortly after (with session from cookies).
          log.debug('[AuthContext] No session in event, waiting for potential SIGNED_IN...', { event })

          pendingAuthCheckRef.current = setTimeout(async () => {
            if (!isSubscribed) return

            // If we still haven't received initial state (meaning no SIGNED_IN came),
            // then check with getUser() to be absolutely sure
            if (!hasReceivedInitialStateRef.current) {
              log.debug('[AuthContext] No SIGNED_IN received, checking with getUser()...')
              const { data: { user: authUser } } = await supabase.auth.getUser()

              // Re-check after the async call - SIGNED_IN might have arrived while we were waiting
              if (hasReceivedInitialStateRef.current) {
                log.debug('[AuthContext] SIGNED_IN arrived during getUser() call, skipping')
                return
              }

              if (authUser) {
                log.debug('[AuthContext] Found user via getUser()')
                hasReceivedInitialStateRef.current = true
                await loadUser(authUser)
              } else {
                // Wait a bit more before concluding there's no user
                // This gives more time for SIGNED_IN to arrive from cookie-based auth
                log.debug('[AuthContext] getUser() returned null, waiting briefly before clearing...')
                await new Promise(resolve => setTimeout(resolve, AUTH_CONFIG.FINAL_CHECK_DELAY_MS))

                // Final check - did SIGNED_IN arrive during our wait?
                if (hasReceivedInitialStateRef.current) {
                  log.debug('[AuthContext] SIGNED_IN arrived during final wait, skipping clear')
                  return
                }

                log.debug('[AuthContext] Confirmed no user after all checks, clearing state')
                hasReceivedInitialStateRef.current = true
                clearUser()
              }
            }
          }, AUTH_CONFIG.AUTH_SETTLE_DELAY_MS)
        }
      }
    )

    // Fallback: If onAuthStateChange doesn't settle in time, check manually
    const fallbackTimeout = setTimeout(async () => {
      if (!isSubscribed || hasReceivedInitialStateRef.current) return

      log.debug('[AuthContext] Fallback check - getting user manually')
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        log.debug('[AuthContext] Fallback found user')
        await loadUser(authUser)
      } else {
        log.debug('[AuthContext] Fallback: no user found')
        hasReceivedInitialStateRef.current = true
        setIsLoading(false)
      }
    }, AUTH_CONFIG.FALLBACK_TIMEOUT_MS)

    return () => {
      log.debug('[AuthContext] Cleaning up subscription')
      isSubscribed = false
      clearTimeout(fallbackTimeout)
      if (pendingAuthCheckRef.current) {
        clearTimeout(pendingAuthCheckRef.current)
      }
      subscription.unsubscribe()
      initializingRef.current = false
      hasReceivedInitialStateRef.current = false
    }
  }, [loadUser, clearUser])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      log.warn('[AuthContext] Cannot sign out: Supabase client not available')
      return
    }

    try {
      await supabase.auth.signOut()
      clearUser()
    } catch (error) {
      log.error('[AuthContext] Error signing out', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [clearUser])

  const refreshProfile = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await loadUser(authUser)
      }
    } catch (error) {
      log.error('[AuthContext] Error refreshing profile', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [loadUser])

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Backward compatibility hook - maps to useAuth
export function useUser() {
  const { user, isLoading } = useAuth()
  return { user, isLoading, setUser: () => {} }
}
