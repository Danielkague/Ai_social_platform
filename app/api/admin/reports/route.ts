import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    // First get reports with basic comment info
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select(`
        *,
        comment:comments(id, content, moderation_status, categories)
      `)
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (reportsError) {
      console.error('Admin reports error:', reportsError);
      return NextResponse.json([], { status: 200 })
    }

    // Get unique user IDs from reports
    const userIds = new Set();
    reports?.forEach(report => {
      if (report.reporter_id) userIds.add(report.reporter_id);
      if (report.reported_user_id) userIds.add(report.reported_user_id);
    });

    // Fetch profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, username")
      .in("id", Array.from(userIds));

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
    }

    // Create a map of user profiles
    const profileMap = new Map();
    profiles?.forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Combine reports with profile data
    const enrichedReports = reports?.map(report => ({
      ...report,
      reporter: profileMap.get(report.reporter_id) || null,
      reported_user: profileMap.get(report.reported_user_id) || null
    })) || [];
    
    return NextResponse.json(enrichedReports, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json([], { status: 200 })
  }
} 