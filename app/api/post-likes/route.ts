import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

// POST: Like or unlike a post
export async function POST(request: NextRequest) {
  try {
    const { postId, userId, action } = await request.json()
    if (!postId || !userId || !["like", "unlike"].includes(action)) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 })
    }
    if (action === "like") {
      const { error } = await supabase.from("post_likes").insert([{ post_id: postId, user_id: userId }])
      if (error && error.code !== "23505") return NextResponse.json({ error: error.message }, { status: 500 }) // ignore duplicate
    } else if (action === "unlike") {
      const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update like" }, { status: 500 })
  }
}

// GET: Get like count for a post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 })
  const { count, error } = await supabase
    .from("post_likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ count })
} 