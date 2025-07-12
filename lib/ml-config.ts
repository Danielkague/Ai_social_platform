// ML Server Configuration
export const ML_CONFIG = {
  SERVER_URL: process.env.ML_SERVER_URL || 'http://localhost:5000',
  USE_ML_MODEL: process.env.USE_ML_MODEL !== 'false', // Default to true
  TIMEOUT: 5000, // 5 seconds
  RETRY_ATTEMPTS: 2,
}

// ML API Endpoints
export const ML_ENDPOINTS = {
  PREDICT: '/predict-hate-speech',
  REPORT_ABUSE: '/report-abuse',
  STORE_DATA: '/store-training-data',
  RETRAIN: '/retrain-model',
  STATS: '/model-stats',
  PENDING_REPORTS: '/get-pending-reports',
  HEALTH: '/health',
} as const

// ML Response Types
export interface MLPrediction {
  is_hate_speech: boolean
  confidence: number
  categories: string[]
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  requires_immediate_action: boolean
  ml_confidence: number
  pattern_confidence: number
}

export interface AbuseReport {
  text: string
  userId?: number
  reportedUserId?: number
  additionalInfo?: string
}

export interface TrainingData {
  text: string
  timestamp: string
  userId?: number
  prediction: any
  humanLabel?: 'hate_speech' | 'not_hate_speech'
} 