import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username, full_name)")
    .eq("moderation_status", "flagged")
    .order("timestamp", { ascending: false })
  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data)
} 