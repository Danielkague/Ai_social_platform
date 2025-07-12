import { ML_CONFIG, ML_ENDPOINTS, type MLPrediction, type AbuseReport, type TrainingData } from './ml-config'

class MLService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${ML_CONFIG.SERVER_URL}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), ML_CONFIG.TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`ML server responded with status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async predictHateSpeech(text: string): Promise<MLPrediction> {
    return this.makeRequest<MLPrediction>(ML_ENDPOINTS.PREDICT, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  }

  async reportAbuse(report: AbuseReport): Promise<any> {
    return this.makeRequest(ML_ENDPOINTS.REPORT_ABUSE, {
      method: 'POST',
      body: JSON.stringify(report),
    })
  }

  async storeTrainingData(data: TrainingData): Promise<any> {
    return this.makeRequest(ML_ENDPOINTS.STORE_DATA, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async retrainModel(): Promise<any> {
    return this.makeRequest(ML_ENDPOINTS.RETRAIN, {
      method: 'POST',
    })
  }

  async getModelStats(): Promise<any> {
    return this.makeRequest(ML_ENDPOINTS.STATS, {
      method: 'GET',
    })
  }

  async getPendingReports(): Promise<any> {
    return this.makeRequest(ML_ENDPOINTS.PENDING_REPORTS, {
      method: 'GET',
    })
  }

  async healthCheck(): Promise<any> {
    return this.makeRequest(ML_ENDPOINTS.HEALTH, {
      method: 'GET',
    })
  }

  // Enhanced fallback detection when ML server is unavailable
  fallbackDetection(text: string): MLPrediction {
    const lowerText = text.toLowerCase()

    const hatePatterns = {
      threat: ['kill', 'die', 'hurt', 'harm', 'destroy', 'attack', 'murder'],
      hate_speech: ['hate', 'despise', 'disgusting', 'awful', 'terrible', 'inferior'],
      harassment: ['stalk', 'follow', 'doxx', 'expose', 'shut up'],
      offensive: ['stupid', 'idiot', 'dumb', 'moron', 'loser', 'pathetic'],
      profanity: ['damn', 'hell', 'crap', 'fuck', 'shit', 'bitch'],
      spam: ['buy now', 'click here', 'free money', 'get rich'],
    }

    let totalScore = 0
    const detectedCategories: string[] = []

    for (const [category, keywords] of Object.entries(hatePatterns)) {
      const matches = keywords.filter((keyword) => lowerText.includes(keyword))
      if (matches.length > 0) {
        detectedCategories.push(category)
        const weight = category === 'threat' ? 3 : category === 'hate_speech' ? 2 : 1
        totalScore += matches.length * weight
      }
    }

    const confidence = Math.min(totalScore * 0.15, 0.95)
    const isHateSpeech = confidence > 0.4

    let severity: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none'
    if (confidence > 0.8) severity = 'critical'
    else if (confidence > 0.6) severity = 'high'
    else if (confidence > 0.4) severity = 'medium'
    else if (confidence > 0.2) severity = 'low'

    return {
      is_hate_speech: isHateSpeech,
      confidence,
      categories: detectedCategories,
      severity,
      requires_immediate_action: detectedCategories.includes('threat') || confidence > 0.8,
      ml_confidence: 0,
      pattern_confidence: confidence,
    }
  }
}

export const mlService = new MLService() 