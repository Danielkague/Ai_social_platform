"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import AdminNavLink from "./AdminNavLink"

export default function AuthRedirect() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // If user is authenticated and on the landing page, redirect to feed
      if (user && pathname === "/") {
        router.push("/feed")
      }
      // If user is not authenticated and not on the landing page, redirect to landing
      // But only if they're not in the process of logging out
      else if (!user && pathname !== "/" && pathname !== "/login" && pathname !== "/register") {
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  // Show admin nav link only on admin pages
  if (pathname === "/admin") {
    return (
      <nav className="w-full flex justify-end p-4 bg-gray-100 border-b">
        <AdminNavLink />
      </nav>
    )
  }

  return null
} 