import { BASE_URL } from '../constants/urls.constant';

// Types for the leaderboard API responses
export interface LeaderboardUser {
  rank: number
  userId: string
  userName: string
  userEmail: string
  levelId: number
  levelNumber: number
  levelName: string
  currentStreak: number
  maxStreak: number
  accuracy: number
  totalGamesPlayed: number
  totalQuestions: number
  correctAnswers: number
  averageTimeMs: number
  lastPlayedAt: string
  combinedScore: number
}

export interface LeaderboardMetadata {
  levelId: number
  sortBy: string
  totalUsers: number
}

export interface GetLeaderboardResponse {
  success: boolean
  data: {
    topUsers: LeaderboardUser[]
    metadata: LeaderboardMetadata
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export const leaderboardApi = {
  getLeaderboard: async (levelId: number, sortBy: string = 'combined'): Promise<GetLeaderboardResponse> => {
    try {
      console.log("🏆 Getting leaderboard API call:", { levelId, sortBy })

      // Construct URL with parameters
      const params = new URLSearchParams({
        sortBy,
      })
      const url = `${BASE_URL}api/stats/leaderboard/level/${levelId}?${params.toString()}`
      console.log("🔗 Leaderboard API URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("📊 Get leaderboard response status:", response.status)

      const data = await response.json()
      console.log("📥 Get leaderboard response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Get leaderboard failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Failed to get leaderboard"
        throw new Error(errorMessage)
      }

      // Log leaderboard information for debugging
      if (data.data?.topUsers) {
        console.log(`🏅 Retrieved ${data.data.topUsers.length} users for level ${levelId}`)
        if (data.data.metadata) {
          console.log("📊 Leaderboard metadata:", {
            levelId: data.data.metadata.levelId,
            sortBy: data.data.metadata.sortBy,
            totalUsers: data.data.metadata.totalUsers,
          })
        }
      }

      return data
    } catch (error) {
      console.error("💥 Get leaderboard network error:", error)
      throw error
    }
  },

  getLeaderboardBySortCriteria: async (
    levelId: number, 
    sortBy: 'combined' | 'accuracy' | 'streak' | 'totalGames' = 'combined'
  ): Promise<GetLeaderboardResponse> => {
    try {
      console.log("🏆 Getting leaderboard by sort criteria:", { levelId, sortBy })

      const params = new URLSearchParams({
        sortBy,
      })

      const url = `${BASE_URL}api/stats/leaderboard/level/${levelId}?${params.toString()}`
      console.log("🔗 Sorted leaderboard API URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Get sorted leaderboard failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Failed to get sorted leaderboard"
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Get sorted leaderboard network error:", error)
      throw error
    }
  },

  // Get leaderboard for all levels (if needed in the future)
  getAllLevelsLeaderboard: async (sortBy: string = 'combined'): Promise<GetLeaderboardResponse[]> => {
    try {
      console.log("🏆 Getting leaderboard for all levels:", { sortBy })

      const levels = [1, 2, 3, 4] // Assuming 4 levels based on your level selector
      const promises = levels.map(levelId => 
        leaderboardApi.getLeaderboard(levelId, sortBy)
      )

      const results = await Promise.allSettled(promises)
      
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<GetLeaderboardResponse> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)

      // Log any failed requests
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Failed to get leaderboard for level ${levels[index]}:`, result.reason)
        }
      })

      console.log(`🏅 Retrieved leaderboard data for ${successfulResults.length}/${levels.length} levels`)

      return successfulResults
    } catch (error) {
      console.error("💥 Get all levels leaderboard network error:", error)
      throw error
    }
  },
}

// Utility functions for leaderboard data processing
export const leaderboardUtils = {
  // Format accuracy as percentage
  formatAccuracy: (accuracy: number): string => {
    return `${Math.round(accuracy)}%`
  },

  // Get user initials from username
  getUserInitials: (userName: string): string => {
    if (!userName || userName === "User") return "U"
    return userName.substring(0, 2).toUpperCase()
  },

  // Get podium players (top 3) in correct order for display
  getPodiumPlayers: (users: LeaderboardUser[]) => {
    const podiumData = [
      users.find(user => user.rank === 2) || null, // 2nd place (left)
      users.find(user => user.rank === 1) || null, // 1st place (center)
      users.find(user => user.rank === 3) || null, // 3rd place (right)
    ]
    
    return podiumData.map((user, index) => {
      const position = index === 0 ? 2 : index === 1 ? 1 : 3
      return {
        name: user?.userName || "User",
        initials: leaderboardUtils.getUserInitials(user?.userName || "User"),
        position: position as 1 | 2 | 3,
        streak: user?.currentStreak || 0,
        accuracy: user?.accuracy || 0
      }
    })
  },

  // Convert leaderboard users to table row format
  getLeaderboardRows: (users: LeaderboardUser[]) => {
    if (users.length === 0) {
      // Show placeholder rows when no data
      return Array.from({ length: 5 }, (_, index) => ({
        place: index + 1,
        name: "User",
        streak: 0,
        accuracy: "0%"
      }))
    }
    
    return users.map(user => ({
      place: user.rank,
      name: user.userName,
      streak: user.currentStreak,
      accuracy: leaderboardUtils.formatAccuracy(user.accuracy)
    }))
  },

  // Sort users by different criteria (client-side sorting if needed)
  sortUsers: (users: LeaderboardUser[], sortBy: 'combined' | 'accuracy' | 'streak' | 'totalGames') => {
    return [...users].sort((a, b) => {
      switch (sortBy) {
        case 'accuracy':
          return b.accuracy - a.accuracy
        case 'streak':
          return b.currentStreak - a.currentStreak
        case 'totalGames':
          return b.totalGamesPlayed - a.totalGamesPlayed
        case 'combined':
        default:
          return b.combinedScore - a.combinedScore
      }
    })
  }
}