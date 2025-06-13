// Types for the advanced game API responses
export interface ChordPoolItem {
  id: string
  name: string
  displayName: string
}

export interface TargetSequenceItem {
  id: string
  name: string
  displayName: string
  audioFileUrl: string
  position: number
}

export interface AdvancedGameRound {
  gameSessionId: string
  gameRoundIds: string[]
  level: number
  sequenceLength: number
  chordPool: ChordPoolItem[]
  targetSequence: TargetSequenceItem[]
  sequenceAudioUrls: string[]
  instrument: {
    id: string
    name: string
    displayName: string
  }
}

export interface SequenceComparisonItem {
  position: number
  correct: boolean
  correctChordId: string
  submittedChordId: string
}

export interface AdvancedGameResult {
  isCorrect: boolean
  correctSequence: {
    id: string
    name: string
    displayName: string
    position: number
  }[]
  submittedSequence: {
    id: string
    name: string
    displayName: string
  }[]
  sequenceComparison: SequenceComparisonItem[]
  stats: {
    streak: number
    accuracy: number
    totalAttempts: number
    correctAnswers: number
  }
  responseTimeMs: number
}

export interface StartAdvancedGameResponse {
  success: boolean
  data: {
    gameRound: AdvancedGameRound
  }
}

export interface SubmitSequenceResponse {
  success: boolean
  data: {
    result: AdvancedGameResult
  }
}

export interface AdvancedGameApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export const advancedGameApi = {
  startGame: async (userId: string, instrumentId: string, level: number): Promise<StartAdvancedGameResponse> => {
    try {
      console.log("🎮 Starting advanced game API call:", { userId, instrumentId, level })

      const response = await fetch(`${process.env.API_BASE_URL}/advanced-game/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId,
          instrumentId,
          level,
        }),
      })

      console.log("📊 Start advanced game response status:", response.status)

      const data = await response.json()
      console.log("📥 Start advanced game response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Start advanced game failed with status:", response.status)

        // For 403 errors, throw the parsed error data so we can extract the subscription error
        if (response.status === 403) {
          throw new Error(JSON.stringify(data))
        }

        // For other errors, extract the message
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Advanced game start failed"
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Start advanced game network error:", error)
      throw error
    }
  },

  submitSequence: async (
    userId: string,
    gameSessionId: string,
    submittedSequence: string[],
    responseTimeMs: number,
  ): Promise<SubmitSequenceResponse> => {
    try {
      console.log("🎯 Submitting sequence API call:", { userId, gameSessionId, submittedSequence, responseTimeMs })

      const response = await fetch(`${process.env.API_BASE_URL}/advanced-game/submit-sequence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId,
          gameSessionId,
          submittedSequence,
          responseTimeMs,
        }),
      })

      console.log("📊 Submit sequence response status:", response.status)

      const data = await response.json()
      console.log("📥 Submit sequence response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Submit sequence failed with status:", response.status)

        // For 403 errors, throw the parsed error data
        if (response.status === 403) {
          throw new Error(JSON.stringify(data))
        }

        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Sequence submission failed"
        throw new Error(errorMessage)
      }

      // Log the stats for debugging
      if (data.data?.result?.stats) {
        console.log("📊 Updated stats from advanced game API:", {
          streak: data.data.result.stats.streak,
          accuracy: data.data.result.stats.accuracy,
          totalAttempts: data.data.result.stats.totalAttempts,
          correctAnswers: data.data.result.stats.correctAnswers,
        })
      }

      return data
    } catch (error) {
      console.error("💥 Submit sequence network error:", error)
      throw error
    }
  },
}
