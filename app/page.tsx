"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MessageCircle, Shield, Heart, LogOut } from "lucide-react"
import SupportChatbot from "./components/support-chatbot"
import MLStatus from "./components/ml-status"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

interface Post {
  id: number
  content: string
  username: string
  fullName: string
  timestamp: string
  flagged: boolean
  moderationStatus: string
  severity?: string
  categories?: string[]
  confidence?: number
  userId: number
  avatar?: string
}

function SocialMediaPlatform() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [showSupportChat, setShowSupportChat] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    }
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() || !user) return

    setIsPosting(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPost,
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
        }),
      })

      if (response.ok) {
        setNewPost("")
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">SafeSocial</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">AI Protection Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-gray-500">@{user?.username}</p>
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowSupportChat(true)} className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Support & Safety</span>
            </Button>

            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            
          </div>
          <div>
            <MLStatus />
          </div>
        </div>

        {/* Welcome Message */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-900">Welcome back, {user?.fullName}!</h2>
                <p className="text-sm text-blue-700">
                  Share your thoughts in our AI-protected community. Member since{" "}
                  {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : "today"}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post Creation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Share your thoughts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user?.fullName?.[0]?.toUpperCase()}
                </div>
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`What's on your mind, ${user?.fullName?.split(" ")[0]}?`}
                  className="min-h-[100px] flex-1"
                  maxLength={500}
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  AI moderation enabled
                  <span className="text-xs">({newPost.length}/500)</span>
                </div>
                <Button type="submit" disabled={isPosting || !newPost.trim()}>
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No posts yet in your feed</p>
                <p className="text-sm text-gray-400">Be the first to share something with the community!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {post.fullName?.[0]?.toUpperCase() || post.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{post.fullName || post.username}</p>
                        <p className="text-sm text-gray-500">
                          @{post.username} • {formatTimestamp(post.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {post.moderationStatus === "approved" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Verified Safe
                        </Badge>
                      )}
                      {post.moderationStatus === "flagged" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {post.severity === "critical" ? "Critical" : 
                           post.severity === "high" ? "High Risk" : 
                           post.severity === "medium" ? "Medium Risk" : "Flagged"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>
                  
                  {/* Moderation Details */}
                  {post.moderationStatus === "flagged" && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Content Flagged</span>
                      </div>
                      <div className="text-sm text-red-700 space-y-1">
                        {post.categories && post.categories.length > 0 && (
                          <p>Detected: {post.categories.join(", ")}</p>
                        )}
                        {post.confidence && (
                          <p>Confidence: {(post.confidence * 100).toFixed(1)}%</p>
                        )}
                        {post.severity && (
                          <p>Severity: {post.severity.charAt(0).toUpperCase() + post.severity.slice(1)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Comment
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      onClick={() => setShowSupportChat(true)}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Support Chatbot Modal */}
      {showSupportChat && <SupportChatbot onClose={() => setShowSupportChat(false)} />}
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute>
      <SocialMediaPlatform />
    </ProtectedRoute>
  )
}
