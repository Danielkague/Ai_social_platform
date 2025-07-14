import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import AdminNavLink from "@/components/AdminNavLink";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SafeSocial - AI-Powered Social Platform",
  description: "A safe social media platform with AI-powered content moderation and psychological support",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <nav className="w-full flex justify-end p-4 bg-gray-100 border-b">
            <AdminNavLink />
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
