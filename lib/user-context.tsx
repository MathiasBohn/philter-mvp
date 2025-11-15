"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, Role } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data/users"

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem("philter_current_user_id")
      if (storedUserId) {
        const foundUser = mockUsers.find((u) => u.id === storedUserId)
        if (foundUser) {
          setUserState(foundUser)
        }
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save user to localStorage whenever it changes
  const setUser = (newUser: User | null) => {
    try {
      if (newUser) {
        localStorage.setItem("philter_current_user_id", newUser.id)
      } else {
        localStorage.removeItem("philter_current_user_id")
      }
      setUserState(newUser)
    } catch (error) {
      console.error("Error saving user to localStorage:", error)
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
