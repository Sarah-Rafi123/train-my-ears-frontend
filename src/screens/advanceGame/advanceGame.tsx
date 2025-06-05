"use client"

import { View, ScrollView, SafeAreaView, Text } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import StatCard from "@/src/components/widgets/StatsCard"
import PlayAgainButton from "@/src/components/ui/buttons/PlayAgainButton"
import CircularIndicator from "@/src/components/widgets/CircularIndicator"
import NoteGrid from "@/src/components/widgets/NoteGrid"
import ActionButton from "@/src/components/ui/buttons/ActionButton"

interface AdvancedStatsScreenProps {
  onBack?: () => void
  onPlayAgain?: () => void
  onNotePress?: (note: string) => void
  onLevelDown?: () => void
  onLevelUp?: () => void
  onMoreDetails?: () => void
  onRegister?: () => void
}

export default function AdvanceGameScreen({
  onBack,
  onPlayAgain,
  onNotePress,
  onLevelDown,
  onLevelUp,
  onMoreDetails,
  onRegister,
}: AdvancedStatsScreenProps) {
  const navigation = useNavigation()
  const [currentLevel, setCurrentLevel] = useState(1) // Start with level 1 (1 row)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)

  const handlePlayAgain = () => {
    console.log("Play Again pressed")
    setSelectedNote(null) // Reset selected note
    onPlayAgain?.()
  }

  const handleLevelDown = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1)
      setSelectedNote(null) // Reset selected note when level changes
    }
    console.log("Level Down pressed, new level:", currentLevel - 1)
    onLevelDown?.()
  }

  const handleLevelUp = () => {
    if (currentLevel < 4) {
      setCurrentLevel(currentLevel + 1)
      setSelectedNote(null) // Reset selected note when level changes
    }
    console.log("Level Up pressed, new level:", currentLevel + 1)
    onLevelUp?.()
  }

  const handleNotePress = (note: string, rowIndex: number, noteIndex: number) => {
    setSelectedNote(`${note}-${rowIndex}-${noteIndex}`)
    onNotePress?.(note)
  }

  const handleMoreDetails = () => {
    console.log("More Details pressed")
    onMoreDetails?.()
    navigation.navigate("Menu" as never)
  }

  const handleRegister = () => {
    console.log("Register pressed")
    onRegister?.()
    navigation.navigate("Register" as never)
  }

  const handleBack = () => {
    console.log("Back pressed")
    onBack?.()
    navigation.goBack()
  }

  // Calculate accuracy based on level for demo purposes
  const getAccuracy = () => {
    const baseAccuracy = 23
    const levelBonus = (currentLevel - 1) * 15
    return Math.min(baseAccuracy + levelBonus, 95)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center mt-8 px-6 pb-8">
        <BackButton onPress={handleBack} />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-center px-6 mb-8 gap-x-6">
          <StatCard value={`${getAccuracy()}%`} label="Accuracy" size="small" valueColor="blue" />
          <StatCard value={currentLevel.toString()} label="Level" size="large" />
          <StatCard value="10" label="Streaks" size="small" />
        </View>
        <View className="px-6 mb-6">
          <PlayAgainButton onPress={handlePlayAgain} />
        </View>
        <View className="flex-row justify-center gap-x-4 mb-8">
          <CircularIndicator type={currentLevel >= 2 ? "success" : "error"} />
          <CircularIndicator type={currentLevel >= 3 ? "success" : currentLevel >= 2 ? "error" : "empty"} />
          <CircularIndicator type={currentLevel >= 4 ? "success" : currentLevel >= 3 ? "error" : "empty"} />
        </View>
        <NoteGrid selectedNote={selectedNote} onNotePress={handleNotePress} visibleRows={currentLevel} />
        <View className="px-6 mb-4 gap-y-3">
          {currentLevel > 1 && <ActionButton title="Level Down" icon="arrow-down" onPress={handleLevelDown} />}
          {currentLevel < 4 && <ActionButton  title="Level Up" icon="arrow-up" onPress={handleLevelUp} />}
        </View>

        {/* Extra space to ensure content doesn't get hidden behind fixed button */}
        <View className="h-20" />
      </ScrollView>

      {/* Fixed Action Buttons at bottom */}
      <View className="px-6 pb-8 pt-4">
        <View className="space-y-3">
          <ActionButton title="More Details" icon="dots" onPress={handleMoreDetails} />

        </View>

        {/* Home indicator */}
        <View className="pt-4 mb-8">
   <Text className="text-[#006AE6] text-lg font-semibold text-center" >
          Save your progress
        </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
