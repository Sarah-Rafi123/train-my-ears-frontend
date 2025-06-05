"use client"

import { View, Text, ScrollView, SafeAreaView } from "react-native"
import { useState } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import NoteButton from "@/src/components/ui/buttons/NoteButton"
import ActionButton from "@/src/components/ui/buttons/ActionButton"
import SoundWavesSvg from "@/src/assets/svgs/SoundWaves"

interface ViewSampleScreenProps {
  onBack?: () => void
  onNotePress?: (note: string) => void
  onUpgrade?: () => void
}

export default function SampleScreen({ onBack, onNotePress, onUpgrade }: ViewSampleScreenProps) {
  const [currentLevel, setCurrentLevel] = useState(1) // Start with level 1 (1 row)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)

  // All possible note rows
  const allNoteRows = [
    ["G", "C", "D"],
    ["E", "A", "Em"],
    ["G", "C", "D"],
    ["E", "A", "Em"],
  ]

  // Only show the number of rows corresponding to the current level
  const visibleNoteRows = allNoteRows.slice(0, currentLevel)

  const handleLevelUp = () => {
    if (currentLevel < 4) {
      setCurrentLevel(currentLevel + 1)
      setSelectedNote(null) // Reset selected note when level changes
      console.log("Level Up pressed, new level:", currentLevel + 1)
    }
  }

  const handleLevelDown = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1)
      setSelectedNote(null) // Reset selected note when level changes
      console.log("Level Down pressed, new level:", currentLevel - 1)
    }
  }

  const handleNotePress = (note: string, rowIndex: number, noteIndex: number) => {
    const noteId = `${note}-${rowIndex}-${noteIndex}`
    setSelectedNote(noteId)
    onNotePress?.(note)
    console.log(`Note pressed: ${note} at row ${rowIndex}, position ${noteIndex}`)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center mt-8 px-6 pb-8">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-slate-800 text-xl font-semibold text-center mt-4 mr-10">
            View Sample 
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Audio Waveform */}
        <View className="justify-center items-center mb-8">
          <SoundWavesSvg />
        </View>

        {/* Note Grid */}
        <View className="px-6 mb-8">
          {visibleNoteRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between mb-4">
              {row.map((note, noteIndex) => (
                <NoteButton
                  key={`${rowIndex}-${noteIndex}`}
                  note={note}
                  isSelected={selectedNote === `${note}-${rowIndex}-${noteIndex}`}
                  onPress={() => handleNotePress(note, rowIndex, noteIndex)}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Level Control Buttons */}
        <View className="px-6 mb-4 gap-y-3">
          {currentLevel < 4 && (
            <ActionButton
              title={`Upgrade to level ${currentLevel + 1}`}
              icon="arrow-down"
              onPress={handleLevelUp}
              variant="filled"
            />
          )}
          {currentLevel > 1 && (
            <ActionButton
              title={`Downgrade to level ${currentLevel - 1}`}
              icon="arrow-up"
              onPress={handleLevelDown}
            />
          )}
        </View>

        {/* Extra space at bottom for better scrolling */}
        <View className="h-20" />
      </ScrollView>

      {/* Home indicator */}
      <View className="pb-8 pt-4">
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </SafeAreaView>
  )
}
