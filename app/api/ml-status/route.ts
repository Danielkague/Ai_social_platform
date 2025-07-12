import { NextResponse } from "next/server"

const ML_SERVER_URL = process.env.ML_SERVER_URL || "http://localhost:5000"

export async function GET() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${ML_SERVER_URL}/model-stats`, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        status: "connected",
        mlStats: data,
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error("ML server not responding properly")
    }
  } catch (error) {
    return NextResponse.json({
      status: "fallback",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
