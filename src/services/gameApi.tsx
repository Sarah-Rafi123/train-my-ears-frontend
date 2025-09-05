import { BASE_URL } from '../constants/urls.constant';

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
  instrument: {
    id: string
    name: string
    displayName: string
  }
  totalChordsAvailable?: number
  levelInfo?: {
    currentLevel: number
    description: string
    chordsFromLevel1: number
    chordsFromLevel2: number
    chordsFromLevel3: number
    chordsFromLevel4: number
  }
  isGuestMode?: boolean
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
  isGuestMode?: boolean
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
  startGame: async (userId: string | null, instrumentId: string, level: number): Promise<StartGameResponse> => {
    try {

      const requestBody: any = {
        instrumentId,
        level,
      }

      // Only include userId if it's not null (for authenticated users)
      if (userId) {
        requestBody.userId = userId
      }

      const response = await fetch(`${BASE_URL}api/simple-game/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()

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
    userId: string | null,
    gameRoundId: string,
    selectedChordId: string,
    responseTimeMs: number,
  ): Promise<SubmitAnswerResponse> => {
    try {

      const requestBody: any = {
        gameRoundId,
        selectedChordId,
        responseTimeMs,
      }

      // Only include userId if it's not null (for authenticated users)
      if (userId) {
        requestBody.userId = userId
      }

      const response = await fetch(`${BASE_URL}api/simple-game/submit-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()

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


      return data
    } catch (error) {
      console.error("💥 Submit answer network error:", error)
      throw error
    }
  },
}