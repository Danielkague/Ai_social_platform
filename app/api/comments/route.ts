import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ML_SERVER_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:5000";
// Helper: Call ML server for moderation
async function moderateContent(content: string) {
  const res = await fetch(ML_SERVER_URL + "/predict-hate-speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: content })
  })
  if (!res.ok) throw new Error("ML moderation failed")
  return await res.json()
}

// GET: Fetch all comments for a post (with user profile info)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 })
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles:profiles!user_id(username, avatar, full_name)")
    .eq("post_id", postId)
    .order("timestamp", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: Create a new comment (with ML moderation)
export async function POST(request: NextRequest) {
  try {
    const { postId, userId, content, ipAddress } = await request.json()
    if (!postId || !userId || !content) {
      return NextResponse.json({ error: "Missing postId, userId, or content" }, { status: 400 })
    }

    console.log('ML_SERVER_URL:', ML_SERVER_URL)
    // ML moderation
    let moderationResult = null
    try {
      moderationResult = await moderateContent(content)
      console.log('Moderation result:', moderationResult)
    } catch (e) {
      moderationResult = {
        is_hate_speech: false,
        confidence: 0,
        categories: [],
        severity: null,
        moderation_status: "pending"
      }
      console.error('ML moderation failed:', e)
    }

    // Insert comment into Supabase
    const { data, error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: userId,
        content,
        ip_address: ipAddress || null,
        flagged: moderationResult.is_hate_speech,
        moderation_status: moderationResult.is_hate_speech ? "flagged" : "approved",
        severity: moderationResult.severity,
        categories: moderationResult.categories,
        confidence: moderationResult.confidence
      }
    ]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Auto-reporting: create a report if flagged
    if (moderationResult.is_hate_speech && data?.id) {
      await supabase.from("reports").insert([
        {
          reporter_id: userId, // or a system/admin user id if you prefer
          reported_user_id: userId,
          comment_id: data.id,
          reason: "Auto-flagged by AI moderation",
          status: "pending",
          comment_content: content
        }
      ])
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create comment" }, { status: 500 })
  }
} 