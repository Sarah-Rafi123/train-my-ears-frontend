"use client"

import { View, Text, ScrollView } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import ModeSelector from "@/src/components/widgets/ModeSelector"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import PodiumPlayer from "@/src/components/widgets/PodiumPlayer"
import LeaderboardRow from "@/src/components/widgets/LeaderBoardRow"
import { SafeAreaView } from "react-native-safe-area-context"

interface LeaderboardScreenProps {
  onBack?: () => void
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const navigation = useNavigation()
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState(2)

  const leaderboardData = [
    { place: 1, name: "Cody", streak: 23, accuracy: "20%" },
    { place: 2, name: "Kathryn", streak: 19, accuracy: "14%" },
    { place: 3, name: "Kristin", streak: 18, accuracy: "14%" },
  ]

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigation.goBack()
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <BackButton onPress={handleBack} />
        <View className="flex-1">
          <Text className="text-[#003049] text-2xl font-semibold text-center mt-4 mr-10">Leaderboard</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Mode Selector */}
        <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />

        {/* Level Selector */}
        <LevelSelector selectedLevel={selectedLevel} onLevelChange={setSelectedLevel} />

        {/* Podium */}
        <View className="flex-row justify-center items-end gap-x-8 mb-8 px-6">
          <PodiumPlayer name="Kathryn" initials="KM" position={2} />
          <PodiumPlayer name="Cody" initials="CF" position={1} />
          <PodiumPlayer name="Kristin" initials="KW" position={3} />
        </View>

        {/* Leaderboard Table */}
        <View className="mx-6 bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <View className="bg-gray-100 flex-row py-4 px-6">
            <Text className="text-[#003049] font-semibold w-12">Place</Text>
            <Text className="text-[#003049] font-semibold flex-1 ml-4">Name</Text>
            <Text className="text-[#003049] font-semibold w-16 text-center">Streak</Text>
            <Text className="text-[#003049] font-semibold w-20 text-center">Accuracy</Text>
          </View>

          {/* Leaderboard Rows */}
          {leaderboardData.map((player) => (
            <LeaderboardRow
              key={player.place}
              place={player.place}
              name={player.name}
              streak={player.streak}
              accuracy={player.accuracy}
            />
          ))}
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Bottom indicator */}
      <View className="pb-8 pt-4">
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </SafeAreaView>
  )
}