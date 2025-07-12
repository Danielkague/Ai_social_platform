import { type NextRequest, NextResponse } from "next/server"
import { mlService } from "@/lib/ml-service"

export async function GET(request: NextRequest) {
  try {
    const stats = await mlService.getModelStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("ML stats error:", error)
    return NextResponse.json(
      { 
        status: "error",
        error: "Failed to fetch ML statistics",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 