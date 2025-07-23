import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

const ML_SERVER_URL = "http://localhost:5000";
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

// GET: Fetch all posts (with user profile info)
export async function GET() {
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles:profiles!user_id(username, avatar, full_name)")
    .order("timestamp", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: Create a new post (with ML moderation)
export async function POST(request: NextRequest) {
  try {
    const { content, userId, ipAddress } = await request.json()
    if (!content || !userId) {
      return NextResponse.json({ error: "Missing content or userId" }, { status: 400 })
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

    // Insert post into Supabase
    const { data, error } = await supabase.from("posts").insert([
      {
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
          post_id: data.id,
          reason: "Auto-flagged by AI moderation",
          status: "pending",
          comment_content: content
        }
      ])
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 })
  }
}


