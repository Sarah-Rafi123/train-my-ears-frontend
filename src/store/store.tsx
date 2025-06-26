import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import gameReducer from "./slices/gameSlice"
import instrumentsReducer from './slices/instrumentSlice'
import advancedGameReducer from "./slices/advancedGameSlice" 
import feedbackReducer from "./slices/feedbackSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    instruments: instrumentsReducer,
    advancedGame: advancedGameReducer,
    feedback: feedbackReducer, 
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
