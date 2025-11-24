"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data/users"
import { storageService, STORAGE_KEYS } from "@/lib/storage"

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from centralized storage on mount
  useEffect(() => {
    try {
      const storedUserId = storageService.get<string>(STORAGE_KEYS.CURRENT_USER, "")
      if (storedUserId) {
        const foundUser = mockUsers.find((u) => u.id === storedUserId)
        if (foundUser) {
          setUserState(foundUser)
        }
      }
    } catch (error) {
      console.error("Error loading user from storage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save user to centralized storage whenever it changes
  const setUser = (newUser: User | null) => {
    try {
      if (newUser) {
        storageService.set(STORAGE_KEYS.CURRENT_USER, newUser.id)
      } else {
        storageService.remove(STORAGE_KEYS.CURRENT_USER)
      }
      setUserState(newUser)
    } catch (error) {
      console.error("Error saving user to storage:", error)
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
