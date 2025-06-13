"use client"

import { View, Text, ScrollView, SafeAreaView } from "react-native"
import { useState, useCallback } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import ChordCard from "@/src/components/widgets/ChordCard"
import ModeSelector from "@/src/components/widgets/ModeSelector"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import ProgressCard from "@/src/components/widgets/ProgressCard"
import HistoryTable from "@/src/components/widgets/HistoryTable"

// Define proper navigation prop types
interface StatsScreenProps {
  navigation?: any // Replace with proper type from @react-navigation/native
  route?: any // Replace with proper type from @react-navigation/native
  onBack?: () => void
}

export default function UserStatsScreen({ navigation, route, onBack }: StatsScreenProps) {
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  // Sample history data - remains unchanged regardless of level selection
  const historyData = [
    { date: "Dec 23, 2024", streak: 23, accuracy: "20%" },
    { date: "Jan 2, 2025", streak: 19, accuracy: "14%" },
    { date: "Oct 23, 2025", streak: 18, accuracy: "14%" },
  ]

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

  // Empty handler that only updates visual state
  const handleLevelChange = useCallback((level: number) => {
    console.log(`Level ${level} selected, but no data changes applied`)
    setSelectedLevel(level) // Only updates visual state
  }, [])

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
              {/* Mode Selector */}
              {/* <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} /> */}

              {/* Level Selector - No initial selection */}
              <LevelSelector selectedLevel={selectedLevel} onLevelChange={handleLevelChange} />

              {/* Daily Progress */}
              <View className="px-6 mb-8">
                <Text className="text-[#003049] text-xl font-bold mb-4">Daily Progress</Text>
                <View className="flex-row gap-x-4">
                  <ProgressCard icon="fire" value={124} className="flex-1" />
                  <ProgressCard icon="target" value={48} suffix="%" className="flex-1" />
                </View>
              </View>

              {/* History Table */}
              <HistoryTable data={historyData} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}
