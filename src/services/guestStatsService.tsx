import AsyncStorage from "@react-native-async-storage/async-storage"

export interface GuestStats {
  accuracy: number
  streak: number // Consecutive correct answers streak
  totalAttempts: number
  correctAnswers: number
  lastPlayedDate: string
  wins: number // Total wins for the game mode
  gamesPlayed?: number // Total games played (for advanced game tracking)
}

interface GuestGameStats {
  regularGame: GuestStats
  advancedGame: GuestStats
}

const GUEST_STATS_KEY = "guestGameStats"

const defaultStats: GuestStats = {
  accuracy: 0,
  streak: 0,
  totalAttempts: 0,
  correctAnswers: 0,
  lastPlayedDate: "",
  wins: 0,
  gamesPlayed: 0,
}

const defaultGameStats: GuestGameStats = {
  regularGame: { ...defaultStats },
  advancedGame: { ...defaultStats },
}

export class GuestStatsService {
  // Get all guest stats from storage
  static async getGuestStats(): Promise<GuestGameStats> {
    try {
      const stored = await AsyncStorage.getItem(GUEST_STATS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure all required fields exist with defaults
        return {
          regularGame: { ...defaultStats, ...parsed.regularGame },
          advancedGame: { ...defaultStats, ...parsed.advancedGame },
        }
      }
      return defaultGameStats
    } catch (error) {
      console.error("❌ GuestStatsService: Error getting guest stats:", error)
      return defaultGameStats
    }
  }

  // Save guest stats to storage
  static async saveGuestStats(stats: GuestGameStats): Promise<void> {
    try {
      await AsyncStorage.setItem(GUEST_STATS_KEY, JSON.stringify(stats))
      console.log("✅ GuestStatsService: Stats saved successfully")
    } catch (error) {
      console.error("❌ GuestStatsService: Error saving guest stats:", error)
    }
  }

  // Update stats for a specific game mode
  static async updateGameStats(
    gameMode: "regularGame" | "advancedGame",
    isCorrect: boolean,
    isWin: boolean = false
  ): Promise<GuestStats> {
    try {
      const allStats = await this.getGuestStats()
      const currentStats = allStats[gameMode]

      // Update attempts
      const newTotalAttempts = currentStats.totalAttempts + 1

      // Update correct answers (for advanced game, this is individual chord guesses)
      const newCorrectAnswers = currentStats.correctAnswers + (isCorrect ? 1 : 0)

      // Update wins (for regular game: correct answer, for advanced game: full sequence correct)
      const newWins = currentStats.wins + (isWin ? 1 : 0)

      // Calculate new accuracy
      const newAccuracy = newTotalAttempts > 0 ? Math.round((newCorrectAnswers / newTotalAttempts) * 100) : 0

      // Handle consecutive correct answers streak logic
      let newStreak = currentStats.streak
      
      console.log(`🔥 GuestStatsService: Streak logic - Current streak: ${currentStats.streak}, isCorrect: ${isCorrect}`)
      
      if (isCorrect) {
        // Correct answer: increment streak by 1
        newStreak = currentStats.streak + 1
        console.log(`🔥 GuestStatsService: Correct answer! New streak: ${newStreak}`)
      } else {
        // Wrong answer: reset streak to 0
        newStreak = 0
        console.log(`🔥 GuestStatsService: Wrong answer! Reset streak to: ${newStreak}`)
      }

      const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format

      // Create updated stats
      const updatedStats: GuestStats = {
        accuracy: newAccuracy,
        streak: newStreak,
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
        lastPlayedDate: today,
        wins: newWins,
      }

      // Update the game stats
      const updatedGameStats: GuestGameStats = {
        ...allStats,
        [gameMode]: updatedStats,
      }

      // Save to storage
      await this.saveGuestStats(updatedGameStats)

      console.log(`📊 GuestStatsService: Updated ${gameMode} stats:`, updatedStats)
      console.log(`🔥 GuestStatsService: Final streak being returned: ${updatedStats.streak}`)
      return updatedStats
    } catch (error) {
      console.error("❌ GuestStatsService: Error updating game stats:", error)
      return defaultStats
    }
  }

  // Get stats for a specific game mode
  static async getGameModeStats(gameMode: "regularGame" | "advancedGame"): Promise<GuestStats> {
    const allStats = await this.getGuestStats()
    return allStats[gameMode]
  }

  // Clear all guest stats (useful for debugging or reset functionality)
  static async clearGuestStats(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GUEST_STATS_KEY)
      console.log("🧹 GuestStatsService: All guest stats cleared")
    } catch (error) {
      console.error("❌ GuestStatsService: Error clearing guest stats:", error)
    }
  }

  // Debug function to log current stats
  static async logCurrentStats(): Promise<void> {
    const stats = await this.getGuestStats()
    console.log("🔍 GuestStatsService: Current stats:", {
      regularGame: stats.regularGame,
      advancedGame: stats.advancedGame,
    })
  }
}