import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  gameApi,
  type GameRound,
  type GameResult,
  type StartGameResponse,
  type SubmitAnswerResponse,
} from "@/src/services/gameApi"

interface GameState {
  currentGameRound: GameRound | null
  gameResult: GameResult | null
  isLoading: boolean
  isSubmittingAnswer: boolean
  error: string | null
  errorCode: string | null
  currentLevel: number
  responseStartTime: number | null
  // Add current stats to state
  currentStats: {
    streak: number
    accuracy: number
    totalAttempts: number
    correctAnswers: number
  }
}

const initialState: GameState = {
  currentGameRound: null,
  gameResult: null,
  isLoading: false,
  isSubmittingAnswer: false,
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

// Async thunk for starting game
export const startGame = createAsyncThunk<
  StartGameResponse,
  { userId: string; instrumentId: string; level: number },
  { rejectValue: { message: string; code?: string } }
>("game/startGame", async ({ userId, instrumentId, level }, { rejectWithValue }) => {
  try {
    console.log("🎮 Starting game with:", { userId, instrumentId, level })
    const response = await gameApi.startGame(userId, instrumentId, level)
    console.log("✅ Start game successful:", response)
    return response
  } catch (error) {
    console.error("❌ Start game error:", error)

    if (error instanceof Error) {
      const errorDetails = extractErrorDetails(error.message)
      console.log("📋 Extracted error details:", errorDetails)
      return rejectWithValue(errorDetails)
    }

    return rejectWithValue({ message: "Failed to start game" })
  }
})

// Async thunk for submitting answer
export const submitAnswer = createAsyncThunk<
  SubmitAnswerResponse,
  { userId: string; gameRoundId: string; selectedChordId: string; responseTimeMs: number },
  { rejectValue: { message: string; code?: string } }
>("game/submitAnswer", async ({ userId, gameRoundId, selectedChordId, responseTimeMs }, { rejectWithValue }) => {
  try {
    console.log("🎯 Submitting answer:", { userId, gameRoundId, selectedChordId, responseTimeMs })
    const response = await gameApi.submitAnswer(userId, gameRoundId, selectedChordId, responseTimeMs)
    console.log("✅ Submit answer successful:", response)
    return response
  } catch (error) {
    console.error("❌ Submit answer error:", error)

    if (error instanceof Error) {
      const errorDetails = extractErrorDetails(error.message)
      return rejectWithValue(errorDetails)
    }

    return rejectWithValue({ message: "Failed to submit answer" })
  }
})

const gameSlice = createSlice({
  name: "game",
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
      // Reset stats when game is reset
      state.currentStats = {
        streak: 0,
        accuracy: 0,
        totalAttempts: 0,
        correctAnswers: 0,
      }
    },
    // Add action to update stats manually if needed
    updateStats: (
      state,
      action: PayloadAction<{ streak: number; accuracy: number; totalAttempts: number; correctAnswers: number }>,
    ) => {
      state.currentStats = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Start game
      .addCase(startGame.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.errorCode = null
        state.gameResult = null
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentGameRound = action.payload.data.gameRound
        state.currentLevel = action.payload.data.gameRound.level
        state.error = null
        state.errorCode = null
        state.responseStartTime = Date.now() // Start timer when game loads
      })
      .addCase(startGame.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to start game"
        state.errorCode = action.payload?.code || null
        console.log("🔴 Game start rejected:", { error: state.error, code: state.errorCode })
      })
      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.isSubmittingAnswer = true
        state.error = null
        state.errorCode = null
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.isSubmittingAnswer = false
        state.gameResult = action.payload.data.result
        state.error = null
        state.errorCode = null

        // Update current stats from the API response
        if (action.payload.data.result.stats) {
          state.currentStats = action.payload.data.result.stats
          console.log("📊 Stats updated in Redux:", state.currentStats)
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.isSubmittingAnswer = false
        state.error = action.payload?.message || "Failed to submit answer"
        state.errorCode = action.payload?.code || null
      })
  },
})

export const { clearError, clearGameResult, setCurrentLevel, startResponseTimer, resetGame, updateStats } =
  gameSlice.actions
export default gameSlice.reducer
