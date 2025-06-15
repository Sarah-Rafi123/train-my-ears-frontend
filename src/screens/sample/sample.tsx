"use client"

import { View, Text, ScrollView, SafeAreaView, Alert } from "react-native"
import { useState, useCallback } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import NoteButton from "@/src/components/ui/buttons/NoteButton"
import ActionButton from "@/src/components/ui/buttons/ActionButton"
import SoundWavesSvg from "@/src/assets/svgs/SoundWaves"
import { useChords } from "@/src/hooks/useChords"
import { audioService } from "@/src/services/audioService"
import { useAuth } from "@/src/context/AuthContext"
import type { Chord } from "@/src/services/chordsApi"

interface ChordGameScreenProps {
  onBack?: () => void
  onUpgrade?: () => void
}

declare const __DEV__: boolean

export default function ChordGameScreen({ onBack, onUpgrade }: ChordGameScreenProps) {
  const { user, guitarId, pianoId } = useAuth()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [selectedChord, setSelectedChord] = useState<string | null>(null)
  const [playingChord, setPlayingChord] = useState<string | null>(null)

  const { chords, metadata, isLoading, error, refetch, getExpectedChordCount } = useChords(currentLevel)

  // Group chords into rows of 3 for display
  const getChordRows = useCallback((chords: Chord[]): Chord[][] => {
    const rows: Chord[][] = []
    for (let i = 0; i < chords.length; i += 3) {
      rows.push(chords.slice(i, i + 3))
    }
    return rows
  }, [])

  const chordRows = getChordRows(chords)

  const handleLevelUp = useCallback(() => {
    if (currentLevel < 4) {
      const newLevel = currentLevel + 1
      setCurrentLevel(newLevel)
      setSelectedChord(null)
      console.log("Level Up pressed, new level:", newLevel)
    }
  }, [currentLevel])

  const handleLevelDown = useCallback(() => {
    if (currentLevel > 1) {
      const newLevel = currentLevel - 1
      setCurrentLevel(newLevel)
      setSelectedChord(null)
      console.log("Level Down pressed, new level:", newLevel)
    }
  }, [currentLevel])

  const handleChordPress = useCallback(async (chord: Chord, rowIndex: number, chordIndex: number) => {
    const chordId = `${chord.id}-${rowIndex}-${chordIndex}`
    setSelectedChord(chordId)

    console.log(`Chord pressed: ${chord.displayName} (${chord.name})`)

    // Play audio if available
    if (chord.audioFileUrl) {
      try {
        setPlayingChord(chord.id)
        await audioService.playAudio(chord.audioFileUrl)
        console.log(`🎵 Playing audio for chord: ${chord.displayName}`)
      } catch (error) {
        console.error("❌ Error playing chord audio:", error)
        Alert.alert("Audio Error", "Failed to play chord audio")
      } finally {
        setPlayingChord(null)
      }
    } else {
      console.warn("⚠️ No audio file available for chord:", chord.displayName)
      Alert.alert("No Audio", `No audio file available for ${chord.displayName}`)
    }
  }, [])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // Get instrument name for display
  const getInstrumentName = () => {
    if (guitarId) return "Guitar"
    if (pianoId) return "Piano"
    return "Unknown"
  }

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center mt-8 px-6 py-8">
          <BackButton onPress={onBack} />
          <View className="flex-1">
            <Text className="text-slate-800 text-xl font-semibold text-center mt-4 mr-10">Loading Chords...</Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 text-lg">Loading chords for level {currentLevel}...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center mt-8 px-6 py-8">
          <BackButton onPress={onBack} />
          <View className="flex-1">
            <Text className="text-slate-800 text-xl font-semibold text-center mt-4 mr-10">Error Loading Chords</Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-600 text-lg text-center mb-4">{error}</Text>
          <ActionButton title="Retry" variant="filled" onPress={handleRetry} />
        </View>
      </SafeAreaView>
    )
  }

  const expectedChords = getExpectedChordCount(currentLevel)
  const actualChords = chords.length

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center mt-8 px-6 py-8">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-slate-800 text-xl font-semibold text-center mt-4 mr-10">
            {getInstrumentName()} Chords - Level {currentLevel}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Audio Waveform */}
        <View className="justify-center items-center mb-4">
          <SoundWavesSvg />
        </View>

        {/* Level Info */}
        {/* <View className="px-6 mb-4">
          <Text className="text-center text-gray-600 text-sm">
            {metadata?.levelInfo.description || `Level ${currentLevel} - ${actualChords} of ${expectedChords} chords`}
          </Text>
          {actualChords !== expectedChords && (
            <Text className="text-center text-orange-600 text-sm mt-1">
              ⚠️ Expected {expectedChords} chords, found {actualChords}
            </Text>
          )}
        </View> */}

        {/* Chord Grid */}
        <View className="px-6 mb-8">
          {chordRows.length > 0 ? (
            chordRows.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-between mb-4">
                {row.map((chord, chordIndex) => (
                  <NoteButton
                    key={`${chord.id}-${rowIndex}-${chordIndex}`}
                    note={chord.displayName}
                    isSelected={selectedChord === `${chord.id}-${rowIndex}-${chordIndex}`}
                    onPress={() => handleChordPress(chord, rowIndex, chordIndex)}
                    disabled={playingChord === chord.id}
                    state={playingChord === chord.id ? "selected" : "default"}
                  />
                ))}
                {/* Fill empty slots in the row */}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, emptyIndex) => (
                    <View key={`empty-${rowIndex}-${emptyIndex}`} className="min-w-[80px]" />
                  ))}
              </View>
            ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-600 text-lg text-center">No chords available for this level</Text>
            </View>
          )}
        </View>

        {/* Level Control Buttons */}
        <View className="px-6 mb-4 items-center gap-y-3">
          {currentLevel < 4 && (
            <ActionButton title={`Upgrade to level ${currentLevel + 1}`} icon="arrow-up" onPress={handleLevelUp} />
          )}
          {currentLevel > 1 && (
            <ActionButton
              title={`Downgrade to level ${currentLevel - 1}`}
              icon="arrow-down"
              onPress={handleLevelDown}
            />
          )}
        </View>

        {/* Debug Info (remove in production) */}
        {/* {__DEV__ && metadata && (
          <View className="px-6 mb-4">
            <Text className="text-xs text-gray-500 text-center">
              Debug:{" "}
              {JSON.stringify(
                {
                  level: currentLevel,
                  totalChords: actualChords,
                  expected: expectedChords,
                  instrumentId: guitarId || pianoId,
                },
                null,
                2,
              )}
            </Text>
          </View>
        )} */}

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
