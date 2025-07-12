import { type NextRequest, NextResponse } from "next/server"
import { mlService } from "@/lib/ml-service"
import { ML_CONFIG } from "@/lib/ml-config"

// Mock database - replace with your actual database
const posts: any[] = []
let postIdCounter = 1

export async function POST(request: NextRequest) {
  try {
    const { content, userId, username, fullName, avatar } = await request.json()

    const newPost = {
      id: postIdCounter++,
      content,
      userId,
      username,
      fullName,
      avatar,
      timestamp: new Date().toISOString(),
      flagged: false,
      moderationStatus: "pending",
      reports: [],
    }

    // Send to ML model for hate speech detection
    let moderationResult
    try {
      if (ML_CONFIG.USE_ML_MODEL) {
        moderationResult = await mlService.predictHateSpeech(content)
      } else {
        moderationResult = mlService.fallbackDetection(content)
      }
    } catch (error) {
      console.log("ML service unavailable, using fallback:", error.message)
      moderationResult = mlService.fallbackDetection(content)
    }

    newPost.flagged = moderationResult.is_hate_speech
    newPost.moderationStatus = moderationResult.is_hate_speech ? "flagged" : "approved"
    newPost.severity = moderationResult.severity
    newPost.categories = moderationResult.categories
    newPost.confidence = moderationResult.confidence

    posts.unshift(newPost)

    // Store training data for ML model improvement
    try {
      await mlService.storeTrainingData({
        text: content,
        timestamp: newPost.timestamp,
        userId,
        prediction: moderationResult,
      })
    } catch (error) {
      console.log("Failed to store training data:", error.message)
    }

    return NextResponse.json(newPost)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

export async function GET() {
  // Return approved posts only
  const approvedPosts = posts.filter((post) => post.moderationStatus === "approved")
  return NextResponse.json(approvedPosts)
}


