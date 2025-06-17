"use client"

import { View, Text, ScrollView, SafeAreaView } from "react-native"
import { useState, useCallback, useEffect } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import ChordCard from "@/src/components/widgets/ChordCard"
import ModeSelector from "@/src/components/widgets/ModeSelector"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import ProgressCard from "@/src/components/widgets/ProgressCard"
import HistoryTable from "@/src/components/widgets/HistoryTable"
import { dailyProgressApi, dailyProgressUtils, DailyProgressData } from "@/src/services/dailyProgressApi"

// Define proper navigation prop types
interface StatsScreenProps {
  navigation?: any // Replace with proper type from @react-navigation/native
  route?: any // Replace with proper type from @react-navigation/native
  onBack?: () => void
  userId?: string // Add userId prop
}

export default function UserStatsScreen({ navigation, route, onBack, userId = "cmbyuzdld0000qljum0i8f11r" }: StatsScreenProps) {
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [todayProgressData, setTodayProgressData] = useState<DailyProgressData | null>(null)
  const [historicalProgressData, setHistoricalProgressData] = useState<DailyProgressData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch progress data for last 4 days (today + 3 previous days)
  const fetchProgressData = async (level?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`📊 Fetching progress data for user ${userId}, level: ${level || 'all'}`)
      
      // Fetch last 4 days of progress data
      const progressDataArray = await dailyProgressApi.getLastNDaysProgress(userId, 4, level)
      
      if (progressDataArray.length > 0) {
        // Today's data is the last item (most recent)
        const todayData = progressDataArray[progressDataArray.length - 1]
        setTodayProgressData(todayData)
        setHistoricalProgressData(progressDataArray)
        
        console.log(`✅ Successfully loaded progress data for ${progressDataArray.length} days`)
      } else {
        throw new Error('No progress data available')
      }
      
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

  // Handle level change with API call
  const handleLevelChange = useCallback(async (level: number) => {
    console.log(`Level ${level} selected, fetching level-specific data`)
    setSelectedLevel(level)
    await fetchProgressData(level)
  }, [userId])

  // Get progress card values based on selected level (today's data)
  const getProgressValues = () => {
    if (!todayProgressData) {
      return { streak: 0, accuracy: 0 }
    }
    
    return dailyProgressUtils.getProgressCardValues(todayProgressData, selectedLevel || undefined)
  }

  // Convert historical data to history table format
  const historyData = dailyProgressUtils.convertToHistoryData(historicalProgressData, selectedLevel || undefined)

  const progressValues = getProgressValues()

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
          <ChordCard chord="AM" className="w-32 h-32 self-center" />
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

              {/* Daily Progress - Today's Data */}
              <View className="px-6 mb-8">
                <Text className="text-[#003049] text-xl font-bold mb-4">
                  Today's Progress {selectedLevel ? `- Level ${selectedLevel}` : ''}
                </Text>
                <View className="flex-row gap-x-4">
                  <ProgressCard 
                    icon="fire" 
                    value={progressValues.streak} 
                    className="flex-1" 
                  />
                  <ProgressCard 
                    icon="target" 
                    value={Math.round(progressValues.accuracy)} 
                    suffix="%" 
                    className="flex-1" 
                  />
                </View>
              </View>

              {/* History Table - Last 4 Days */}
              <HistoryTable data={historyData} />

              {/* Data info */}
              {/* {!loading && !error && historicalProgressData.length > 0 && (
                <View className="px-6 mt-4 mb-8">
                  <View className="bg-blue-50 rounded-lg p-4">
                    <Text className="text-[#003049] font-medium mb-2">
                      {selectedLevel ? `Level ${selectedLevel} Progress` : 'Overall Progress'}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Showing data for the last 4 days including today
                      {selectedLevel ? ` for Level ${selectedLevel}` : ' across all levels'}.
                    </Text>
                  </View>
                </View>
              )} */}

              {/* Empty state */}
              {/* {!loading && !error && historicalProgressData.length === 0 && (
                <View className="px-6 mt-4 mb-8">
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-center">
                      No progress data available for the selected period.
                    </Text>
                  </View>
                </View>
              )} */}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}