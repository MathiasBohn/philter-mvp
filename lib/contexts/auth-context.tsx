"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User as SupabaseUser } from "@supabase/supabase-js"
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create Supabase client with error handling
  let supabase
  try {
    supabase = createClient()
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    // Create a fallback that won't break the app
    supabase = null
  }

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    if (!supabase) {
      console.warn('Cannot fetch user profile: Supabase client not available')
      return null
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        // Log more details about the error
        console.error("Error fetching user profile:")
        console.error("- Error object:", JSON.stringify(error))
        console.error("- User ID:", userId)
        console.error("- Error keys:", Object.keys(error))
        console.error("- Error message:", error?.message || "No message")
        console.error("- Error code:", error?.code || "No code")
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error("Error fetching user profile (caught):", error)
      return null
    }
  }

  // Convert Supabase user + profile to our User type
  const createUserObject = (authUser: SupabaseUser, userProfile: UserProfile | null): User | null => {
    if (!userProfile) return null

    return {
      id: authUser.id,
      name: `${userProfile.first_name} ${userProfile.last_name}`,
      email: authUser.email!,
      role: userProfile.role,
      createdAt: new Date(authUser.created_at),
    }
  }

  // Load user on mount and subscribe to auth state changes
  useEffect(() => {
    // If Supabase client creation failed, skip auth initialization
    if (!supabase) {
      console.warn('Supabase client not available, skipping auth initialization')
      setIsLoading(false)
      return
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const userProfile = await fetchUserProfile(authUser.id)
          setProfile(userProfile)
          setUser(createUserObject(authUser, userProfile))
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          setProfile(userProfile)
          setUser(createUserObject(session.user, userProfile))
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
        } else if (event === "USER_UPDATED" && session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          setProfile(userProfile)
          setUser(createUserObject(session.user, userProfile))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    if (!supabase) {
      console.warn('Cannot sign out: Supabase client not available')
      return
    }

    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
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
