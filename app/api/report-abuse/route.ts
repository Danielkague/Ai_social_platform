import { type NextRequest, NextResponse } from "next/server"
import { mlService } from "@/lib/ml-service"

export async function POST(request: NextRequest) {
  try {
    const { text, userId, reportedUserId, additionalInfo } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Report abuse to ML service
    const result = await mlService.reportAbuse({
      text,
      userId,
      reportedUserId,
      additionalInfo,
    })

    return NextResponse.json({
      status: "success",
      message: "Abuse report submitted successfully",
      reportId: result.report_id,
      prediction: result.prediction,
    })
  } catch (error) {
    console.error("Abuse reporting error:", error)
    return NextResponse.json(
      { error: "Failed to submit abuse report" },
      { status: 500 }
    )
  }
} 