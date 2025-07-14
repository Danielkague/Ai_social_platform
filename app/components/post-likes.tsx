"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function PostLikes({ postId }: { postId: number }) {
  const { user } = useAuth()
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLikeCount()
    if (user) checkIfLiked()
    // eslint-disable-next-line
  }, [postId, user])

  const fetchLikeCount = async () => {
    const res = await fetch(`/api/post-likes?postId=${postId}`)
    const data = await res.json()
    setLikeCount(data.count || 0)
  }

  const checkIfLiked = async () => {
    // For demo: fetch all likes for this post and check if user liked (optimize in production)
    const res = await fetch(`/api/post-likes?postId=${postId}`)
    // In production, create a dedicated endpoint to check if user liked
    // For now, just set to false (or implement if you want to fetch all likes and check userId)
    setLiked(false)
  }

  const handleLike = async () => {
    if (!user) return
    setLoading(true)
    await fetch("/api/post-likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, userId: user.id, action: liked ? "unlike" : "like" })
    })
    setLiked(!liked)
    setLikeCount((prev) => prev + (liked ? -1 : 1))
    setLoading(false)
  }

  return (
    <Button variant={liked ? "default" : "ghost"} size="sm" className="flex items-center gap-2" onClick={handleLike} disabled={loading}>
      <Heart className={`w-4 h-4 ${liked ? "text-red-500 fill-red-500" : ""}`} />
      {likeCount}
    </Button>
  )
} 