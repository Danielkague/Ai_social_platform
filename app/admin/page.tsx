"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, TrendingUp, Users, MessageSquare } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    flaggedPosts: 0,
    approvedPosts: 0,
    pendingReview: 0,
    supportChats: 0,
    mlModelAccuracy: 0,
  })

  const [flaggedContent, setFlaggedContent] = useState([])

  useEffect(() => {
    // Fetch admin statistics
    fetchAdminStats()
    fetchFlaggedContent()
  }, [])

  const fetchAdminStats = async () => {
    // Mock data - replace with actual API calls
    setStats({
      totalPosts: 156,
      flaggedPosts: 12,
      approvedPosts: 144,
      pendingReview: 3,
      supportChats: 28,
      mlModelAccuracy: 94.2,
    })
  }

  const fetchFlaggedContent = async () => {
    // Mock flagged content - replace with actual API
    setFlaggedContent([
      {
        id: 1,
        content: "This is a sample flagged post...",
        username: "user123",
        timestamp: new Date().toISOString(),
        confidence: 0.89,
        category: "hate_speech",
      },
    ])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">AI-Powered Content Moderation System</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Flagged Content</p>
                  <p className="text-2xl font-bold text-red-600">{stats.flaggedPosts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Support Chats</p>
                  <p className="text-2xl font-bold text-green-600">{stats.supportChats}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ML Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.mlModelAccuracy}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ML Model Integration Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ML Model Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800">Hate Speech Detection Model</p>
                  <p className="text-sm text-green-600">Connected to Python ML service</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-800">Training Data Collection</p>
                  <p className="text-sm text-blue-600">Collecting user interactions for model improvement</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Running
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Python ML Integration Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Required Python API Endpoints:</h4>
              <div className="space-y-2 text-sm font-mono">
                <p>
                  <strong>POST</strong> http://localhost:5000/predict-hate-speech
                </p>
                <p className="text-gray-600 ml-4">Body: {'{ "text": "content to analyze" }'}</p>
                <p className="text-gray-600 ml-4">
                  Response: {'{ "is_hate_speech": boolean, "confidence": float, "categories": [] }'}
                </p>

                <p className="mt-3">
                  <strong>POST</strong> http://localhost:5000/store-training-data
                </p>
                <p className="text-gray-600 ml-4">
                  Body: {'{ "text": "content", "timestamp": "ISO date", "userId": int, "prediction": {} }'}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-800">Data Flow:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>User posts content → Next.js API receives it</li>
                <li>Content sent to your Python ML model for analysis</li>
                <li>ML model returns prediction → Content flagged/approved</li>
                <li>Training data stored for model improvement</li>
                <li>User feedback collected for model retraining</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
