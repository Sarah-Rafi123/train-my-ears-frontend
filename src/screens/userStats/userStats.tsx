"use client"

import { View, Text, ScrollView, SafeAreaView } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import ChordCard from "@/src/components/widgets/ChordCard"
import ModeSelector from "@/src/components/widgets/ModeSelector"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import ProgressCard from "@/src/components/widgets/ProgressCard"
import HistoryTable from "@/src/components/widgets/HistoryTable"

interface StatsScreenProps {
  onBack?: () => void
}

export default function UserStatsScreen({ onBack }: StatsScreenProps) {
  const navigation = useNavigation()
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState(2)

  // Sample history data - remains unchanged regardless of level selection
  const historyData = [
    { date: "Dec 23, 2024", streak: 23, accuracy: "20%" },
    { date: "Jan 2, 2025", streak: 19, accuracy: "14%" },
    { date: "Oct 23, 2025", streak: 18, accuracy: "14%" },
  ]

  // Back button handler - this was missing!
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigation.goBack()
    }
  }

  const handleLevelChange = (level: number) => {
    console.log(`Level ${level} selected, but no data changes applied`)
  }

  return (
    <SafeAreaView className="flex-1 pt-8 bg-[#1e3a5f]">
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
            <View className="pt-20">
              {/* Mode Selector */}
              <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />

              {/* Level Selector */}
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
