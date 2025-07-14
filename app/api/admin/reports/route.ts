import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  const { data, error } = await supabase
    .from("reports")
    .select(`*, comment:comments(id, content)`)
    .order("created_at", { ascending: false });
  if (error) {
    console.error('Admin reports join error:', error);
    return NextResponse.json([], { status: 200 })
  }
  console.log('Admin reports data:', data);
  return NextResponse.json(data)
} 