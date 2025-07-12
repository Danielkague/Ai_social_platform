"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type AuthState, authService } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    username: string
    email: string
    password: string
    fullName: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser()
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      })
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const login = async (emailOrUsername: string, password: string) => {
    const result = await authService.login({ emailOrUsername, password })

    if (result.success && result.user) {
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true }
    }

    return { success: false, error: result.error }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    fullName: string
  }) => {
    const result = await authService.register(userData)

    if (result.success && result.user) {
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true }
    }

    return { success: false, error: result.error }
  }

  const logout = () => {
    authService.logout()
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
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
