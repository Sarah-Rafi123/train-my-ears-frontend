import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { feedbackService } from "@/src/services/feedbackService"

interface FeedbackState {
  isSubmitting: boolean
  error: string | null
  lastSubmissionId: string | null
}

interface SubmitFeedbackData {
  message: string
  email?: string
}

const initialState: FeedbackState = {
  isSubmitting: false,
  error: null,
  lastSubmissionId: null,
}

// Async thunk for submitting feedback
export const submitFeedback = createAsyncThunk<
  { id: string; message: string; email?: string; createdAt: string },
  SubmitFeedbackData,
  { rejectValue: string }
>("feedback/submit", async (feedbackData, { rejectWithValue }) => {
  try {
    console.log("🚀 Redux: Starting feedback submission...")
    const response = await feedbackService.submitFeedback(feedbackData)
    console.log("✅ Redux: Feedback submitted successfully")
    return response.data.feedback
  } catch (error) {
    console.error("❌ Redux: Feedback submission failed:", error)
    if (error instanceof Error) {
      return rejectWithValue(error.message)
    }
    return rejectWithValue("Failed to submit feedback")
  }
})

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearLastSubmission: (state) => {
      state.lastSubmissionId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFeedback.pending, (state) => {
        console.log("⏳ Redux: Feedback submission pending...")
        state.isSubmitting = true
        state.error = null
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        console.log("✅ Redux: Feedback submission fulfilled")
        state.isSubmitting = false
        state.lastSubmissionId = action.payload.id
        state.error = null
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        console.log("❌ Redux: Feedback submission rejected:", action.payload)
        state.isSubmitting = false
        state.error = action.payload || "Failed to submit feedback"
      })
  },
})

export const { clearError, clearLastSubmission } = feedbackSlice.actions
export default feedbackSlice.reducer
