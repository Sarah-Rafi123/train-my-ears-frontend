// Types for the API responses
export interface ChordOption {
  id: string
  name: string
  displayName: string
  audioFileUrl?: string
}

export interface GameRound {
  gameRoundId: string
  level: number
  targetChord: {
    id: string
    name: string
    displayName: string
    audioFileUrl: string
  }
  chordOptions: ChordOption[]
}

export interface GameResult {
  isCorrect: boolean
  correctChord: {
    id: string
    name: string
    displayName: string
  }
  selectedChord: {
    id: string
    name: string
    displayName: string
  }
  stats: {
    streak: number
    accuracy: number
    totalAttempts: number
    correctAnswers: number
  }
  feedback?: string
}

export interface StartGameResponse {
  success: boolean
  data: {
    gameRound: GameRound
  }
}

export interface SubmitAnswerResponse {
  success: boolean
  data: {
    result: GameResult
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export const gameApi = {
  startGame: async (userId: string, instrumentId: string, level: number): Promise<StartGameResponse> => {
    try {
      console.log("🎮 Starting game API call:", { userId, instrumentId, level })
      const response = await fetch(`http://16.16.104.51/api/simple-game/start`, {
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

      console.log("📊 Start game response status:", response.status)

      const data = await response.json()
      console.log("📥 Start game response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Start game failed with status:", response.status)

        // For 403 errors, throw the parsed error data so we can extract the subscription error
        if (response.status === 403) {
          throw new Error(JSON.stringify(data))
        }

        // For other errors, extract the message
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Game start failed"
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Start game network error:", error)
      throw error
    }
  },

  submitAnswer: async (
    userId: string,
    gameRoundId: string,
    selectedChordId: string,
    responseTimeMs: number,
  ): Promise<SubmitAnswerResponse> => {
    try {
      console.log("🎯 Submitting answer API call:", { userId, gameRoundId, selectedChordId, responseTimeMs })

      const response = await fetch(`http://16.16.104.51/api/simple-game/submit-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId,
          gameRoundId,
          selectedChordId,
          responseTimeMs,
        }),
      })

      console.log("📊 Submit answer response status:", response.status)

      const data = await response.json()
      console.log("📥 Submit answer response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Submit answer failed with status:", response.status)

        // For 403 errors, throw the parsed error data
        if (response.status === 403) {
          throw new Error(JSON.stringify(data))
        }

        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Answer submission failed"
        throw new Error(errorMessage)
      }

      // Log the stats for debugging
      if (data.data?.result?.stats) {
        console.log("📊 Updated stats from API:", {
          streak: data.data.result.stats.streak,
          accuracy: data.data.result.stats.accuracy,
          totalAttempts: data.data.result.stats.totalAttempts,
          correctAnswers: data.data.result.stats.correctAnswers,
        })
      }

      return data
    } catch (error) {
      console.error("💥 Submit answer network error:", error)
      throw error
    }
  },
}
