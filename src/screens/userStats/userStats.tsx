"use client"

import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet, Image, Alert, Platform, Dimensions } from "react-native"
import { useState, useCallback, useEffect } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import ChordCard from "@/src/components/widgets/ChordCard"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import ProgressCard from "@/src/components/widgets/ProgressCard"
import { dailyProgressApi, dailyProgressUtils, DailyProgressData } from "@/src/services/dailyProgressApi"
import { useAuth } from "@/src/context/AuthContext"
import StatCard from "@/src/components/widgets/StatsCard"

// Define proper navigation prop types
interface StatsScreenProps {
  navigation?: any // Replace with proper type from @react-navigation/native
  route?: any 
  onBack?: () => void
}

export default function UserStatsScreen({ navigation, route, onBack }: StatsScreenProps) {
  const { userId, user } = useAuth() // We now have access to the user object
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [todayProgressData, setTodayProgressData] = useState<DailyProgressData | null>(null)
  const [historicalProgressData, setHistoricalProgressData] = useState<DailyProgressData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Generate dates for last 5 days (excluding today)
  const generateLast5Days = () => {
    const dates: string[] = []
    const today = new Date()
    
    // Generate last 5 days excluding today
    for (let i = 5; i >= 1; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates.reverse() // Most recent first
  }

  const fetchProgressData = async (level?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`📊 Fetching progress data for user ${userId}, level: ${level || 'all'}`)
      
      // Fetch today's progress for the boxes
      const todayResponse = await dailyProgressApi.getTodayProgress(userId, level)
      if (todayResponse.success) {
        setTodayProgressData(todayResponse.data.progress)
        console.log(`✅ Successfully loaded today's progress data`)
      }
      
      // Fetch last 5 days for history table
      const last5Days = generateLast5Days()
      console.log(`📅 Fetching last 5 days data:`, last5Days)
      
      const historicalData = await dailyProgressApi.getMultipleDaysProgress(userId, last5Days, level)
      setHistoricalProgressData(historicalData)
      console.log(`✅ Successfully loaded last 5 days progress data`)
      
    } catch (err) {
      console.error(`❌ Error fetching progress data:`, err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load progress data'
      setError(errorMessage)
      setTodayProgressData(null)
      setHistoricalProgressData([])
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchProgressData()
  }, [userId])

  // Handle level change with API call
  const handleLevelChange = useCallback(async (level: number) => {
    console.log(`Level ${level} selected, fetching level-specific data`)
    setSelectedLevel(level)
    await fetchProgressData(level)
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
      const levelProgress = todayProgressData.levelProgress.find(
        level => level.levelId === selectedLevel
      )
      
      if (levelProgress) {
        return {
          streak: levelProgress.maxStreak,
          accuracy: levelProgress.overallAccuracy,
          totalGamesPlayed: levelProgress.totalGamesPlayed,
          totalAttempts: levelProgress.totalAttempts,
          correctAnswers: levelProgress.correctAnswers
        }
      }
    }
    
    // Use overall stats when no level is selected
    return {
      streak: todayProgressData.overallUserStats?.maxStreak || 0,
      accuracy: todayProgressData.overallUserStats?.overallAccuracy || 0,
      totalGamesPlayed: todayProgressData.overallUserStats?.totalGamesPlayed || 0,
      totalAttempts: todayProgressData.overallUserStats?.totalAttempts || 0,
      correctAnswers: todayProgressData.overallUserStats?.correctAnswers || 0
    }
  }

  // Convert historical data to history table format (last 5 days)
  const historyData = dailyProgressUtils.convertToHistoryData(historicalProgressData, selectedLevel || undefined)

  const todayProgressValues = getTodayProgressValues()

  // Get the first letter of the user's name
  const userFirstLetter = user?.name?.charAt(0).toUpperCase() || "A"; // Default to "A" if no first name

  return (
    <SafeAreaView className="flex-1 pt-8 bg-[#F2F5F6]">
      {/* Header with back button */}
      <BackButton onPress={handleBack} />

      {/* Blue background section with reduced height */}
      <View className="h-28" />

      {/* Container for overlapping chord card and white section */}
      <View className="flex-1 relative">
        {/* Chord Card - positioned to overlap both sections */}
        <View className="absolute -top-16 left-0 right-0 z-10 px-6">
          <ChordCard chord={userFirstLetter} className="w-32 h-32 self-center" /> {/* Use the first letter */}
        </View>

        {/* White background section stretching to end of screen */}
        <View className="flex-1 bg-white rounded-t-3xl">
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

              {/* Loading indicator */}
              {loading && (
                <View className="px-6 mb-4">
                  <Text className="text-[#003049] text-center">Loading progress data...</Text>
                </View>
              )}

              {/* Error message */}
              {error && (
                <View className="px-6 mb-4">
                  <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <Text className="text-red-600 text-center font-medium">Error</Text>
                    <Text className="text-red-500 text-center text-sm mt-1">{error}</Text>
                  </View>
                </View>
              )}

              {/* Today's Progress Section */}
              <View className="px-6 mb-8">
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
                      label="Corrects/Total" 
                      size="large" 
                      value="" // Not used when showFraction is true
                    />
                  </View>
                </View>
              </View>

              {/* History Table - Last 5 Days */}
              <View className="px-6">
                <Text className="text-[#003049] text-xl font-bold mb-4">History</Text>
                
                <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <View className="bg-gray-100 flex-row py-4 px-6">
                    <Text className="flex-1 text-[#003049] text-lg font-semibold">Date</Text>
                    <Text className="w-20 text-center text-[#003049] text-lg font-semibold">Streak</Text>
                    <Text className="w-28 text-right text-[#003049] text-lg font-semibold">Accuracy</Text>
                  </View>

                  {/* Scrollable Data Rows */}
                  <ScrollView className="max-h-64" showsVerticalScrollIndicator={true}>
                    {historyData.length > 0 ? (
                      historyData.map((entry, index) => (
                        <View
                          key={`${entry.date}-${index}`}
                          className={`flex-row mb-3 py-4 px-6 ${index !== historyData.length - 1 ? "border-b border-gray-100" : ""}`}
                        >
                          <Text className="flex-1 text-[#003049] text-base">{entry.date}</Text>
                          <Text className="w-20 text-center text-[#003049] text-base font-medium">{entry.streak}</Text>
                          <Text className="w-24 text-right text-[#003049] text-base font-medium">{entry.accuracy}</Text>
                        </View>
                      ))
                    ) : (
                      <View className="py-8 px-6">
                        <Text className="text-gray-500 text-center">
                          {loading ? "Loading history..." : "No history data available"}
                        </Text>
                      </View>
                    )}
                  </ScrollView>
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
