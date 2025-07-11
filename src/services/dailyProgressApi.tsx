// Types for the daily progress API responses
export interface LevelProgress {
  levelId: number
  levelNumber: number
  levelName: string
  gamesPlayed: number
  questionsAnswered: number
  correctAnswers: number
  accuracy: number
  maxStreak: number
  timePlayedMs: number
}

export interface OverallDaily {
  totalGamesPlayed: number
  totalQuestions: number
  totalCorrectAnswers: number
  maxStreak: number
  totalTimePlayedMs: number
  accuracy: number
}

export interface ProgressSummary {
  levelsPlayed: number
  totalLevelsAvailable: number
  hasPlayedToday: boolean
}

export interface DailyProgressData {
  date: string
  levelProgress: LevelProgress[]
  overallDaily: OverallDaily
  summary: ProgressSummary
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
      const url = `http://16.16.104.51/api/stats/users/${userId}/daily-progress?${params.toString()}`
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
      
      const successfulResults: DailyProgressData[] = []
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulResults.push(result.value.data.progress)
        } else {
          console.warn(`❌ Failed to get progress for date ${dates[index]}:`, 
            result.status === 'rejected' ? result.reason : 'API returned unsuccessful response')
          
          // Add empty data for failed dates
          successfulResults.push({
            date: dates[index],
            levelProgress: [],
            overallDaily: {
              totalGamesPlayed: 0,
              totalQuestions: 0,
              totalCorrectAnswers: 0,
              maxStreak: 0,
              totalTimePlayedMs: 0,
              accuracy: 0
            },
            summary: {
              levelsPlayed: 0,
              totalLevelsAvailable: 4,
              hasPlayedToday: false
            }
          })
        }
      })

      console.log(`✅ Retrieved progress for ${successfulResults.length}/${dates.length} days`)
      return successfulResults
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
  getLevelProgress: (levelProgress: LevelProgress[], levelId: number): LevelProgress | null => {
    return levelProgress.find(progress => progress.levelId === levelId) || null
  },

  // Convert progress data to history table format
  convertToHistoryData: (
    progressDataArray: DailyProgressData[], 
    selectedLevel?: number
  ): Array<{date: string, streak: number, accuracy: string}> => {
    return progressDataArray.map(data => {
      let streak = 0
      let accuracy = 0
      
      if (selectedLevel) {
        const levelProgress = dailyProgressUtils.getLevelProgress(data.levelProgress, selectedLevel)
        streak = levelProgress?.maxStreak || 0
        accuracy = levelProgress?.accuracy || 0
      } else {
        streak = data.overallDaily.maxStreak
        accuracy = data.overallDaily.accuracy
      }
      
      return {
        date: dailyProgressUtils.formatDateForDisplay(data.date),
        streak,
        accuracy: dailyProgressUtils.formatAccuracy(accuracy)
      }
    }).reverse() // Show most recent first
  },

  // Get display values for progress cards (today's data)
  getProgressCardValues: (progressData: DailyProgressData, selectedLevel?: number) => {
    if (selectedLevel) {
      const levelProgress = dailyProgressUtils.getLevelProgress(progressData.levelProgress, selectedLevel)
      return {
        streak: levelProgress?.maxStreak || 0,
        accuracy: levelProgress?.accuracy || 0
      }
    }
    
    return {
      streak: progressData.overallDaily.maxStreak,
      accuracy: progressData.overallDaily.accuracy
    }
  }
}