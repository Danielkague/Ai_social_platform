import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(request: NextRequest) {
  try {
    const { reporterId, reportedUserId, postId, commentId, reason } = await request.json()
    if (!reporterId || (!postId && !commentId) || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    let commentContent = null;
    if (commentId) {
      // Ensure commentId is a number for bigint match
      const commentIdNum = typeof commentId === 'string' ? parseInt(commentId, 10) : commentId;
      const { data: comment, error: commentError } = await supabase
        .from("comments")
        .select("content")
        .eq("id", commentIdNum)
        .maybeSingle();
      console.log('Reporting commentId:', commentIdNum, 'Fetched comment:', comment, 'Error:', commentError);
      if (!commentError && comment) {
        commentContent = comment.content;
      }
    }
    const { error } = await supabase.from("reports").insert([
      {
        reporter_id: reporterId,
        reported_user_id: reportedUserId || null,
        post_id: postId || null,
        comment_id: commentId || null,
        reason,
        status: "pending",
        comment_content: commentContent // Store the comment content at report time
      }
    ])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit report" }, { status: 500 })
  }
} 