"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MessageCircle, Shield, Heart, LogOut, User, Settings } from "lucide-react"
import SupportChatbot from "../components/support-chatbot"
import MLStatus from "../components/ml-status"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import CommentsSection from "@/components/comments-section"
import PostLikes from "@/components/post-likes"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/LoadingSpinner"

interface Post {
  id: number
  content: string
  timestamp: string
  flagged: boolean
  moderation_status: string
  severity?: string
  categories?: string[]
  confidence?: number
  user_id: string
  profiles?: {
    username: string
    avatar?: string
    full_name?: string
  }
}

function SocialMediaFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("")
  const [showSupportChat, setShowSupportChat] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const { user, profile, logout } = useAuth()
  const [reportingPostId, setReportingPostId] = useState<number | null>(null)
  const [postReportReason, setPostReportReason] = useState("")
  const [postReportError, setPostReportError] = useState("")
  const [postReportSuccess, setPostReportSuccess] = useState("")
  const [postsError, setPostsError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch("/api/posts", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setPosts(data);
        setPostsError("");
      } else if (data && data.error) {
        setPosts([]);
        setPostsError(data.error);
      } else {
        setPosts([]);
        setPostsError("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
      setPostsError("Failed to fetch posts.");
    } finally {
      setIsLoadingPosts(false);
    }
  };

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
          ipAddress: null
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

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleReportPost = (postId: number) => {
    setReportingPostId(postId)
  }

  const submitPostReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportingPostId || !postReportReason.trim()) return

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: reportingPostId,
          reason: postReportReason,
          reporterId: user?.id,
        }),
      })

      if (response.ok) {
        setPostReportSuccess("Post reported successfully!")
        setReportingPostId(null)
        setPostReportReason("")
        setTimeout(() => setPostReportSuccess(""), 3000)
      } else {
        setPostReportError("Failed to report post")
      }
    } catch (error) {
      setPostReportError("Failed to report post")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-800">Hope Social Media</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <MLStatus />
              
              <Button
                variant="outline"
                onClick={() => setShowSupportChat(!showSupportChat)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Get Support
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{profile?.full_name || profile?.username}</p>
                  <p className="text-xs text-gray-500">@{profile?.username}</p>
                </div>
              </div>

              {profile?.is_admin && (
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post */}
          <Card className="shadow-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Share Your Thoughts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={`What's on your mind, ${profile?.full_name?.split(" ")[0] || profile?.username}?`}
                    className="min-h-[100px] flex-1 bg-blue-50 border-blue-200 focus:ring-blue-400"
                    maxLength={500}
                    aria-label="Post content"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" /> AI moderation enabled
                    <span className="text-xs">({newPost.length}/500)</span>
                  </div>
                  <Button type="submit" disabled={isPosting || !newPost.trim()}>
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {postsError && (
            <Card className="shadow">
              <CardContent className="text-center py-8">
                <p className="text-red-600 mb-2">{postsError}</p>
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          {isLoadingPosts ? (
            <Card className="shadow">
              <CardContent className="text-center py-8">
                <LoadingSpinner size="lg" text="Loading posts..." />
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="shadow">
              <CardContent className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No posts yet in your feed</p>
                <p className="text-sm text-gray-400">Be the first to share something with the community!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow border-blue-100">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {post.profiles?.full_name?.[0]?.toUpperCase() || post.profiles?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{post.profiles?.full_name || post.profiles?.username}</p>
                          <p className="text-sm text-gray-500">
                            @{post.profiles?.username} • {formatTimestamp(post.timestamp)}
                          </p>
                        </div>
                      </div>
                      {post.moderation_status === "approved" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Verified Safe
                        </Badge>
                      )}
                      {post.moderation_status === "flagged" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {post.severity === "critical" ? "Critical" : post.severity === "high" ? "High Risk" : post.severity === "medium" ? "Medium Risk" : "Flagged"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed mb-4 text-base">{post.content}</p>
                    {post.moderation_status === "flagged" && (
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
                    <div className="flex items-center gap-4 pt-3 border-t mt-2">
                      <PostLikes postId={post.id} />
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Comment
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        onClick={() => handleReportPost(post.id)}
                      >
                        <AlertTriangle className="w-4 h-4" /> Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Support Chat */}
      {showSupportChat && (
        <SupportChatbot onClose={() => setShowSupportChat(false)} />
      )}

      {/* Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Report Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitPostReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for reporting:</label>
                  <textarea
                    value={postReportReason}
                    onChange={(e) => setPostReportReason(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Please explain why you're reporting this post..."
                    required
                  />
                </div>
                {postReportError && <p className="text-red-600 text-sm">{postReportError}</p>}
                {postReportSuccess && <p className="text-green-600 text-sm">{postReportSuccess}</p>}
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Submit Report</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setReportingPostId(null)
                      setPostReportReason("")
                      setPostReportError("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <SocialMediaFeed />
    </ProtectedRoute>
  )
} 