"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Wifi, WifiOff, Brain, Activity } from "lucide-react"

interface MLStats {
  status: string
  model_info: {
    is_trained: boolean
    accuracy: number | null
    last_updated: string
  }
  training_data: {
    total_samples: number
    labeled_samples: number
    unlabeled_samples: number
  }
  abuse_reports: {
    total_reports: number
    critical_reports: number
    pending_reports: number
    severity_distribution: Record<string, number>
  }
  detection_capabilities: {
    real_time_detection: boolean
    pattern_based_detection: boolean
    ml_based_detection: boolean
    automatic_reporting: boolean
    severity_assessment: boolean
  }
}

export default function MLStatus() {
  const [stats, setStats] = useState<MLStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/ml-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError("Failed to fetch ML statistics")
      }
    } catch (err) {
      setError("ML service unavailable")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (loading) return <Activity className="w-4 h-4 animate-spin" />
    if (error) return <WifiOff className="w-4 h-4 text-red-500" />
    if (stats?.status === "active") return <Wifi className="w-4 h-4 text-green-500" />
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  const getStatusColor = () => {
    if (loading) return "bg-gray-100 text-gray-600"
    if (error) return "bg-red-100 text-red-700"
    if (stats?.status === "active") return "bg-green-100 text-green-700"
    return "bg-yellow-100 text-yellow-700"
  }

  const getStatusText = () => {
    if (loading) return "Checking..."
    if (error) return "Disconnected"
    if (stats?.status === "active") return "Connected"
    return "Warning"
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4" />
          AI Protection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">ML Server</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Model Status */}
        {stats && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Model Trained</span>
              <Badge variant={stats.model_info.is_trained ? "default" : "secondary"}>
                {stats.model_info.is_trained ? "Yes" : "No"}
              </Badge>
            </div>

            {stats.model_info.accuracy && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="text-sm font-medium">
                  {(stats.model_info.accuracy * 100).toFixed(1)}%
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Training Samples</span>
              <span className="text-sm font-medium">
                {stats.training_data.total_samples}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Reports</span>
              <span className="text-sm font-medium">
                {stats.abuse_reports.pending_reports}
              </span>
            </div>
          </>
        )}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Refreshing..." : "Refresh Status"}
        </Button>
      </CardContent>
    </Card>
  )
}
