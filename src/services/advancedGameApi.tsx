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
      console.log(process.env.API_BASE_URL)
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

      // Log audio URLs for debugging
      if (data.data?.gameRound) {
        advancedGameApi.logAudioUrls(data.data.gameRound)
      }

      return data
    } catch (error) {
      console.error("💥 Start advanced game network error:", error)
      throw error
    }
  },

  // Add retry logic with exponential backoff to the submitSequence function
  submitSequence: async (
    userId: string,
    gameSessionId: string,
    submittedSequence: string[],
    responseTimeMs: number,
  ): Promise<SubmitSequenceResponse> => {
    const maxRetries = 3
    let retries = 0
    let delay = 1000 // Start with 1 second delay

    while (retries <= maxRetries) {
      try {
        console.log(`🎯 Submitting sequence API call (attempt ${retries + 1}/${maxRetries + 1}):`, {
          userId,
          gameSessionId,
          submittedSequence,
          responseTimeMs,
        })

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

        // If we hit a rate limit, wait and retry
        if (response.status === 429) {
          if (retries < maxRetries) {
            console.log(`⏱️ Rate limited. Retrying in ${delay / 1000} seconds...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            retries++
            delay *= 2 // Exponential backoff
            continue
          }
        }

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
        // If we've exhausted our retries, throw the error
        if (retries >= maxRetries) {
          console.error("💥 Submit sequence network error after all retries:", error)
          throw error
        }

        console.error(`💥 Submit sequence error (attempt ${retries + 1}/${maxRetries + 1}):`, error)
        retries++
        delay *= 2 // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    // This should never be reached due to the throw in the catch block
    throw new Error("Failed to submit sequence after multiple retries")
  },

  // Utility function to log audio URLs for debugging
  logAudioUrls: (gameRound: AdvancedGameRound) => {
    console.log("🎵 API: Received audio URLs from server:")

    if (gameRound.sequenceAudioUrls && gameRound.sequenceAudioUrls.length > 0) {
      gameRound.sequenceAudioUrls.forEach((url, index) => {
        const fileName = url.split("/").pop() || url
        console.log(`🎵 Audio ${index + 1}: ${url}`)
        console.log(`🎵 File name: ${fileName}`)
      })
    } else {
      console.log("⚠️ API: No audio URLs found in game round")
    }

    if (gameRound.targetSequence && gameRound.targetSequence.length > 0) {
      console.log("🎵 API: Target sequence audio URLs:")
      gameRound.targetSequence.forEach((item, index) => {
        if (item.audioFileUrl) {
          const fileName = item.audioFileUrl.split("/").pop() || item.audioFileUrl
          console.log(`🎵 Target ${index + 1}: ${item.audioFileUrl}`)
          console.log(`🎵 File name: ${fileName}`)
        }
      })
    }
  },

  // Get user progress for the advanced game
  getUserProgress: async (userId: string): Promise<any> => {
    try {
      console.log("📊 Getting user progress:", { userId })

      const response = await fetch(`${process.env.API_BASE_URL}/users/${userId}/progress`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("📊 User progress response status:", response.status)

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Get user progress failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Get user progress error:", error)
      throw error
    }
  },

  // Get available instruments
  getInstruments: async (): Promise<any> => {
    try {
      console.log("🎸 Getting available instruments")

      const response = await fetch(`${process.env.API_BASE_URL}/instruments`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("🎸 Instruments response status:", response.status)

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Get instruments failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Get instruments error:", error)
      throw error
    }
  },

  // Get available levels
  getLevels: async (): Promise<any> => {
    try {
      console.log("🏆 Getting available levels")

      const response = await fetch(`${process.env.API_BASE_URL}/levels`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("🏆 Levels response status:", response.status)

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Get levels failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Get levels error:", error)
      throw error
    }
  },

  // Get game history for a user
  getGameHistory: async (userId: string, limit = 10): Promise<any> => {
    try {
      console.log("📜 Getting game history:", { userId, limit })

      const response = await fetch(`${process.env.API_BASE_URL}/users/${userId}/history?limit=${limit}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("📜 Game history response status:", response.status)

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Get game history failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Get game history error:", error)
      throw error
    }
  },
}

export default advancedGameApi
