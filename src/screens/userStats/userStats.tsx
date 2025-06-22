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
  route?: any 
  onBack?: () => void
  userId?: string 
}

export default function UserStatsScreen({ navigation, route, onBack, userId = "cmbyuzdld0000qljum0i8f11r" }: StatsScreenProps) {
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [todayProgressData, setTodayProgressData] = useState<DailyProgressData | null>(null)
  const [historicalProgressData, setHistoricalProgressData] = useState<DailyProgressData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Get today's progress card values
  const getTodayProgressValues = () => {
    if (!todayProgressData) {
      return { streak: 0, accuracy: 0 }
    }
    
    return dailyProgressUtils.getProgressCardValues(todayProgressData, selectedLevel || undefined)
  }

  // Convert historical data to history table format (last 5 days)
  const historyData = dailyProgressUtils.convertToHistoryData(historicalProgressData, selectedLevel || undefined)

  const todayProgressValues = getTodayProgressValues()

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

              {/* Today's Progress Section */}
              <View className="px-6 mb-8">
                <Text className="text-[#003049] text-xl font-bold mb-4">
                  Today's Progress 
                </Text>
                <View className="flex-row gap-x-4">
                  <ProgressCard 
                    icon="fire" 
                    value={todayProgressValues.streak} 
                    className="flex-1" 
                  />
                  <ProgressCard 
                    icon="target" 
                    value={Math.round(todayProgressValues.accuracy)} 
                    suffix="%" 
                    className="flex-1" 
                  />
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
                    <Text className="w-24 text-right text-[#003049] text-lg font-semibold">Accuracy</Text>
                  </View>

                  {/* Scrollable Data Rows */}
                  <ScrollView className="max-h-64" showsVerticalScrollIndicator={true}>
                    {historyData.length > 0 ? (
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