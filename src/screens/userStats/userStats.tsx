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
  
  // Safe screen dimensions with fallbacks
  const getScreenDimensions = () => {
    try {
      const dimensions = Dimensions.get("window")
      const width = typeof dimensions.width === 'number' && dimensions.width > 0 ? dimensions.width : 375
      const height = typeof dimensions.height === 'number' && dimensions.height > 0 ? dimensions.height : 667
      return { width, height }
    } catch (error) {
      console.error('Error getting screen dimensions:', error)
      return { width: 375, height: 667 } // iPhone 8 fallback
    }
  }

  const { width: screenWidth, height: screenHeight } = getScreenDimensions()

  // Improved responsive scaling with better bounds
  const getResponsiveValue = (value: number) => {
    try {
      if (typeof value !== 'number' || isNaN(value)) {
        return 16 // Safe fallback
      }
      
      // Use percentage-based scaling for better responsiveness
      const widthFactor = screenWidth / 375 // Base iPhone width
      const heightFactor = screenHeight / 667 // Base iPhone height
      const scaleFactor = Math.min(widthFactor, heightFactor)
      
      // Clamp the scale factor to prevent extreme scaling
      const clampedScale = Math.max(0.8, Math.min(1.4, scaleFactor))
      return Math.round(value * clampedScale)
    } catch (error) {
      console.error('Error calculating responsive value:', error)
      return typeof value === 'number' ? value : 16
    }
  }

  // Responsive padding that adapts to screen width
  const responsivePadding = Math.max(16, screenWidth * 0.04) // 4% of screen width, minimum 16px
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
      <SafeAreaView className="flex-1 bg-[#F2F5F6]" style={{ paddingTop: getResponsiveValue(32) }}>
        <View style={{ paddingHorizontal: responsivePadding }}>
          <BackButton onPress={handleBack} />
        </View>
        <View className="flex-1 justify-center items-center" style={{ paddingHorizontal: responsivePadding }}>
          <Text 
            className="text-[#003049] text-center"
            style={{ 
              fontSize: getResponsiveValue(18),
              marginBottom: getResponsiveValue(16)
            }}
          >
            Please log in to view your statistics
          </Text>
        </View>
      </SafeAreaView>
    )
  }


  // Generate dates for last 5 days (excluding today) - yesterday first
  const generateLast5Days = () => {
    const dates: string[] = []
    
    try {
      const today = new Date()
      
      // Validate that today is a valid date
      if (isNaN(today.getTime())) {
        throw new Error('Invalid date')
      }
      
      // Generate last 5 days excluding today (going backwards from yesterday)
      for (let i = 1; i <= 5; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        
        // Validate each date before adding
        if (!isNaN(date.getTime())) {
          const dateString = date.toISOString().split('T')[0]
          if (dateString && dateString.length === 10) { // YYYY-MM-DD format
            dates.push(dateString)
          }
        }
      }
      
      console.log(`📅 Generated last 5 days (excluding today, yesterday first):`, dates)
      return dates // Yesterday first: [yesterday, 2-days-ago, 3-days-ago, 4-days-ago, 5-days-ago]
    } catch (error) {
      console.error('Error generating date range:', error)
      // Return fallback dates if generation fails
      const fallbackDates = ['Yesterday', 'Day -2', 'Day -3', 'Day -4', 'Day -5']
      return fallbackDates
    }
  }

  // Fetch today's progress data
  const fetchTodayProgress = async (level?: number) => {
    if (!userId) {
      console.log('❌ [UserStats] No userId available, cannot fetch today\'s data')
      return
    }

    console.log(`📊 [UserStats] fetchTodayProgress called with level: ${level}, userId: ${userId}`)
    setLoading(true)
    setError(null)
    
    try {
      const today = new Date()
      if (isNaN(today.getTime())) {
        throw new Error('Invalid current date')
      }
      
      const todayDate = today.toISOString().split('T')[0]
      if (!todayDate || todayDate.length !== 10) {
        throw new Error('Failed to format current date')
      }
      
      console.log(`📊 [UserStats] Fetching today's progress for user ${userId}, level: ${level || 'all'}, today's date: ${todayDate}`)
      
      // Fetch today's progress for the boxes
      console.log(`📊 [UserStats] Calling getTodayProgress...`)
      const todayResponse = await dailyProgressApi.getTodayProgress(userId, level)
      
      // Validate response structure
      if (!todayResponse || typeof todayResponse !== 'object') {
        throw new Error('Invalid response format')
      }
      
      console.log(`📊 [UserStats] getTodayProgress response:`, todayResponse.success)
      
      if (todayResponse.success && todayResponse.data?.progress) {
        setTodayProgressData(todayResponse.data.progress)
        console.log(`✅ [UserStats] Successfully loaded today's progress data for ${todayResponse.data.progress.date}`)
      } else {
        console.log(`⚠️ [UserStats] Today's progress response was not successful`)
        setTodayProgressData(null)
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
    if (!userId) {
      console.log('❌ [UserStats] No userId available, cannot fetch history data')
      return
    }

    console.log(`📊 [UserStats] fetchHistoryData called with level: ${level || 'all'}, userId: ${userId}`)
    setHistoryLoading(true)
    setHistoryError(null)
    
    try {
      // Fetch last 5 days for history table
      const last5Days = generateLast5Days()
      
      // Validate dates array
      if (!Array.isArray(last5Days) || last5Days.length === 0) {
        throw new Error('Failed to generate valid date range')
      }
      
      console.log(`📅 [UserStats] Fetching last 5 days data:`, last5Days)
      
      console.log(`📊 [UserStats] Calling getMultipleDaysProgress...`)
      const historicalData = await dailyProgressApi.getMultipleDaysProgress(userId, last5Days, level)
      
      // Validate response
      if (historicalData && Array.isArray(historicalData)) {
        console.log(`📊 [UserStats] getMultipleDaysProgress returned ${historicalData.length} items`)
        
        // Debug: log each historical data item safely
        historicalData.forEach((item, index) => {
          if (item && typeof item === 'object') {
            console.log(`📊 [UserStats] Historical data ${index}: date=${item.date || 'unknown'}, streak=${item.dailySummary?.maxStreak || 0}, accuracy=${item.dailySummary?.accuracy || 0}`)
          }
        })
        
        setHistoricalProgressData(historicalData)
      } else {
        console.log(`⚠️ [UserStats] Invalid historical data response`)
        setHistoricalProgressData([])
      }
      
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
    if (!userId) {
      console.log('❌ [UserStats] Cannot change level without userId')
      return
    }
    
    console.log(`Level ${level} selected, fetching level-specific data`)
    setSelectedLevel(level)
    
    try {
      // Fetch both today's progress and history data for the selected level
      await Promise.all([
        fetchTodayProgress(level),
        fetchHistoryData(level)
      ])
    } catch (error) {
      console.error('❌ [UserStats] Error during level change:', error)
      setError('Failed to load data for selected level')
    }
  }, [userId])

  // Get today's progress card values with win/attempts data
  const getTodayProgressValues = () => {
    const defaultValues = { 
      streak: 0, 
      accuracy: 0, 
      totalGamesPlayed: 0, 
      totalAttempts: 0, 
      correctAnswers: 0 
    }
    
    if (!todayProgressData) {
      return defaultValues
    }
    
    try {
      if (selectedLevel) {
        // Get level-specific data
        const levelProgress = todayProgressData.dailyProgress?.find(
          level => level?.levelId === selectedLevel
        )
        
        if (levelProgress) {
          return {
            streak: Number(levelProgress.dailyMaxStreak) || 0,
            accuracy: Number(levelProgress.dailyAccuracy) || 0,
            totalGamesPlayed: Number(levelProgress.dailyGamesPlayed) || 0,
            totalAttempts: Number(levelProgress.totalAttempts) || 0,
            correctAnswers: Number(levelProgress.correctAnswers) || 0
          }
        } else {
          // Level data not found - return zeros for all fields
          console.log(`📥 Level ${selectedLevel} data not found in response, showing default zeros for all fields`)
          return defaultValues
        }
      }
      
      // Use overall stats when no level is selected
      return {
        streak: Number(todayProgressData.userOverallStats?.maxStreak) || 0,
        accuracy: Number(todayProgressData.userOverallStats?.overallAccuracy) || 0,
        totalGamesPlayed: Number(todayProgressData.userOverallStats?.totalGamesPlayed) || 0,
        totalAttempts: Number(todayProgressData.userOverallStats?.totalAttempts) || 0,
        correctAnswers: Number(todayProgressData.userOverallStats?.correctAnswers) || 0
      }
    } catch (error) {
      console.error('Error calculating today progress values:', error)
      return defaultValues
    }
  }

  // Convert historical data to history table format (last 5 days)
  const getHistoryData = () => {
    try {
      if (!Array.isArray(historicalProgressData)) {
        return []
      }
      return dailyProgressUtils.convertToHistoryData(historicalProgressData, selectedLevel ?? undefined) || []
    } catch (error) {
      console.error('Error converting history data:', error)
      return []
    }
  }
  
  const historyData = getHistoryData()
  
  // Debug: log the final history data that will be displayed
  console.log(`📊 [UserStats] Final history data for display:`)
  if (historyData && historyData.length > 0) {
    historyData.forEach((entry, index) => {
      if (entry && typeof entry === 'object') {
        console.log(`📊 [UserStats] History entry ${index}: date="${entry.date || 'unknown'}", streak=${entry.streak || 0}, accuracy="${entry.accuracy || '0%'}"`)
      }
    })
  }

  const todayProgressValues = getTodayProgressValues()

  // Get the first letter of the user's name safely
  const getUserFirstLetter = () => {
    try {
      if (user?.name && typeof user.name === 'string' && user.name.length > 0) {
        const firstChar = user.name.charAt(0)
        if (firstChar && typeof firstChar === 'string') {
          return firstChar.toUpperCase()
        }
      }
      return "A" // Default fallback
    } catch (error) {
      console.error('Error getting user first letter:', error)
      return "A" // Safe fallback
    }
  }
  
  const userFirstLetter = getUserFirstLetter()

  return (
    <SafeAreaView className="flex-1 bg-[#F2F5F6]" style={{ paddingTop: getResponsiveValue(32) }}>
      {/* Header with back button */}
      <View style={{ paddingHorizontal: responsivePadding }}>
        <BackButton onPress={handleBack} />
      </View>

      {/* Blue background section with responsive height */}
      <View style={{ height: getResponsiveValue(112) }} />

      {/* Container for overlapping chord card and white section */}
      <View className="flex-1 relative">
        {/* Chord Card - positioned to overlap both sections */}
        <View 
          className="absolute z-10" 
          style={{ 
            top: getResponsiveValue(-64),
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <View style={{ 
            width: getResponsiveValue(128), 
            height: getResponsiveValue(128) 
          }}>
            <ChordCard 
              chord={userFirstLetter} 
              className="w-full h-full" 
            />
          </View>
        </View>

        {/* White background section stretching to end of screen */}
        <View className="flex-1 bg-white rounded-t-3xl">
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingHorizontal: responsivePadding 
            }}
          >
            {/* Top padding for chord card */}
            <View style={{ paddingTop: getResponsiveValue(96) }}>
              {/* Level Selector */}
              <LevelSelector 
                selectedLevel={selectedLevel} 
                onLevelChange={handleLevelChange}
                loading={loading}
                disabled={loading}
              />

              {/* Loading indicator for level changes */}
              {loading && (
                <View style={{ 
                  alignSelf: 'center', 
                  marginBottom: getResponsiveValue(16),
                  paddingVertical: getResponsiveValue(8)
                }}>
                  <Text className="text-[#003049] text-center text-sm opacity-70">Updating data...</Text>
                </View>
              )}

              {/* Error message */}
              {error && (
                <View style={{ 
                  alignSelf: 'center', 
                  marginBottom: getResponsiveValue(16),
                  width: '100%'
                }}>
                  <View className="bg-red-50 border border-red-200 rounded-lg" style={{ padding: getResponsiveValue(16) }}>
                    <Text className="text-red-600 text-center font-medium">Error</Text>
                    <Text className="text-red-500 text-center text-sm mt-1">{error}</Text>
                  </View>
                </View>
              )}

              {/* Today's Progress Section */}
              <View style={{ 
                alignSelf: 'center', 
                marginBottom: getResponsiveValue(32),
                width: '100%'
              }}>
                <Text 
                  className="text-[#003049] font-bold" 
                  style={{ 
                    fontSize: getResponsiveValue(20),
                    marginBottom: getResponsiveValue(16)
                  }}
                >
                  Today's Progress
                </Text>
                
                <View 
                  className="bg-[#E5EAED80] rounded-3xl" 
                  style={{ padding: getResponsiveValue(16) }}
                >
                  <View 
                    className="flex-row justify-between" 
                    style={{ gap: getResponsiveValue(8) }}
                  >
                    <StatCard 
                      value={`${(Number(todayProgressValues.accuracy) || 0).toFixed(1)}%`}
                      label="Accuracy" 
                      size="large" 
                    />
                    <StatCard 
                      value={(Number(todayProgressValues.streak) || 0).toString()}
                      label="Streak" 
                      size="large" 
                    />
                    <StatCard 
                      showFraction={true}
                      numerator={Number(todayProgressValues.correctAnswers) || 0}
                      denominator={Number(todayProgressValues.totalAttempts) || 0}
                      label="Correct/Total" 
                      size="large" 
                      value="" // Not used when showFraction is true
                    />
                  </View>
                </View>
              </View>

              {/* History Table - Last 5 Days */}
              <View style={{ width: '100%' }}>
                <Text 
                  className="text-[#003049] font-bold" 
                  style={{ 
                    fontSize: getResponsiveValue(20),
                    marginBottom: getResponsiveValue(16)
                  }}
                >
                  History
                </Text>
                
                <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <View 
                    className="bg-gray-100 flex-row" 
                    style={{ 
                      paddingVertical: getResponsiveValue(16),
                      paddingHorizontal: getResponsiveValue(16)
                    }}
                  >
                    <Text 
                      className="flex-1 text-[#003049] font-semibold"
                      style={{ fontSize: getResponsiveValue(16) }}
                    >
                      Date
                    </Text>
                    <Text 
                      className="text-center text-[#003049] font-semibold"
                      style={{ 
                        width: getResponsiveValue(60),
                        fontSize: getResponsiveValue(16)
                      }}
                    >
                      Streak
                    </Text>
                    <Text 
                      className="text-right text-[#003049] font-semibold"
                      style={{ 
                        width: getResponsiveValue(80),
                        fontSize: getResponsiveValue(16)
                      }}
                    >
                      Accuracy
                    </Text>
                  </View>
                  <View style={{ maxHeight: getResponsiveValue(300) }}>
                    <ScrollView 
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ flexGrow: 1 }}
                      nestedScrollEnabled={true}
                    >
                      {historyLoading ? (
                        <View style={{ 
                          paddingVertical: getResponsiveValue(32),
                          paddingHorizontal: getResponsiveValue(24)
                        }}>
                          <Text className="text-gray-500 text-center" style={{ fontSize: getResponsiveValue(14) }}>
                            Loading history...
                          </Text>
                        </View>
                      ) : historyData.length > 0 ? (
                        historyData.map((entry, index) => {
                          if (!entry || typeof entry !== 'object') {
                            return null
                          }
                          return (
                            <View
                              key={`${entry.date || 'unknown'}-${index}`}
                              className={`flex-row ${index !== historyData.length - 1 ? "border-b border-gray-100" : ""}`}
                              style={{
                                paddingVertical: getResponsiveValue(16),
                                paddingHorizontal: getResponsiveValue(16)
                              }}
                            >
                              <Text 
                                className="flex-1 text-[#003049]"
                                style={{ fontSize: getResponsiveValue(14) }}
                              >
                                {entry.date || 'Unknown'}
                              </Text>
                              <Text 
                                className="text-center text-[#003049] font-medium"
                                style={{ 
                                  width: getResponsiveValue(60),
                                  fontSize: getResponsiveValue(14)
                                }}
                              >
                                {entry.streak || 0}
                              </Text>
                              <Text 
                                className="text-right text-[#003049] font-medium"
                                style={{ 
                                  width: getResponsiveValue(80),
                                  fontSize: getResponsiveValue(14)
                                }}
                              >
                                {entry.accuracy || '0%'}
                              </Text>
                            </View>
                          )
                        }).filter(Boolean)
                      ) : (
                        <View style={{ 
                          paddingVertical: getResponsiveValue(32),
                          paddingHorizontal: getResponsiveValue(24)
                        }}>
                          <Text 
                            className="text-gray-500 text-center"
                            style={{ fontSize: getResponsiveValue(14) }}
                          >
                            {historyError ? historyError : "No history data available"}
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <View style={{ height: getResponsiveValue(32) }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}
