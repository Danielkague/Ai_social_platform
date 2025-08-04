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
import CommentsSection from "@/components/comments-section"
import PostLikes from "@/components/post-likes"
import { useRouter } from "next/navigation"

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

function SocialMediaPlatform() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("")
  const [showSupportChat, setShowSupportChat] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
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
    try {
      const response = await fetch("/api/posts");
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
          ipAddress: null // Optionally, you can get the user's IP from the backend
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
    await logout();
    router.push("/login");
  }

  const handleReportPost = (postId: number) => {
    setReportingPostId(postId)
  }
  const submitPostReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !reportingPostId || !postReportReason.trim()) return
    setPostReportError("")
    setPostReportSuccess("")
    const post = posts.find((p) => p.id === reportingPostId)
    const reportedUserId = post?.user_id
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterId: user.id,
          reportedUserId,
          postId: reportingPostId,
          reason: postReportReason
        })
      })
      if (res.ok) {
        setPostReportSuccess("Report submitted. Thank you!")
        setPostReportReason("")
        setReportingPostId(null)
      } else {
        const data = await res.json()
        setPostReportError(data.error || "Failed to submit report")
      }
    } catch (err: any) {
      setPostReportError("Failed to submit report")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow">
              {profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Welcome, {profile?.full_name || profile?.username}!</h2>
              <p className="text-xs text-blue-700">Member since {profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : "today"}.</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              onClick={() => setShowSupportChat(true)} 
              className="flex items-center gap-2 bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
            >
              <Heart className="w-4 h-4" /> Get Support
            </Button>
            <a href="/README.md#moderation--ai-policy" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline text-sm hover:text-blue-900">Moderation & AI Policy</a>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2"></div>
          <div>
            <MLStatus />
          </div>
        </div>
        <Card className="mb-8 shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Share your thoughts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase()}
                </div>
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
        {postsError && (
          <Card className="shadow">
            <CardContent className="text-center py-8">
              <p className="text-red-600 mb-2">{postsError}</p>
            </CardContent>
          </Card>
        )}
        {posts.length === 0 ? (
          <Card className="shadow">
            <CardContent className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No posts yet in your feed</p>
              <p className="text-sm text-gray-400">Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
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
                  {reportingPostId === post.id && (
                    <form onSubmit={submitPostReport} className="mt-2 flex flex-col gap-2 bg-red-50 p-2 rounded">
                      <textarea
                        value={postReportReason}
                        onChange={(e) => setPostReportReason(e.target.value)}
                        placeholder="Describe the issue..."
                        className="border rounded p-1 text-sm"
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Submit</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setReportingPostId(null)}>Cancel</Button>
                      </div>
                      {postReportError && <div className="text-xs text-red-600">{postReportError}</div>}
                      {postReportSuccess && <div className="text-xs text-green-600">{postReportSuccess}</div>}
                    </form>
                  )}
                  <CommentsSection postId={post.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {showSupportChat && <SupportChatbot onClose={() => setShowSupportChat(false)} />}
        
        {/* Floating Support Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setShowSupportChat(true)}
            className="rounded-full w-14 h-14 bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            title="Get Mental Health Support"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      </div>
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
