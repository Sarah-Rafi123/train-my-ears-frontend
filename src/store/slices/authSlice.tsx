import AsyncStorage from "@react-native-async-storage/async-storage"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

// Types
interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt?: string
  subscriptionId?: string | null
  currentLevel: number
  currentStreak: number
  overallAccuracy: number
  totalGamesPlayed: number
  lastPlayedAt?: string | null
}

interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
    refreshToken: string
  }
}

interface ErrorResponse {
  error?: {
    message?: string
  }
  message?: string
  success: boolean
}

interface AuthState {
  user: User | null
  userId: string | null // Added userId to state
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

// Helper function to extract error message from various response formats
const extractErrorMessage = (data: any): string => {
  // Format: { error: { message: "Error message" } }
  if (data.error && data.error.message) {
    return data.error.message
  }

  // Format: { message: "Error message" }
  if (data.message) {
    return data.message
  }

  // Fallback
  return "An unexpected error occurred. Please try again."
}

// Helper function to save auth data to AsyncStorage with logging
const saveAuthDataToStorage = async (token: string, refreshToken: string, user: User) => {
  try {
    const userId = user.id // Extract user ID

    console.log("🔐 Saving authentication data to AsyncStorage...")
    console.log("📝 Token:", token)
    console.log("🔄 Refresh Token:", refreshToken)
    console.log("🆔 User ID:", userId) // Log user ID specifically
    console.log("📧 User Email:", user.email)
    console.log("👨‍💼 User Name:", user.name)
    console.log("📊 User Level:", user.currentLevel)
    console.log("🔥 User Streak:", user.currentStreak)
    console.log("🎯 User Accuracy:", user.overallAccuracy)
    console.log("🎮 Total Games:", user.totalGamesPlayed)
    console.log("📅 Created At:", user.createdAt)

    // Save to AsyncStorage
    await AsyncStorage.setItem("token", token)
    await AsyncStorage.setItem("refreshToken", refreshToken)
    await AsyncStorage.setItem("user", JSON.stringify(user))
    await AsyncStorage.setItem("userId", userId) // Save user ID separately

    console.log("✅ Successfully saved all authentication data to AsyncStorage")

    // Verify data was saved correctly
    const savedToken = await AsyncStorage.getItem("token")
    const savedRefreshToken = await AsyncStorage.getItem("refreshToken")
    const savedUser = await AsyncStorage.getItem("user")
    const savedUserId = await AsyncStorage.getItem("userId")

    console.log("🔍 Verification - Saved Token:", savedToken ? "✅ Present" : "❌ Missing")
    console.log("🔍 Verification - Saved Refresh Token:", savedRefreshToken ? "✅ Present" : "❌ Missing")
    console.log("🔍 Verification - Saved User:", savedUser ? "✅ Present" : "❌ Missing")
    console.log("🔍 Verification - Saved User ID:", savedUserId)

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      console.log("🔍 Verification - Parsed User Object:", parsedUser)
    }
  } catch (error) {
    console.error("❌ Error saving authentication data to AsyncStorage:", error)
    throw error
  }
}

// Helper function to clear auth data from AsyncStorage
const clearAuthDataFromStorage = async () => {
  try {
    console.log("🗑️ Clearing authentication data from AsyncStorage...")
    await AsyncStorage.multiRemove(["token", "refreshToken", "user", "userId"])
    console.log("✅ Successfully cleared all stored auth data")
  } catch (error) {
    console.error("❌ Error clearing stored auth data:", error)
    throw error
  }
}

// Initial state
const initialState: AuthState = {
  user: null,
  userId: null, // Added userId to initial state
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

// Async thunk for registration
export const registerUser = createAsyncThunk<AuthResponse, RegisterData, { rejectValue: string }>(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("🚀 Starting registration process...")
      console.log(process.env.API_BASE_URL)
      console.log("📡 Making registration API call to:", `${process.env.API_BASE_URL}/auth/register`)
      console.log("📤 Request data:", {
        name: userData.name,
        email: userData.email,
        password: "[HIDDEN]", // Don't log password
      })

      const response = await fetch(`${process.env.API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      const data = await response.json()
      console.log("📥 Full API Response:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Registration failed with status:", response.status)
        console.error("❌ Error response:", data)
        return rejectWithValue(extractErrorMessage(data))
      }

      // Validate response structure
      if (!data.success || !data.data || !data.data.user || !data.data.token || !data.data.refreshToken) {
        console.error("❌ Invalid response structure:", data)
        return rejectWithValue("Invalid response from server")
      }

      // Extract user ID
      const userId = data.data.user.id
      console.log("✅ Registration successful!")
      console.log("🆔 User ID extracted:", userId)
      console.log("🎉 New user registered:", {
        id: userId,
        name: data.data.user.name,
        email: data.data.user.email,
        level: data.data.user.currentLevel,
      })

      // Save authentication data to AsyncStorage with detailed logging
      await saveAuthDataToStorage(data.data.token, data.data.refreshToken, data.data.user)

      return data
    } catch (error) {
      console.error("💥 Registration network error:", error)
      if (error instanceof Error) {
        return rejectWithValue(`Network error: ${error.message}`)
      }
      return rejectWithValue("Network error. Please check your connection and try again.")
    }
  },
)

// Async thunk for login
export const loginUser = createAsyncThunk<AuthResponse, LoginData, { rejectValue: string }>(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      console.log("🚀 Starting login process...")
      console.log(process.env.API_BASE_URL)
      console.log("📡 Making login API call to:", `${process.env.API_BASE_URL}/auth/login`)
      console.log("📤 Request data:", {
        email: loginData.email,
        password: "[HIDDEN]", // Don't log password
      })

      const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(loginData),
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      const data = await response.json()
      console.log("📥 Full API Response:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Login failed with status:", response.status)
        console.error("❌ Error response:", data)
        return rejectWithValue(extractErrorMessage(data))
      }

      // Validate response structure
      if (!data.success || !data.data || !data.data.user || !data.data.token || !data.data.refreshToken) {
        console.error("❌ Invalid response structure:", data)
        return rejectWithValue("Invalid response from server")
      }

      // Extract user ID
      const userId = data.data.user.id
      console.log("✅ Login successful!")
      console.log("🆔 User ID extracted:", userId)
      console.log("🎉 User logged in:", {
        id: userId,
        name: data.data.user.name,
        email: data.data.user.email,
        level: data.data.user.currentLevel,
        streak: data.data.user.currentStreak,
        accuracy: data.data.user.overallAccuracy,
        totalGames: data.data.user.totalGamesPlayed,
      })

      // Save authentication data to AsyncStorage with detailed logging
      await saveAuthDataToStorage(data.data.token, data.data.refreshToken, data.data.user)

      return data
    } catch (error) {
      console.error("💥 Login network error:", error)
      if (error instanceof Error) {
        return rejectWithValue(`Network error: ${error.message}`)
      }
      return rejectWithValue("Network error. Please check your connection and try again.")
    }
  },
)

// Async thunk for logout
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 Starting logout process...")
      
      // Get refresh token from AsyncStorage
      const refreshToken = await AsyncStorage.getItem("refreshToken")
      
      if (!refreshToken) {
        console.log("ℹ️ No refresh token found, proceeding with local logout")
        await clearAuthDataFromStorage()
        return
      }

      console.log("📡 Making logout API call to:", `${process.env.API_BASE_URL}/auth/logout`)
      console.log("📤 Request data: { refreshToken: [HIDDEN] }")
      
      const response = await fetch(`${process.env.API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      console.log("📊 Logout response status:", response.status)
      console.log("📊 Logout response ok:", response.ok)

      if (!response.ok) {
        const data = await response.json()
        console.error("❌ Logout API failed:", data)
        console.log("⚠️ Continuing with local logout despite API failure")
      } else {
        console.log("✅ Successfully logged out from server")
      }

      // Always clear local data regardless of API response
      await clearAuthDataFromStorage()

    } catch (error) {
      console.error("💥 Logout network error:", error)
      console.log("⚠️ Continuing with local logout despite network error")
      
      // Still clear local data even if network fails
      try {
        await clearAuthDataFromStorage()
      } catch (storageError) {
        console.error("❌ Failed to clear local storage:", storageError)
        return rejectWithValue("Failed to clear local authentication data")
      }
    }
  },
)

// Async thunk to load stored auth data
export const loadStoredAuth = createAsyncThunk("auth/loadStored", async () => {
  try {
    console.log("🔍 Loading stored authentication data...")

    const token = await AsyncStorage.getItem("token")
    const refreshToken = await AsyncStorage.getItem("refreshToken")
    const userString = await AsyncStorage.getItem("user")
    const userId = await AsyncStorage.getItem("userId")

    console.log("📱 Stored Token:", token ? "✅ Found" : "❌ Not found")
    console.log("📱 Stored Refresh Token:", refreshToken ? "✅ Found" : "❌ Not found")
    console.log("📱 Stored User:", userString ? "✅ Found" : "❌ Not found")
    console.log("📱 Stored User ID:", userId)

    if (token && refreshToken && userString) {
      const user = JSON.parse(userString)
      console.log("✅ Successfully loaded stored auth data:")
      console.log("🆔 User ID:", userId)
      console.log("👤 User ID from user object:", user.id)
      console.log("📧 User Email:", user.email)
      console.log("👨‍💼 User Name:", user.name)
      console.log("📊 User Level:", user.currentLevel)

      return { token, refreshToken, user, userId }
    }

    console.log("ℹ️ No stored authentication data found")
    return null
  } catch (error) {
    console.error("❌ Error loading stored auth data:", error)
    return null
  }
})

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      console.log("🧹 Clearing auth error")
      state.error = null
    },
    logout: (state) => {
      console.log("👋 Synchronous logout - clearing state...")
      console.log("🗑️ Clearing user data:", {
        userId: state.userId,
        userEmail: state.user?.email,
      })

      state.user = null
      state.userId = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null

      // Clear AsyncStorage (fire and forget for sync action)
      clearAuthDataFromStorage().catch((error) => {
        console.error("❌ Error in sync logout storage clear:", error)
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        console.log("⏳ Registration pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("✅ Registration fulfilled - updating state")
        const userId = action.payload.data.user.id
        console.log("📝 Setting user data in Redux state:", {
          userId: userId,
          userName: action.payload.data.user.name,
          userEmail: action.payload.data.user.email,
        })

        state.isLoading = false
        state.user = action.payload.data.user
        state.userId = userId // Set userId in state
        state.token = action.payload.data.token
        state.refreshToken = action.payload.data.refreshToken
        state.isAuthenticated = true
        state.error = null

        console.log("🎯 Redux state updated - user is now authenticated with ID:", userId)
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.log("❌ Registration rejected:", action.payload)
        state.isLoading = false
        state.error = action.payload || "Registration failed"
      })
      // Login user
      .addCase(loginUser.pending, (state) => {
        console.log("⏳ Login pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ Login fulfilled - updating state")
        const userId = action.payload.data.user.id
        console.log("📝 Setting user data in Redux state:", {
          userId: userId,
          userName: action.payload.data.user.name,
          userEmail: action.payload.data.user.email,
          userLevel: action.payload.data.user.currentLevel,
          userStreak: action.payload.data.user.currentStreak,
        })

        state.isLoading = false
        state.user = action.payload.data.user
        state.userId = userId // Set userId in state
        state.token = action.payload.data.token
        state.refreshToken = action.payload.data.refreshToken
        state.isAuthenticated = true
        state.error = null

        console.log("🎯 Redux state updated - user is now authenticated with ID:", userId)
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("❌ Login rejected:", action.payload)
        state.isLoading = false
        state.error = action.payload || "Login failed"
      })
      // Logout user (async)
      .addCase(logoutUser.pending, (state) => {
        console.log("⏳ Logout pending...")
        state.isLoading = true
        state.error = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("✅ Logout fulfilled - clearing state")
        state.user = null
        state.userId = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        console.log("🎯 User successfully logged out and state cleared")
      })
      .addCase(logoutUser.rejected, (state, action) => {
        console.log("❌ Logout rejected but clearing state anyway:", action.payload)
        // Still clear local data even if API call failed
        state.user = null
        state.userId = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        console.log("🎯 Local logout completed despite API error")
      })
      // Load stored auth
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          console.log("✅ Loaded stored auth - updating state")
          const userId = action.payload.userId || action.payload.user.id
          console.log("📝 Restoring user session:", {
            userId: userId,
            userName: action.payload.user.name,
            userEmail: action.payload.user.email,
          })

          state.user = action.payload.user
          state.userId = userId // Set userId in state
          state.token = action.payload.token
          state.refreshToken = action.payload.refreshToken
          state.isAuthenticated = true

          console.log("🎯 User session restored successfully with ID:", userId)
        } else {
          console.log("ℹ️ No stored auth data to load")
        }
      })
  },
})

export const { clearError, logout } = authSlice.actions
export default authSlice.reducer