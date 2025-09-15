import { BASE_URL } from '../constants/urls.constant';

// Types for the daily progress API responses
export interface LevelProgress {
  levelId: number
  levelNumber: number
  levelName: string
  currentStreak: number
  maxStreak: number
  overallAccuracy: number
  totalGamesPlayed: number
  totalAttempts: number
  correctAnswers: number
  lastPlayedAt: string
  dailyGamesPlayed: number
  dailyAccuracy: number
  dailyMaxStreak: number
  dailyTimePlayedMs: number
}

export interface OverallDaily {
  totalGamesPlayed: number
  totalQuestions: number
  totalCorrectAnswers: number
  maxStreak: number
  totalTimePlayedMs: number
  accuracy: number
}

export interface OverallUserStats {
  totalAttempts: number
  correctAnswers: number
  overallAccuracy: number
  currentStreak: number
  maxStreak: number
  totalGamesPlayed: number
  lastPlayedAt: string
}

export interface ProgressSummary {
  levelsPlayed: number
  totalLevelsAvailable: number
  hasPlayedToday: boolean
}

export interface DailyProgressData {
  date: string
  dateFormatted: string
  userOverallStats: OverallUserStats
  dailyProgress: LevelProgress[]
  dailySummary: OverallDaily
  metadata: {
    requestedDate: string
    levelFilter?: number
    totalLevelsAvailable: number
  }
}

export interface DailyProgressMetadata {
  levelFilter?: number
  date: string
}

export interface GetDailyProgressResponse {
  success: boolean
  data: {
    progress: DailyProgressData
    metadata: DailyProgressMetadata
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export const dailyProgressApi = {
  getDailyProgress: async (
    userId: string, 
    date?: string, 
    level?: number
  ): Promise<GetDailyProgressResponse> => {
    try {
      console.log("📊 Getting daily progress API call:", { userId, date, level })

      // Construct URL with parameters
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (level) params.append('level', level.toString())
console
      const url = `${BASE_URL}api/stats/users/${userId}/daily-progress?${params.toString()}`
      console.log("🔗 Daily Progress API URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("📊 Get daily progress response status:", response.status)

      const data = await response.json()
      console.log("📥 Get daily progress response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Get daily progress failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Failed to get daily progress"
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("💥 Get daily progress network error:", error)
      throw error
    }
  },

  // New method to get multiple days of progress
  getMultipleDaysProgress: async (
    userId: string, 
    dates: string[], 
    level?: number
  ): Promise<DailyProgressData[]> => {
    try {
      console.log("📊 Getting multiple days progress:", { userId, dates, level })

      const promises = dates.map(date => 
        dailyProgressApi.getDailyProgress(userId, date, level)
      )

      const results = await Promise.allSettled(promises)
      
      const mappedResults: DailyProgressData[] = []
      
      // Create explicit mapping between requested dates and results
      dates.forEach((requestedDate, index) => {
        const result = results[index]
        
        if (result.status === 'fulfilled' && result.value.success) {
          console.log(`✅ Got data for ${requestedDate}:`, result.value.data.progress)
          
          // Create a new object with the requested date to ensure correctness
          const progressData: DailyProgressData = {
            ...result.value.data.progress,
            date: requestedDate // Force the date to be the requested date
          }
          mappedResults.push(progressData)
        } else {
          console.warn(`❌ No data for ${requestedDate}, using empty data`)
          
          // Add empty data for dates without data
          mappedResults.push({
            date: requestedDate,
            dateFormatted: requestedDate,
            userOverallStats: {
              totalAttempts: 0,
              correctAnswers: 0,
              overallAccuracy: 0,
              currentStreak: 0,
              maxStreak: 0,
              totalGamesPlayed: 0,
              lastPlayedAt: ""
            },
            dailyProgress: [],
            dailySummary: {
              totalGamesPlayed: 0,
              totalQuestions: 0,
              totalCorrectAnswers: 0,
              maxStreak: 0,
              totalTimePlayedMs: 0,
              accuracy: 0
            },
            metadata: {
              requestedDate: requestedDate,
              totalLevelsAvailable: 4
            }
          })
        }
      })

      console.log(`✅ Mapped ${mappedResults.length}/${dates.length} days with correct dates`)
      mappedResults.forEach(result => {
        console.log(`📅 Date: ${result.date}, Max Streak: ${result.overallDaily?.maxStreak || 0}, Accuracy: ${result.overallDaily?.accuracy || 0}`)
      })
      
      return mappedResults
    } catch (error) {
      console.error("💥 Get multiple days progress error:", error)
      throw error
    }
  },

  // Get last N days including today
  getLastNDaysProgress: async (
    userId: string, 
    days: number = 4, 
    level?: number
  ): Promise<DailyProgressData[]> => {
    const dates: string[] = []
    const today = new Date()
    
    // Generate dates for the last N days (including today)
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date.toISOString().split('T')[0]) // YYYY-MM-DD format
    }
    
    console.log("📅 Generated dates for last", days, "days:", dates)
    
    return dailyProgressApi.getMultipleDaysProgress(userId, dates, level)
  },

  getTodayProgress: async (userId: string, level?: number): Promise<GetDailyProgressResponse> => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    return dailyProgressApi.getDailyProgress(userId, today, level)
  },

  getProgressForDate: async (userId: string, date: string, level?: number): Promise<GetDailyProgressResponse> => {
    return dailyProgressApi.getDailyProgress(userId, date, level)
  }
}

// Utility functions for daily progress data processing
export const dailyProgressUtils = {
  // Format time from milliseconds to readable format
  formatPlayTime: (timeMs: number): string => {
    const minutes = Math.floor(timeMs / 60000)
    const seconds = Math.floor((timeMs % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  },

  // Format accuracy as percentage
  formatAccuracy: (accuracy: number): string => {
    return `${Math.round(accuracy)}%`
  },

  // Format date for display
  formatDateForDisplay: (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }
    
    // Format as "Dec 23, 2024"
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  },

  // Get level-specific progress
  getLevelProgress: (dailyProgress: LevelProgress[], levelId: number): LevelProgress | null => {
    return dailyProgress.find(progress => progress.levelId === levelId) || null
  },

  // Convert progress data to history table format
  convertToHistoryData: (
    progressDataArray: DailyProgressData[], 
    selectedLevel?: number
  ): {date: string, streak: number, accuracy: string}[] => {
    console.log(`📊 [convertToHistoryData] Processing ${progressDataArray.length} items, selectedLevel: ${selectedLevel}`)
    
    const result = progressDataArray.map((data, index) => {
      let streak = 0
      let accuracy = 0
      
      console.log(`📊 [convertToHistoryData] Item ${index}: date=${data.date}, dailySummary=${JSON.stringify(data.dailySummary)}, dailyProgress.length=${data.dailyProgress.length}`)
      
      if (selectedLevel) {
        const levelProgress = dailyProgressUtils.getLevelProgress(data.dailyProgress, selectedLevel)
        console.log(`📊 [convertToHistoryData] Level ${selectedLevel} progress for date ${data.date}:`, levelProgress)
        
        if (levelProgress) {
          // Use level-specific DAILY data for history (not overall cumulative data)
          streak = levelProgress.dailyMaxStreak || 0
          accuracy = levelProgress.dailyAccuracy || 0
          console.log(`📊 [convertToHistoryData] Using level DAILY data: dailyMaxStreak=${streak}, dailyAccuracy=${accuracy}`)
        } else {
          // No data for this level on this date - use zeros
          streak = 0
          accuracy = 0
          console.log(`📊 [convertToHistoryData] No level ${selectedLevel} data for ${data.date}, using zeros`)
        }
      } else {
        streak = data.dailySummary.maxStreak
        accuracy = data.dailySummary.accuracy
        console.log(`📊 [convertToHistoryData] Using overall daily data: streak=${streak}, accuracy=${accuracy}`)
      }
      
      const formattedEntry = {
        date: dailyProgressUtils.formatDateForDisplay(data.date),
        streak,
        accuracy: dailyProgressUtils.formatAccuracy(accuracy)
      }
      
      console.log(`📊 [convertToHistoryData] Formatted entry ${index}:`, formattedEntry)
      return formattedEntry
    }) // Show most recent first (already in correct order from API)
    
    console.log(`📊 [convertToHistoryData] Final result:`, result)
    return result
  },

  // Get display values for progress cards (today's data)
  getProgressCardValues: (progressData: DailyProgressData, selectedLevel?: number) => {
    if (selectedLevel) {
      const levelProgress = dailyProgressUtils.getLevelProgress(progressData.dailyProgress, selectedLevel)
      return {
        streak: levelProgress?.dailyMaxStreak || 0,
        accuracy: levelProgress?.dailyAccuracy || 0
      }
    }
    
    return {
      streak: progressData.dailySummary.maxStreak,
      accuracy: progressData.dailySummary.accuracy
    }
  }
}