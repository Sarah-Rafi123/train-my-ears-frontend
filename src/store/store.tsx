import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import gameReducer from "./slices/gameSlice"
import instrumentsReducer from './slices/instrumentSlice'
import advancedGameReducer from "./slices/advancedGameSlice" // Add this import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    instruments: instrumentsReducer,
    advancedGame: advancedGameReducer, // Add this line
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
