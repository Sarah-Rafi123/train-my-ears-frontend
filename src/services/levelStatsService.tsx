import AsyncStorage from "@react-native-async-storage/async-storage"

export interface LevelStats {
  accuracy: number
  streak: number
  totalAttempts: number
  correctAnswers: number
  wins: number
  lastPlayedDate: string
  level: number
}

interface UserLevelStats {
  regularGame: { [level: number]: LevelStats }
  advancedGame: { [level: number]: LevelStats }
}

interface AllUsersLevelStats {
  [userId: string]: UserLevelStats
}

const LEVEL_STATS_KEY = "userLevelStats"

const createDefaultLevelStats = (level: number): LevelStats => ({
  accuracy: 0,
  streak: 0,
  totalAttempts: 0,
  correctAnswers: 0,
  wins: 0,
  lastPlayedDate: "",
  level,
})

export class LevelStatsService {
  // Get all level stats from storage
  static async getAllLevelStats(): Promise<AllUsersLevelStats> {
    try {
      const stored = await AsyncStorage.getItem(LEVEL_STATS_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return {}
    } catch (error) {
      console.error("❌ LevelStatsService: Error getting level stats:", error)
      return {}
    }
  }

  // Save all level stats to storage
  static async saveAllLevelStats(stats: AllUsersLevelStats): Promise<void> {
    try {
      await AsyncStorage.setItem(LEVEL_STATS_KEY, JSON.stringify(stats))
      console.log("✅ LevelStatsService: Stats saved successfully")
    } catch (error) {
      console.error("❌ LevelStatsService: Error saving level stats:", error)
    }
  }

  // Get stats for a specific user, game mode, and level
  static async getUserLevelStats(
    userId: string,
    gameMode: "regularGame" | "advancedGame",
    level: number
  ): Promise<LevelStats> {
    try {
      const allStats = await this.getAllLevelStats()
      
      if (!allStats[userId]) {
        return createDefaultLevelStats(level)
      }
      
      if (!allStats[userId][gameMode]) {
        return createDefaultLevelStats(level)
      }
      
      if (!allStats[userId][gameMode][level]) {
        return createDefaultLevelStats(level)
      }
      
      return allStats[userId][gameMode][level]
    } catch (error) {
      console.error("❌ LevelStatsService: Error getting user level stats:", error)
      return createDefaultLevelStats(level)
    }
  }

  // Store current stats for a specific user, game mode, and level
  static async storeUserLevelStats(
    userId: string,
    gameMode: "regularGame" | "advancedGame",
    level: number,
    currentStats: {
      accuracy: number
      streak: number
      totalAttempts: number
      correctAnswers: number
      wins?: number
    }
  ): Promise<void> {
    try {
      const allStats = await this.getAllLevelStats()
      
      // Initialize user stats if doesn't exist
      if (!allStats[userId]) {
        allStats[userId] = {
          regularGame: {},
          advancedGame: {}
        }
      }
      
      // Initialize game mode stats if doesn't exist
      if (!allStats[userId][gameMode]) {
        allStats[userId][gameMode] = {}
      }
      
      // Get existing level stats or create default
      const existingStats = allStats[userId][gameMode][level] || createDefaultLevelStats(level)
      
      // Update with current stats
      const updatedStats: LevelStats = {
        accuracy: currentStats.accuracy,
        streak: currentStats.streak,
        totalAttempts: currentStats.totalAttempts,
        correctAnswers: currentStats.correctAnswers,
        wins: currentStats.wins || existingStats.wins,
        lastPlayedDate: existingStats.lastPlayedDate,
        level: level,
      }
      
      // Store the updated stats
      allStats[userId][gameMode][level] = updatedStats
      
      await this.saveAllLevelStats(allStats)
      
      console.log(`📊 LevelStatsService: Stored stats for user ${userId}, ${gameMode}, level ${level}:`, updatedStats)
    } catch (error) {
      console.error("❌ LevelStatsService: Error storing user level stats:", error)
    }
  }

  // Load stats when switching to a level (for authenticated users)
  static async loadUserLevelStats(
    userId: string,
    gameMode: "regularGame" | "advancedGame",
    level: number
  ): Promise<LevelStats> {
    try {
      const stats = await this.getUserLevelStats(userId, gameMode, level)
      console.log(`📊 LevelStatsService: Loaded stats for user ${userId}, ${gameMode}, level ${level}:`, stats)
      return stats
    } catch (error) {
      console.error("❌ LevelStatsService: Error loading user level stats:", error)
      return createDefaultLevelStats(level)
    }
  }

  // Update stats for current gameplay (similar to guest stats but with level awareness)
  static async updateUserGameStats(
    userId: string,
    gameMode: "regularGame" | "advancedGame",
    level: number,
    isCorrect: boolean,
    isWin: boolean = false
  ): Promise<LevelStats> {
    try {
      const currentStats = await this.getUserLevelStats(userId, gameMode, level)
      
      // Update attempts
      const newTotalAttempts = currentStats.totalAttempts + 1
      
      // Update correct answers
      const newCorrectAnswers = currentStats.correctAnswers + (isCorrect ? 1 : 0)
      
      // Update wins
      const newWins = currentStats.wins + (isWin ? 1 : 0)
      
      // Calculate new accuracy
      const newAccuracy = newTotalAttempts > 0 ? Math.round((newCorrectAnswers / newTotalAttempts) * 100) : 0
      
      // Handle streak logic
      const today = new Date().toISOString().split("T")[0]
      const lastPlayedDate = currentStats.lastPlayedDate
      let newStreak = currentStats.streak
      
      if (lastPlayedDate) {
        const lastPlayed = new Date(lastPlayedDate)
        const todayDate = new Date(today)
        const daysDifference = Math.floor((todayDate.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDifference === 0) {
          // Same day, keep streak
          newStreak = currentStats.streak
        } else if (daysDifference === 1 && isWin) {
          // Next day and won, increment streak
          newStreak = currentStats.streak + 1
        } else if (daysDifference > 1 || !isWin) {
          // Skipped days or lost, reset streak
          newStreak = isWin ? 1 : 0
        }
      } else {
        // First time playing this level
        newStreak = isWin ? 1 : 0
      }
      
      // Create updated stats
      const updatedStats: LevelStats = {
        accuracy: newAccuracy,
        streak: newStreak,
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
        wins: newWins,
        lastPlayedDate: today,
        level: level,
      }
      
      // Store the updated stats
      await this.storeUserLevelStats(userId, gameMode, level, {
        accuracy: newAccuracy,
        streak: newStreak,
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
        wins: newWins,
      })
      
      console.log(`📊 LevelStatsService: Updated ${gameMode} level ${level} stats:`, updatedStats)
      return updatedStats
    } catch (error) {
      console.error("❌ LevelStatsService: Error updating game stats:", error)
      return createDefaultLevelStats(level)
    }
  }

  // Clear all level stats for a user (useful for logout)
  static async clearUserLevelStats(userId: string): Promise<void> {
    try {
      const allStats = await this.getAllLevelStats()
      delete allStats[userId]
      await this.saveAllLevelStats(allStats)
      console.log(`🧹 LevelStatsService: Cleared stats for user ${userId}`)
    } catch (error) {
      console.error("❌ LevelStatsService: Error clearing user stats:", error)
    }
  }

  // Debug function to log current stats for a user
  static async logUserStats(userId: string): Promise<void> {
    try {
      const allStats = await this.getAllLevelStats()
      if (allStats[userId]) {
        console.log(`🔍 LevelStatsService: Stats for user ${userId}:`, allStats[userId])
      } else {
        console.log(`🔍 LevelStatsService: No stats found for user ${userId}`)
      }
    } catch (error) {
      console.error("❌ LevelStatsService: Error logging user stats:", error)
    }
  }
}