"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react"
import { User as SupabaseUser, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { User, Role } from "@/lib/types"

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
      console.error('[AuthContext] Failed to create Supabase client:', error)
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
      console.log('[AuthContext] Creating user without profile (profile unavailable)')
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

  // Fetch user profile from database with timeout
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('[AuthContext] Cannot fetch profile: Supabase client not available')
      return null
    }

    try {
      console.log('[AuthContext] Fetching profile for user:', userId)

      // Add timeout to prevent hanging indefinitely
      let timeoutId: NodeJS.Timeout | null = null
      let didTimeout = false

      const timeoutPromise = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          didTimeout = true
          console.warn('[AuthContext] Profile fetch timed out after 5 seconds')
          resolve(null)
        }, 5000)
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
          console.error("[AuthContext] Error fetching profile:", error.message)
          return null
        }

        // Only log success if we didn't timeout
        if (!didTimeout) {
          console.log('[AuthContext] Profile fetched:', { id: data?.id, role: data?.role })
        }
        return data as UserProfile
      })()

      const result = await Promise.race([fetchPromise, timeoutPromise])
      return result
    } catch (error) {
      console.error("[AuthContext] Exception fetching profile:", error)
      return null
    }
  }, [])

  // Load user and set up auth state
  const loadUser = useCallback(async (authUser: SupabaseUser) => {
    console.log('[AuthContext] Loading user:', authUser.id)
    // Set loading true while we fetch the profile - this prevents race conditions
    // where components see user=null and isLoading=false simultaneously
    setIsLoading(true)
    const userProfile = await fetchUserProfile(authUser.id)
    setProfile(userProfile)
    const userObj = createUserObject(authUser, userProfile)
    console.log('[AuthContext] User object created:', { hasUser: !!userObj, role: userObj?.role })
    setUser(userObj)
    setIsLoading(false)
  }, [fetchUserProfile, createUserObject])

  // Clear user state
  const clearUser = useCallback(() => {
    console.log('[AuthContext] Clearing user state')
    setUser(null)
    setProfile(null)
    setIsLoading(false)
  }, [])

  // Initialize auth on mount
  useEffect(() => {
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.warn('[AuthContext] Supabase client not available')
      setIsLoading(false)
      return
    }

    // Prevent double initialization in React 18 Strict Mode
    if (initializingRef.current) return
    initializingRef.current = true

    console.log('[AuthContext] Initializing auth...')

    let isSubscribed = true

    // Set up auth state change listener
    // This fires immediately with current state AND on any state changes
    // IMPORTANT: INITIAL_SESSION often fires first with no session (from memory),
    // then SIGNED_IN fires shortly after (from cookies). We need to wait before
    // concluding there's no session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[AuthContext] Auth state changed:', event, { hasSession: !!session, userId: session?.user?.id })

        if (!isSubscribed) return

        // Clear any pending auth check since we got a new event
        if (pendingAuthCheckRef.current) {
          clearTimeout(pendingAuthCheckRef.current)
          pendingAuthCheckRef.current = null
        }

        if (session?.user) {
          // User is authenticated - load their profile
          hasReceivedInitialStateRef.current = true
          console.log('[AuthContext] Loading user profile...')
          await loadUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          // Explicit sign out - clear immediately
          console.log('[AuthContext] User signed out, clearing state')
          hasReceivedInitialStateRef.current = true
          clearUser()
        } else {
          // No session in this event (likely INITIAL_SESSION), but don't immediately conclude there's no user.
          // INITIAL_SESSION fires first (often with no session from memory),
          // then SIGNED_IN may fire shortly after (with session from cookies).
          // Wait longer to see if SIGNED_IN follows - 500ms was causing race conditions.
          console.log('[AuthContext] No session in event (%s), waiting for potential SIGNED_IN...', event)

          pendingAuthCheckRef.current = setTimeout(async () => {
            if (!isSubscribed) return

            // If we still haven't received initial state (meaning no SIGNED_IN came),
            // then check with getUser() to be absolutely sure
            if (!hasReceivedInitialStateRef.current) {
              console.log('[AuthContext] No SIGNED_IN received, checking with getUser()...')
              const { data: { user: authUser } } = await supabase.auth.getUser()

              if (authUser) {
                console.log('[AuthContext] Found user via getUser():', authUser.id)
                await loadUser(authUser)
              } else {
                // Wait a bit more before clearing - SIGNED_IN might be about to fire
                // This small delay prevents the race condition where getUser() returns null
                // but SIGNED_IN fires immediately after
                console.log('[AuthContext] getUser() returned null, waiting briefly before clearing...')
                await new Promise(resolve => setTimeout(resolve, 500))

                // Re-check if SIGNED_IN fired during the wait
                if (!isSubscribed || hasReceivedInitialStateRef.current) {
                  console.log('[AuthContext] SIGNED_IN received during wait, not clearing')
                  return
                }

                console.log('[AuthContext] Confirmed no user, clearing state')
                hasReceivedInitialStateRef.current = true
                clearUser()
              }
            }
          }, 1500) // Wait 1500ms to see if SIGNED_IN fires (increased from 500ms)
        }
      }
    )

    // Fallback: If onAuthStateChange doesn't settle within 3 seconds, check manually
    const fallbackTimeout = setTimeout(async () => {
      if (!isSubscribed || hasReceivedInitialStateRef.current) return

      console.log('[AuthContext] Fallback check - getting user manually')
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        console.log('[AuthContext] Fallback found user:', authUser.id)
        await loadUser(authUser)
      } else {
        console.log('[AuthContext] Fallback: no user found')
        hasReceivedInitialStateRef.current = true
        setIsLoading(false)
      }
    }, 3000)

    return () => {
      console.log('[AuthContext] Cleaning up subscription')
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
      console.warn('[AuthContext] Cannot sign out: Supabase client not available')
      return
    }

    try {
      await supabase.auth.signOut()
      clearUser()
    } catch (error) {
      console.error("[AuthContext] Error signing out:", error)
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
      console.error("[AuthContext] Error refreshing profile:", error)
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
