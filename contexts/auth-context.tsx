"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { registerUser, loginUser, getProfile } from "@/lib/auth-supabase"
import { supabase } from "@/lib/supabaseClient"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        const profileData = await getProfile(session.user.id)
        setProfile(profileData)
      }
      setIsLoading(false)
    }
    getSession()
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const profileData = await getProfile(session.user.id)
        setProfile(profileData)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  const isAuthenticated = !!user

  const register = async (data: any) => {
    const result = await registerUser(data);
    // After registration, fetch the session and profile
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      const profileData = await getProfile(session.user.id);
      setProfile(profileData);
    }
    return result;
  };
  const login = async (data: any) => {
    try {
      await loginUser(data);
      // After login, fetch the session and profile
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await getProfile(session.user.id);
        setProfile(profileData);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Login error:", err);
      return { success: false, error: err.message || "Login failed" };
    }
  };
  const logout = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null) }

  return (
    <AuthContext.Provider value={{ user, profile, register, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
