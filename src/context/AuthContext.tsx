"use client"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { loadStoredAuth, logoutUser } from "../store/slices/authSlice"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useClerk } from "@clerk/clerk-expo" // Import useClerk
import { revenueCatService } from "../services/revenueCatService"

interface AuthContextType {
  user: any
  userId: string | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  // Instrument IDs
  guitarId: string | null | "cmbyuwdi00002qlhguosiz78c"
  pianoId: string | null | "cmbyuwdi20003qlhg0w2epml0"
  // Utility functions
  getStoredAuthData: () => Promise<any>
  getStoredToken: () => Promise<string | null>
  getStoredUserId: () => Promise<string | null>
  getStoredUser: () => Promise<any>
  logAllStoredData: () => Promise<void>
  // Instrument functions
  setGuitarId: (id: string) => Promise<void>
  setPianoId: (id: string) => Promise<void>
  getStoredInstrumentIds: () => Promise<{ guitarId: string | null; pianoId: string | null }>
  // Auth functions
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const { user, userId, token, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const { signOut } = useClerk() // Get signOut from Clerk

  // Local state for instrument IDs
  const [guitarId, setGuitarIdState] = useState<string | null>(null)
  const [pianoId, setPianoIdState] = useState<string | null>(null)

  useEffect(() => {
    console.log("🚀 AuthProvider: Loading stored authentication data...")
    dispatch(loadStoredAuth())
    // Load stored instrument IDs
    loadStoredInstrumentIds()
  }, [dispatch])

  // Load stored instrument IDs from AsyncStorage
  const loadStoredInstrumentIds = async () => {
    try {
      const storedGuitarId = await AsyncStorage.getItem("guitarId")
      const storedPianoId = await AsyncStorage.getItem("pianoId")
      if (storedGuitarId) {
        setGuitarIdState(storedGuitarId)
        console.log("🎸 AuthProvider: Loaded stored guitar ID:", storedGuitarId)
      }
      if (storedPianoId) {
        setPianoIdState(storedPianoId)
        console.log("🎹 AuthProvider: Loaded stored piano ID:", storedPianoId)
      }
    } catch (error) {
      console.error("❌ AuthProvider: Error loading stored instrument IDs:", error)
    }
  }

  useEffect(() => {
    const clearOldInstrumentIds = async () => {
      await AsyncStorage.removeItem("guitarId")
      await AsyncStorage.removeItem("pianoId")
      console.log("🧹 Cleared old instrument IDs from storage.")
    }
    clearOldInstrumentIds()
  }, [])

  // Log authentication state changes
  useEffect(() => {
    console.log("🔄 AuthProvider: Authentication state changed:", {
      isAuthenticated,
      hasUser: !!user,
      userId: userId,
      hasToken: !!token,
      isLoading,
      userEmail: user?.email,
      guitarId,
      pianoId,
    })
  }, [isAuthenticated, user, userId, token, isLoading, guitarId, pianoId])

  // Function to set and store guitar ID
  const setGuitarId = async (id: string) => {
    try {
      await AsyncStorage.setItem("guitarId", id)
      setGuitarIdState(id)
      console.log("🎸 AuthProvider: Guitar ID saved:", id)
    } catch (error) {
      console.error("❌ AuthProvider: Error saving guitar ID:", error)
    }
  }

  // Function to set and store piano ID
  const setPianoId = async (id: string) => {
    try {
      await AsyncStorage.setItem("pianoId", id)
      setPianoIdState(id)
      console.log("🎹 AuthProvider: Piano ID saved:", id)
    } catch (error) {
      console.error("❌ AuthProvider: Error saving piano ID:", error)
    }
  }

  // Function to get stored instrument IDs
  const getStoredInstrumentIds = async () => {
    try {
      const storedGuitarId = await AsyncStorage.getItem("guitarId")
      const storedPianoId = await AsyncStorage.getItem("pianoId")
      console.log("🎵 AuthProvider: Retrieved instrument IDs:", {
        guitarId: storedGuitarId,
        pianoId: storedPianoId,
      })
      return {
        guitarId: storedGuitarId,
        pianoId: storedPianoId,
      }
    } catch (error) {
      console.error("❌ AuthProvider: Error getting stored instrument IDs:", error)
      return { guitarId: null, pianoId: null }
    }
  }

  // Utility function to get all stored auth data
  const getStoredAuthData = async () => {
    try {
      console.log("🔍 AuthContext: Getting all stored auth data...")
      const storedToken = await AsyncStorage.getItem("token")
      const storedRefreshToken = await AsyncStorage.getItem("refreshToken")
      const storedUserString = await AsyncStorage.getItem("user")
      const storedUserId = await AsyncStorage.getItem("userId")
      const storedGuitarId = await AsyncStorage.getItem("guitarId")
      const storedPianoId = await AsyncStorage.getItem("pianoId")
      const authData = {
        token: storedToken,
        refreshToken: storedRefreshToken,
        user: storedUserString ? JSON.parse(storedUserString) : null,
        userId: storedUserId,
        guitarId: storedGuitarId,
        pianoId: storedPianoId,
      }
      console.log("📱 AuthContext: Retrieved auth data:", {
        hasToken: !!storedToken,
        hasRefreshToken: !!storedRefreshToken,
        hasUser: !!storedUserString,
        hasUserId: !!storedUserId,
        userId: storedUserId,
        guitarId: storedGuitarId,
        pianoId: storedPianoId,
      })
      return authData
    } catch (error) {
      console.error("❌ AuthContext: Error getting stored auth data:", error)
      return null
    }
  }

  // Utility function to get stored token
  const getStoredToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token")
      console.log("🔑 AuthContext: Retrieved token:", storedToken ? "✅ Present" : "❌ Missing")
      return storedToken
    } catch (error) {
      console.error("❌ AuthContext: Error getting stored token:", error)
      return null
    }
  }

  // Utility function to get stored user ID
  const getStoredUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId")
      console.log("🆔 AuthContext: Retrieved user ID:", storedUserId || "❌ Missing")
      return storedUserId
    } catch (error) {
      console.error("❌ AuthContext: Error getting stored user ID:", error)
      return null
    }
  }

  // Utility function to get stored user
  const getStoredUser = async () => {
    try {
      const storedUserString = await AsyncStorage.getItem("user")
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString)
        console.log("👨‍💼 AuthContext: Retrieved user:", {
          id: storedUser.id,
          name: storedUser.name,
          email: storedUser.email,
          level: storedUser.currentLevel,
        })
        return storedUser
      }
      console.log("👤 AuthContext: No stored user found")
      return null
    } catch (error) {
      console.error("❌ AuthContext: Error getting stored user:", error)
      return null
    }
  }

  // Function to log all stored data (useful for debugging)
  const logAllStoredData = async () => {
    console.log("🔍 === AuthContext: LOGGING ALL STORED AUTH DATA ===")
    const authData = await getStoredAuthData()
    if (authData) {
      console.log("📊 AuthContext: Complete Auth Data Summary:")
      console.log("🔑 Token Length:", authData.token?.length || 0)
      console.log("🔄 Refresh Token Length:", authData.refreshToken?.length || 0)
      console.log("🆔 User ID:", authData.userId)
      console.log("🎸 Guitar ID:", authData.guitarId)
      console.log("🎹 Piano ID:", authData.pianoId)
      if (authData.user) {
        console.log("👨‍💼 AuthContext: User Details:")
        console.log("  - ID:", authData.user.id)
        console.log("  - Name:", authData.user.name)
        console.log("  - Email:", authData.user.email)
        console.log("  - Level:", authData.user.currentLevel)
        console.log("  - Streak:", authData.user.currentStreak)
        console.log("  - Accuracy:", authData.user.overallAccuracy)
        console.log("  - Total Games:", authData.user.totalGamesPlayed)
        console.log("  - Created At:", authData.user.createdAt)
        if (authData.user.updatedAt) {
          console.log("  - Updated At:", authData.user.updatedAt)
        }
        if (authData.user.lastPlayedAt) {
          console.log("  - Last Played:", authData.user.lastPlayedAt)
        }
        if (authData.user.subscriptionId) {
          console.log("  - Subscription ID:", authData.user.subscriptionId)
        }
        if (authData.user.clerkId) {
          console.log("  - Clerk ID:", authData.user.clerkId)
        }
        if (authData.user.provider) {
          console.log("  - Provider:", authData.user.provider)
        }
      }
      // Compare with Redux state
      console.log("🔄 AuthContext: Redux vs Storage Comparison:")
      console.log("  - Redux User ID:", userId)
      console.log("  - Storage User ID:", authData.userId)
      console.log("  - Redux Token Present:", !!token)
      console.log("  - Storage Token Present:", !!authData.token)
      console.log("  - Redux Authenticated:", isAuthenticated)
      console.log("  - Storage Has Complete Data:", !!(authData.token && authData.user))
    } else {
      console.log("❌ AuthContext: No auth data found in storage")
    }
    console.log("🔍 === AuthContext: END AUTH DATA LOG ===")
  }

  // Logout function that calls the API and clears local data
  const logout = async () => {
    try {
      console.log("🔓 AuthProvider: Initiating logout...")
      console.log("👤 AuthProvider: Current user before logout:", {
        userId: userId,
        userEmail: user?.email,
        isAuthenticated: isAuthenticated,
      })
      // Dispatch the logout thunk which handles API call and state clearing
      const result = await dispatch(logoutUser())
      if (logoutUser.fulfilled.match(result)) {
        console.log("✅ AuthProvider: Backend logout completed successfully")
      } else if (logoutUser.rejected.match(result)) {
        console.log("⚠️ AuthProvider: Backend logout completed with API error, but local data cleared")
      }

      // Also sign out from Clerk
      try {
        console.log("🔐 AuthProvider: Signing out from Clerk...")
        await signOut()
        console.log("✅ AuthProvider: Clerk sign out successful")
      } catch (clerkError) {
        console.error("❌ AuthProvider: Error signing out from Clerk:", clerkError)
        // Decide if you want to re-throw or just log. For now, we log and continue.
      }

      // Logout from RevenueCat
      try {
        console.log("🎁 AuthProvider: Logging out from RevenueCat...")
        await revenueCatService.logoutRevenueCatUser()
        console.log("✅ AuthProvider: RevenueCat logout successful")
      } catch (revenueCatError) {
        console.error("❌ AuthProvider: Error logging out from RevenueCat:", revenueCatError)
      }

      // Clear instrument IDs as well since user is logging out
      try {
        await AsyncStorage.multiRemove(["guitarId", "pianoId"])
        setGuitarIdState(null)
        setPianoIdState(null)
        console.log("🎵 AuthProvider: Cleared instrument IDs on logout")
      } catch (instrumentError) {
        console.error("❌ AuthProvider: Error clearing instrument IDs:", instrumentError)
      }
      console.log("🎯 AuthProvider: Logout process completed")
    } catch (error) {
      console.error("❌ AuthProvider: Overall logout error:", error)
      // Even if there's an error, we should still try to clear local state
      try {
        await AsyncStorage.multiRemove(["token", "refreshToken", "user", "userId", "guitarId", "pianoId"])
        setGuitarIdState(null)
        setPianoIdState(null)
        console.log("🧹 AuthProvider: Emergency cleanup completed")
      } catch (cleanupError) {
        console.error("❌ AuthProvider: Emergency cleanup failed:", cleanupError)
      }
    }
  }

  const value: AuthContextType = {
    user,
    userId,
    token,
    isAuthenticated,
    isLoading,
    // Instrument IDs
    guitarId,
    pianoId,
    // Utility functions
    getStoredAuthData,
    getStoredToken,
    getStoredUserId,
    getStoredUser,
    logAllStoredData,
    // Instrument functions
    setGuitarId,
    setPianoId,
    getStoredInstrumentIds,
    // Auth functions
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
