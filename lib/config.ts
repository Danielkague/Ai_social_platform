export const config = {
  // ML Model Configuration
  ML_SERVER_URL: process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:5000",
  USE_ML_MODEL: process.env.USE_ML_MODEL !== "false",

  // API Configuration
  MAX_POST_LENGTH: 500,
  MODERATION_TIMEOUT: 5000,

  // Feature Flags
  ENABLE_REAL_TIME_MODERATION: true,
  ENABLE_TRAINING_DATA_COLLECTION: true,

  // Fallback Detection Settings
  HATE_SPEECH_THRESHOLD: 0.4,
  HIGH_CONFIDENCE_THRESHOLD: 0.8,
}

export const ML_STATUS = {
  CONNECTED: "connected",
  FALLBACK: "fallback",
  DISABLED: "disabled",
} as const

export type MLStatus = (typeof ML_STATUS)[keyof typeof ML_STATUS]
