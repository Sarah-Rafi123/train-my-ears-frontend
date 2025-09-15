"use client"

import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet, Image, Alert, Platform, Dimensions } from "react-native"
import { useState, useCallback, useEffect } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import ChordCard from "@/src/components/widgets/ChordCard"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import { dailyProgressApi, dailyProgressUtils, DailyProgressData } from "@/src/services/dailyProgressApi"
import { useAuth } from "@/src/context/AuthContext"
import StatCard from "@/src/components/widgets/StatsCard"

// Define proper navigation prop types
interface StatsScreenProps {
  navigation?: any // Replace with proper type from @react-navigation/native
  onBack?: () => void
}

export default function UserStatsScreen({ navigation, onBack }: StatsScreenProps) {
  const { userId, user } = useAuth() // We now have access to the user object
  
  const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height

  // Define a base width and height for scaling (e.g., iPhone 8 dimensions)
  const BASE_WIDTH = 375
  const BASE_HEIGHT = 667

  // Calculate scale factors for width and height
  const widthScale = screenWidth / BASE_WIDTH
  const heightScale = screenHeight / BASE_HEIGHT

  // Use the smaller scale factor to ensure elements don't become too large on very wide/tall screens
  const responsiveScale = Math.min(widthScale, heightScale)

  // Utility function to apply responsive scaling to a value
  const responsiveValue = (value: number) => Math.round(value * responsiveScale)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(1)
  const [todayProgressData, setTodayProgressData] = useState<DailyProgressData | null>(null)
  const [historicalProgressData, setHistoricalProgressData] = useState<DailyProgressData[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Use useCallback to memoize the handler
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else if (navigation) {
      // Only use navigation if it's available
      navigation.goBack()
    } else {
      console.log("Back pressed, but navigation is not available")
    }
  }, [onBack, navigation])

  // Add this check after the useAuth hook
  if (!userId) {
    return (
      <SafeAreaView className="flex-1 pt-8 bg-[#F2F5F6]">
        <BackButton onPress={handleBack} />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-[#003049] text-lg text-center mb-4">
            Please log in to view your statistics
          </Text>
        </View>
      </SafeAreaView>
    )
  }


  // Generate dates for last 5 days (excluding today) - yesterday first
  const generateLast5Days = () => {
    const dates: string[] = []
    const today = new Date()
    
    // Generate last 5 days excluding today (going backwards from yesterday)
    for (let i = 1; i <= 5; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    console.log(`📅 Generated last 5 days (excluding today, yesterday first):`, dates)
    return dates // Yesterday first: [yesterday, 2-days-ago, 3-days-ago, 4-days-ago, 5-days-ago]
  }

  // Fetch today's progress data
  const fetchTodayProgress = async (level?: number) => {
    console.log(`📊 [UserStats] fetchTodayProgress called with level: ${level}, userId: ${userId}`)
    setLoading(true)
    setError(null)
    
    try {
      if (!userId) {
        console.log('❌ [UserStats] No userId available, cannot fetch today\'s data')
        return
      }

      const todayDate = new Date().toISOString().split('T')[0]
      console.log(`📊 [UserStats] Fetching today's progress for user ${userId}, level: ${level || 'all'}, today's date: ${todayDate}`)
      
      // Fetch today's progress for the boxes
      console.log(`📊 [UserStats] Calling getTodayProgress...`)
      const todayResponse = await dailyProgressApi.getTodayProgress(userId, level)
      console.log(`📊 [UserStats] getTodayProgress response:`, todayResponse.success)
      
      if (todayResponse.success) {
        setTodayProgressData(todayResponse.data.progress)
        console.log(`✅ [UserStats] Successfully loaded today's progress data for ${todayResponse.data.progress.date}`)
      } else {
        console.log(`⚠️ [UserStats] Today's progress response was not successful`)
      }
      
    } catch (err) {
      console.error(`❌ [UserStats] Error fetching today's progress:`, err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load today\'s progress'
      setError(errorMessage)
      setTodayProgressData(null)
    } finally {
      console.log(`📊 [UserStats] fetchTodayProgress completed`)
      setLoading(false)
    }
  }

  // Fetch history data separately
  const fetchHistoryData = async (level?: number) => {
    console.log(`📊 [UserStats] fetchHistoryData called with level: ${level || 'all'}, userId: ${userId}`)
    setHistoryLoading(true)
    setHistoryError(null)
    
    try {
      if (!userId) {
        console.log('❌ [UserStats] No userId available, cannot fetch history data')
        return
      }

      // Fetch last 5 days for history table
      const last5Days = generateLast5Days()
      console.log(`📅 [UserStats] Fetching last 5 days data:`, last5Days)
      
      console.log(`📊 [UserStats] Calling getMultipleDaysProgress...`)
      const historicalData = await dailyProgressApi.getMultipleDaysProgress(userId, last5Days, level)
      console.log(`📊 [UserStats] getMultipleDaysProgress returned ${historicalData?.length || 0} items`)
      
      // Debug: log each historical data item
      if (historicalData) {
        historicalData.forEach((item, index) => {
          console.log(`📊 [UserStats] Historical data ${index}: date=${item.date}, streak=${item.dailySummary?.maxStreak || 0}, accuracy=${item.dailySummary?.accuracy || 0}`)
        })
      }
      
      setHistoricalProgressData(historicalData || [])
      console.log(`✅ [UserStats] Successfully loaded last 5 days progress data`)
      
    } catch (err) {
      console.error(`❌ [UserStats] Error fetching history data:`, err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history data'
      setHistoryError(errorMessage)
      setHistoricalProgressData([])
    } finally {
      console.log(`📊 [UserStats] fetchHistoryData completed`)
      setHistoryLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    if (userId) {
      console.log('📊 [UserStats] Starting initial data fetch for userId:', userId)
      
      // Fetch today's progress for level 1 (fast)
      fetchTodayProgress(1)
      
      // Fetch history data for level 1 (slower)
      fetchHistoryData(1)
      
      // Fallback to prevent infinite loading - set timeout for 10 seconds
      const loadingTimeout = setTimeout(() => {
        console.log('⚠️ [UserStats] Loading timeout reached, forcing loading to false')
        setLoading(false)
        setHistoryLoading(false)
      }, 10000)
      
      return () => clearTimeout(loadingTimeout)
    }
  }, [userId])

  // Handle level change with API call
  const handleLevelChange = useCallback(async (level: number) => {
    console.log(`Level ${level} selected, fetching level-specific data`)
    setSelectedLevel(level)
    
    // Fetch both today's progress and history data for the selected level
    await Promise.all([
      fetchTodayProgress(level),
      fetchHistoryData(level)
    ])
  }, [userId])

  // Get today's progress card values with win/attempts data
  const getTodayProgressValues = () => {
    if (!todayProgressData) {
      return { 
        streak: 0, 
        accuracy: 0, 
        totalGamesPlayed: 0, 
        totalAttempts: 0, 
        correctAnswers: 0 
      }
    }
    
    if (selectedLevel) {
      // Get level-specific data
      const levelProgress = todayProgressData.dailyProgress?.find(
        level => level.levelId === selectedLevel
      )
      
      if (levelProgress) {
        return {
          streak: levelProgress.dailyMaxStreak,
          accuracy: levelProgress.dailyAccuracy,
          totalGamesPlayed: levelProgress.dailyGamesPlayed,
          totalAttempts: levelProgress.dailyTotalQuestions,
          correctAnswers: levelProgress.dailyCorrectAnswers
        }
      } else {
        // Level data not found - return zeros for all fields
        console.log(`📥 Level ${selectedLevel} data not found in response, showing default zeros for all fields`)
        return {
          streak: 0,
          accuracy: 0,
          totalGamesPlayed: 0,
          totalAttempts: 0,
          correctAnswers: 0
        }
      }
    }
    
    // Use overall stats when no level is selected
    return {
      streak: todayProgressData.userOverallStats?.maxStreak || 0,
      accuracy: todayProgressData.userOverallStats?.overallAccuracy || 0,
      totalGamesPlayed: todayProgressData.userOverallStats?.totalGamesPlayed || 0,
      totalAttempts: todayProgressData.userOverallStats?.totalAttempts || 0,
      correctAnswers: todayProgressData.userOverallStats?.correctAnswers || 0
    }
  }

  // Convert historical data to history table format (last 5 days)
  const historyData = dailyProgressUtils.convertToHistoryData(historicalProgressData, selectedLevel ?? undefined) || []
  
  // Debug: log the final history data that will be displayed
  console.log(`📊 [UserStats] Final history data for display:`)
  if (historyData && historyData.length > 0) {
    historyData.forEach((entry, index) => {
      console.log(`📊 [UserStats] History entry ${index}: date="${entry.date}", streak=${entry.streak}, accuracy="${entry.accuracy}"`)
    })
  }

  const todayProgressValues = getTodayProgressValues()

  // Get the first letter of the user's name
  const userFirstLetter = user?.name?.charAt(0).toUpperCase() || "A"; // Default to "A" if no first name

  return (
    <SafeAreaView className="flex-1 pt-8 bg-[#F2F5F6]">
      {/* Header with back button */}
      <BackButton onPress={handleBack} />

      {/* Blue background section with reduced height */}
      <View style={{ height: responsiveValue(112) }} />

      {/* Container for overlapping chord card and white section */}
      <View className="flex-1 relative">
        {/* Chord Card - positioned to overlap both sections */}
        <View className="absolute -top-16 left-0 right-0 z-10" style={{ alignSelf: 'center', paddingHorizontal: 24 }}>
          <ChordCard chord={userFirstLetter} className="w-32 h-32 self-center" /> {/* Use the first letter */}
        </View>

        {/* White background section stretching to end of screen */}
        <View className="flex-1 bg-white rounded-t-3xl" style={{ alignSelf: 'center', flex: 1 }}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {/* Top padding for chord card */}
            <View className="pt-24">
              {/* Level Selector */}
              <LevelSelector 
                selectedLevel={selectedLevel} 
                onLevelChange={handleLevelChange}
                loading={loading}
                disabled={loading}
              />

              {/* Loading indicator for level changes */}
              {loading && (
                <View style={{ alignSelf: 'center', paddingHorizontal: 24, marginBottom: responsiveValue(16) }}>
                  <Text className="text-[#003049] text-center text-sm opacity-70">Updating data...</Text>
                </View>
              )}

              {/* Error message */}
              {error && (
                <View style={{ alignSelf: 'center', paddingHorizontal: 24, marginBottom: responsiveValue(16) }}>
                  <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <Text className="text-red-600 text-center font-medium">Error</Text>
                    <Text className="text-red-500 text-center text-sm mt-1">{error}</Text>
                  </View>
                </View>
              )}

              {/* Today's Progress Section */}
              <View style={{ alignSelf: 'center', paddingHorizontal: 24, marginBottom: responsiveValue(32) }}>
                <Text className="text-[#003049] text-xl font-bold mb-4">
                  Today's Progress
                </Text>
                
                <View className="bg-[#E5EAED80] rounded-3xl p-4">
                  <View className="flex-row justify-between gap-x-2">
                    <StatCard 
                      value={`${todayProgressValues.accuracy.toFixed(1)}%`}
                      label="Accuracy" 
                      size="large" 
                    />
                    <StatCard 
                      value={todayProgressValues.streak.toString()}
                      label="Streak" 
                      size="large" 
                    />
                    <StatCard 
                      showFraction={true}
                      numerator={todayProgressValues.correctAnswers}
                      denominator={todayProgressValues.totalAttempts}
                      label="Correct/Total" 
                      size="large" 
                      value="" // Not used when showFraction is true
                    />
                  </View>
                </View>
              </View>

              {/* History Table - Last 5 Days */}
              <View style={{ width: '100%', paddingHorizontal: 24 }}>
                <Text className="text-[#003049] text-xl font-bold mb-4">History</Text>
                
                <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <View className="bg-gray-100 flex-row py-4 px-6">
                    <Text className="flex-1 text-[#003049] text-lg font-semibold">Date</Text>
                    <Text className="w-20 text-center text-[#003049] text-lg font-semibold">Streak</Text>
                    <Text className="w-28 text-right text-[#003049] text-lg font-semibold">Accuracy</Text>
                  </View>
                  <View style={{ maxHeight: 300 }}>
                    <ScrollView 
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ flexGrow: 1 }}
                      nestedScrollEnabled={true}
                    >
                      {historyLoading ? (
                        <View className="py-8 px-6">
                          <Text className="text-gray-500 text-center">Loading history...</Text>
                        </View>
                      ) : historyData.length > 0 ? (
                        historyData.map((entry, index) => (
                          <View
                            key={`${entry.date}-${index}`}
                            className={`flex-row py-4 px-6 ${index !== historyData.length - 1 ? "border-b border-gray-100" : ""}`}
                          >
                            <Text className="flex-1 text-[#003049] text-base">{entry.date}</Text>
                            <Text className="w-20 text-center text-[#003049] text-base font-medium">{entry.streak}</Text>
                            <Text className="w-24 text-right text-[#003049] text-base font-medium">{entry.accuracy}</Text>
                          </View>
                        ))
                      ) : (
                        <View className="py-8 px-6">
                          <Text className="text-gray-500 text-center">
                            {historyError ? historyError : "No history data available"}
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <View style={{ height: 32 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}
