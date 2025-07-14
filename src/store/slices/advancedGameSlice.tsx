import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  advancedGameApi,
  type AdvancedGameRound,
  type AdvancedGameResult,
  type StartAdvancedGameResponse,
  type SubmitSequenceResponse,
} from "@/src/services/advancedGameApi"

interface AdvancedGameState {
  currentGameRound: AdvancedGameRound | null
  gameResult: AdvancedGameResult | null
  isLoading: boolean
  isSubmittingSequence: boolean
  error: string | null
  errorCode: string | null
  currentLevel: number
  responseStartTime: number | null
  // Current stats from API
  currentStats: {
    streak: number
    accuracy: number
    totalAttempts: number
    correctAnswers: number
  }
  // User's current sequence selection
  selectedSequence: string[]
}

const initialState: AdvancedGameState = {
  currentGameRound: null,
  gameResult: null,
  isLoading: false,
  isSubmittingSequence: false,
  error: null,
  errorCode: null,
  currentLevel: 1,
  responseStartTime: null,
  currentStats: {
    streak: 0,
    accuracy: 0,
    totalAttempts: 0,
    correctAnswers: 0,
  },
  selectedSequence: [],
}

// Helper function to extract error details from API response
const extractErrorDetails = (errorString: string): { message: string; code?: string } => {
  try {
    // Try to parse as JSON first (for 403 errors with structured data)
    const errorData = JSON.parse(errorString)
    if (errorData.error) {
      return {
        message: errorData.error.message || "An unexpected error occurred",
        code: errorData.error.code,
      }
    }
    if (errorData.message) {
      return {
        message: errorData.message,
        code: undefined,
      }
    }
    // If it's a JSON object but doesn't match expected structure
    return {
      message: "An unexpected error occurred",
      code: undefined,
    }
  } catch {
    // If it's not JSON, treat as plain error message
    return {
      message: errorString,
      code: undefined,
    }
  }
}

// Async thunk for starting advanced game - userId is now optional
export const startAdvancedGame = createAsyncThunk<
  StartAdvancedGameResponse,
  { userId: string | null; instrumentId: string; level: number },
  { rejectValue: { message: string; code?: string } }
>("advancedGame/startGame", async ({ userId, instrumentId, level }, { rejectWithValue }) => {
  try {
    console.log("🎮 Starting advanced game with:", { userId, instrumentId, level, isGuestMode: !userId })
    const response = await advancedGameApi.startGame(userId, instrumentId, level)
    console.log("✅ Start advanced game successful:", response)
    return response
  } catch (error) {
    console.error("❌ Start advanced game error:", error)
    if (error instanceof Error) {
      const errorDetails = extractErrorDetails(error.message)
      console.log("📋 Extracted error details:", errorDetails)
      return rejectWithValue(errorDetails)
    }
    return rejectWithValue({ message: "Failed to start advanced game" })
  }
})

// Async thunk for submitting sequence - userId is now optional
export const submitSequence = createAsyncThunk<
  SubmitSequenceResponse,
  { userId: string | null; gameSessionId: string; submittedSequence: string[]; responseTimeMs: number },
  { rejectValue: { message: string; code?: string } }
>(
  "advancedGame/submitSequence",
  async ({ userId, gameSessionId, submittedSequence, responseTimeMs }, { rejectWithValue }) => {
    try {
      console.log("🎯 Submitting sequence:", {
        userId,
        gameSessionId,
        submittedSequence,
        responseTimeMs,
        isGuestMode: !userId,
      })
      const response = await advancedGameApi.submitSequence(userId, gameSessionId, submittedSequence, responseTimeMs)
      console.log("✅ Submit sequence successful:", response)
      return response
    } catch (error) {
      console.error("❌ Submit sequence error:", error)
      if (error instanceof Error) {
        const errorDetails = extractErrorDetails(error.message)
        return rejectWithValue(errorDetails)
      }
      return rejectWithValue({ message: "Failed to submit sequence" })
    }
  },
)

const advancedGameSlice = createSlice({
  name: "advancedGame",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      state.errorCode = null
    },
    clearGameResult: (state) => {
      state.gameResult = null
    },
    setCurrentLevel: (state, action: PayloadAction<number>) => {
      state.currentLevel = action.payload
    },
    startResponseTimer: (state) => {
      state.responseStartTime = Date.now()
    },
    resetGame: (state) => {
      state.currentGameRound = null
      state.gameResult = null
      state.error = null
      state.errorCode = null
      state.responseStartTime = null
      state.selectedSequence = []
      // Reset stats when game is reset
      state.currentStats = {
        streak: 0,
        accuracy: 0,
        totalAttempts: 0,
        correctAnswers: 0,
      }
      state.currentLevel = 1 // Ensure level is reset to 1 on full game reset
    },
    // NEW: Action to clear only round-specific data, keeping level and stats
    clearRoundData: (state) => {
      state.currentGameRound = null
      state.gameResult = null
      state.selectedSequence = []
      state.responseStartTime = null // Clear response start time for new round
    },
    // Actions for managing selected sequence
    addToSequence: (state, action: PayloadAction<string>) => {
      if (state.currentGameRound && state.selectedSequence.length < state.currentGameRound.sequenceLength) {
        state.selectedSequence.push(action.payload)
      }
    },
    removeFromSequence: (state, action: PayloadAction<number>) => {
      state.selectedSequence.splice(action.payload, 1)
    },
    clearSequence: (state) => {
      state.selectedSequence = []
    },
    updateStats: (
      state,
      action: PayloadAction<{ streak: number; accuracy: number; totalAttempts: number; correctAnswers: number }>,
    ) => {
      state.currentStats = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Start advanced game
      .addCase(startAdvancedGame.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.errorCode = null
        state.gameResult = null
        state.selectedSequence = []
      })
      .addCase(startAdvancedGame.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentGameRound = action.payload.data.gameRound
        state.currentLevel = action.payload.data.gameRound.level // Level is updated on success
        state.error = null
        state.errorCode = null
        state.responseStartTime = Date.now() // Start timer when game loads
        state.selectedSequence = [] // Reset sequence

        // Log audio URLs for debugging
        console.log("🎵 AdvancedGameSlice: Game round loaded with audio URLs:")
        if (action.payload.data.gameRound.sequenceAudioUrls) {
          action.payload.data.gameRound.sequenceAudioUrls.forEach((url, index) => {
            const fileName = url.split("/").pop() || url
            console.log(`🎵 Audio ${index + 1}: ${url}`)
            console.log(`🎵 File name: ${fileName}`)
          })
        }
      })
      .addCase(startAdvancedGame.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to start advanced game"
        state.errorCode = action.payload?.code || null
        console.log("🔴 Advanced game start rejected:", { error: state.error, code: state.errorCode })
        // currentLevel is NOT changed here, it remains at its value before the attempt
      })
      // Submit sequence
      .addCase(submitSequence.pending, (state) => {
        state.isSubmittingSequence = true
        state.error = null
        state.errorCode = null
      })
      .addCase(submitSequence.fulfilled, (state, action) => {
        state.isSubmittingSequence = false
        state.gameResult = action.payload.data.result
        state.error = null
        state.errorCode = null

        // Update current stats from the API response
        if (action.payload.data.result.stats) {
          state.currentStats = action.payload.data.result.stats
          console.log("📊 Advanced game stats updated in Redux:", state.currentStats)
        }
      })
      .addCase(submitSequence.rejected, (state, action) => {
        state.isSubmittingSequence = false
        state.error = action.payload?.message || "Failed to submit sequence"
        state.errorCode = action.payload?.code || null
      })
  },
})

export const {
  clearError,
  clearGameResult,
  setCurrentLevel,
  startResponseTimer,
  resetGame,
  clearRoundData, // Export the new action
  addToSequence,
  removeFromSequence,
  clearSequence,
  updateStats,
} = advancedGameSlice.actions

export default advancedGameSlice.reducer
