"use client"

import { View, Text, ScrollView } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import StatCard from "@/src/components/widgets/StatsCard"
import PlayAgainButton from "@/src/components/ui/buttons/PlayAgainButton"
import NoteGrid from "@/src/components/widgets/NoteGrid"
import ActionButton from "@/src/components/ui/buttons/ActionButton"
import { SafeAreaView } from "react-native-safe-area-context"

interface GameResultScreenProps {
  onBack?: () => void
  onPlayAgain?: () => void
  onNotePress?: (note: string) => void
  onLevelDown?: () => void
  onLevelUp?: () => void
  onMoreDetails?: () => void
  onSaveProgress?: () => void
}

export default function GameScreen({
  onBack,
  onPlayAgain,
  onNotePress,
  onLevelDown,
  onLevelUp,
  onMoreDetails,
  onSaveProgress,
}: GameResultScreenProps) {
  const navigation = useNavigation()
  const [currentLevel, setCurrentLevel] = useState(1) // Start with level 1 (1 row)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)

  const handleMoreDetails = () => {
    console.log("More Details pressed")
    onMoreDetails?.()
    navigation.navigate("Menu" as never, {
      accuracy: "53%",
      level: currentLevel,
      streaks: 10,
      selectedNote: selectedNote,
      gameResult: "correct",
    })
  }

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

  const handleSaveProgress = () => {
    console.log("Save Progress pressed")
    onSaveProgress?.()
    navigation.navigate("Register" as never)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-6 py-4">
        <BackButton onPress={onBack} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View className="flex-row justify-center px-6 mb-8 gap-x-6">
          <StatCard value="53%" label="Accuracy" size="small" valueColor="blue" />
          <StatCard value={currentLevel.toString()} label="Level" size="large" />
          <StatCard value="10" label="Streaks" size="small" />
        </View>

        {/* Play Again Button */}
        <View className="px-6 mb-6">
          <PlayAgainButton onPress={handlePlayAgain} />
        </View>

        {/* Correct Text */}
        {/* <Text className="text-[#003049] text-2xl font-bold text-center mb-8">Correct!</Text> */}

        {/* Note Grid */}
        <NoteGrid selectedNote={selectedNote} onNotePress={handleNotePress} visibleRows={currentLevel} />

        {/* Level Control Buttons */}
        <View className="px-6 mb-4 gap-y-3">
          {currentLevel > 1 && <ActionButton title="Level Down" icon="arrow-down" onPress={handleLevelDown} />}
          {currentLevel < 4 && <ActionButton title="Level Up" icon="arrow-up" onPress={handleLevelUp} />}
        </View>

        {/* Save Progress Text */}
       
        {/* Extra space to ensure content doesn't get hidden behind fixed button */}
        <View className="h-20" />
      </ScrollView>

      {/* Fixed More Details Button at bottom */}
      <View className="px-6 pb-8 pt-4">
        <ActionButton title="More Details" icon="dots" onPress={handleMoreDetails}/>
        {/* Bottom indicator */}
        <View className="pt-4">
           <Text className="text-[#006AE6] text-lg font-semibold text-center" onPress={handleSaveProgress}>
          Save your progress
        </Text>

        </View>
      </View>
    </SafeAreaView>
  )
}
