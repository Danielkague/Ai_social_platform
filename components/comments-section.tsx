"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import SupportChatbot from "@/app/components/support-chatbot";

interface Comment {
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

export default function CommentsSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [reportingId, setReportingId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reportError, setReportError] = useState("")
  const [reportSuccess, setReportSuccess] = useState("")
  const { user, profile } = useAuth()
  const [showAppealChat, setShowAppealChat] = useState<{ open: boolean, comment?: Comment } | null>(null);

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`)
      const data = await response.json()
      setComments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch comments:", error)
      setComments([])
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    setIsPosting(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: user.id,
          content: newComment,
          ipAddress: null // Optionally, you can get the user's IP from the backend
        })
      })
      if (response.ok) {
        setNewComment("")
        fetchComments()
      }
    } catch (error) {
      console.error("Failed to create comment:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleReport = async (commentId: number) => {
    setReportingId(commentId)
  }
  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !reportingId || !reportReason.trim()) return
    setReportError("")
    setReportSuccess("")
    const comment = comments.find((c) => c.id === reportingId)
    const reportedUserId = comment?.user_id
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterId: user.id,
          reportedUserId,
          commentId: reportingId,
          reason: reportReason
        })
      })
      if (res.ok) {
        setReportSuccess("Report submitted. Thank you!")
        setReportReason("")
        setReportingId(null)
        console.log("Report submitted successfully:", {
          reporterId: user.id,
          reportedUserId,
          commentId: reportingId,
          reason: reportReason
        });
      } else {
        const data = await res.json()
        setReportError(data.error || "Failed to submit report")
        console.error("Failed to submit report:", data.error || "Unknown error");
      }
    } catch (err: any) {
      setReportError("Failed to submit report")
      console.error("Failed to submit report:", err);
    }
  }

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Comments</h4>
      <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 min-h-[40px]"
          maxLength={300}
        />
        <Button type="submit" disabled={isPosting || !newComment.trim()}>
          {isPosting ? "Posting..." : "Comment"}
        </Button>
      </form>
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-gray-500 text-sm">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => {
            const isFlagged = comment.moderation_status === "flagged";
            // Hide flagged comments for non-admins
            if (isFlagged && !profile?.is_admin) {
              // Show appeal button if the user is the author
              const isAuthor = user && user.id === comment.user_id;
              return (
                <div key={comment.id} className="bg-gray-100 rounded-lg p-3 border border-red-200 text-red-700 text-sm italic opacity-80 flex flex-col gap-2">
                  <div>
                    This comment was flagged for hate speech or abuse and is hidden. <span className="font-semibold">(Flagged by AI Moderation)</span>
                  </div>
                  {isAuthor && (
                    <Button size="sm" variant="outline" className="w-fit" onClick={() => setShowAppealChat({ open: true, comment })}>
                      Appeal Moderation
                    </Button>
                  )}
                  {showAppealChat?.open && showAppealChat.comment?.id === comment.id && (
                    <SupportChatbot onClose={() => setShowAppealChat(null)} />
                  )}
                </div>
              );
            }
            return (
              <div key={comment.id} className="bg-white rounded-lg p-3 border">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {comment.profiles?.full_name?.[0]?.toUpperCase() || comment.profiles?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">{comment.profiles?.full_name || comment.profiles?.username}</span>
                    <span className="text-xs text-gray-500 ml-2">{formatTimestamp(comment.timestamp)}</span>
                  </div>
                  {comment.moderation_status === "approved" && (
                    <Badge variant="secondary" className="flex items-center gap-1 ml-2">
                      <Shield className="w-3 h-3" /> Safe
                    </Badge>
                  )}
                  {isFlagged && (
                    <Badge variant="destructive" className="flex items-center gap-1 ml-2">
                      <AlertTriangle className="w-3 h-3" /> Flagged
                    </Badge>
                  )}
                </div>
                <div className="text-gray-800 text-sm mb-1">{comment.content}</div>
                {isFlagged && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {comment.categories && comment.categories.length > 0 && (
                      <div>Detected: {comment.categories.join(", ")}</div>
                    )}
                    {comment.confidence && (
                      <div>Confidence: {(comment.confidence * 100).toFixed(1)}%</div>
                    )}
                    {comment.severity && (
                      <div>Severity: {comment.severity.charAt(0).toUpperCase() + comment.severity.slice(1)}</div>
                    )}
                    <div className="font-semibold mt-1">Visible to admins only</div>
                  </div>
                )}
                <div className="flex gap-2 mt-1">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700" onClick={() => handleReport(comment.id)}>
                    <AlertTriangle className="w-3 h-3" /> Report
                  </Button>
                </div>
                {reportingId === comment.id && (
                  <form onSubmit={submitReport} className="mt-2 flex flex-col gap-2 bg-red-50 p-2 rounded">
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Describe the issue..."
                      className="border rounded p-1 text-sm"
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Submit</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setReportingId(null)}>Cancel</Button>
                    </div>
                    {reportError && <div className="text-xs text-red-600">{reportError}</div>}
                    {reportSuccess && <div className="text-xs text-green-600">{reportSuccess}</div>}
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  )
} 