import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(request: NextRequest) {
  try {
    const { type, id, action } = await request.json()
    if (!type || !id || !["approve", "remove", "ban"].includes(action)) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 })
    }
    if (type === "post") {
      if (action === "approve") {
        await supabase.from("posts").update({ moderation_status: "approved", flagged: false }).eq("id", id)
      } else if (action === "remove") {
        await supabase.from("posts").delete().eq("id", id)
      }
    } else if (type === "comment") {
      if (action === "approve") {
        await supabase.from("comments").update({ moderation_status: "approved", flagged: false }).eq("id", id)
      } else if (action === "remove") {
        await supabase.from("comments").delete().eq("id", id)
      }
    } else if (type === "report") {
      if (action === "approve") {
        await supabase.from("reports").update({ status: "resolved" }).eq("id", id)
      }
    } else if (type === "user" && action === "ban") {
      await supabase.from("profiles").update({ banned: true }).eq("id", id)
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to moderate" }, { status: 500 })
  }
} 