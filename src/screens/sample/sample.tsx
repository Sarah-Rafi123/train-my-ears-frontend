"use client"

import { View, Text, ScrollView, SafeAreaView, Alert, Image } from "react-native"
import { useState, useCallback } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import NoteButton from "@/src/components/ui/buttons/NoteButton"
import ActionButton from "@/src/components/ui/buttons/ActionButton"
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
  const [isGifAnimating, setIsGifAnimating] = useState(false)

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
        setIsGifAnimating(true) // Start GIF animation

        await audioService.playAudio(chord.audioFileUrl)
        console.log(`🎵 Playing audio for chord: ${chord.displayName}`)

        // Stop GIF animation after a delay (adjust timing as needed)
        setTimeout(() => {
          setIsGifAnimating(false)
        }, 2000) // 2 seconds - adjust based on your audio length
      } catch (error) {
        console.error("❌ Error playing chord audio:", error)
        Alert.alert("Audio Error", "Failed to play chord audio")
        setIsGifAnimating(false) // Stop animation on error
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
        <View className="flex-1"></View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Container for SoundWaves, Placeholder Image, and GIF with fixed height */}
        <View className="justify-center items-center mb-4" style={{ height: 140 }}>
          {/* <SoundWavesSvg /> */}

          {/* Placeholder Image - Shows when GIF is NOT animating */}
          {!isGifAnimating && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 5,
              }}
            >
              <Image
                source={require("@/src/assets/images/sound.png")} // Add your placeholder image here
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: "contain",
                 // Slightly transparent for a subtle look
                }}
              />
            </View>
          )}

          {/* Animated GIF - Shows when audio is playing */}
          {isGifAnimating && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <Image
                source={require("@/src/assets/gifs/music.gif")}
                style={{
                  width: 120,
                  height: 120,
                  resizeMode: "contain",
                }}
              />
            </View>
          )}
        </View>

        {/* Chord Grid - 3 per row layout */}
        <View className="px-6 mb-8">
          {chordRows.length > 0 ? (
            chordRows.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-center gap-x-3 mb-4">
                {row.map((chord, chordIndex) => (
                  <View key={`${chord.id}-${rowIndex}-${chordIndex}`} className="flex-1 max-w-[30%]">
                    <NoteButton
                      note={chord.displayName}
                      isSelected={selectedChord === `${chord.id}-${rowIndex}-${chordIndex}`}
                      onPress={() => handleChordPress(chord, rowIndex, chordIndex)}
                      disabled={playingChord === chord.id}
                      state={playingChord === chord.id ? "selected" : "default"}
                    />
                  </View>
                ))}
                {/* Fill empty slots in the row to maintain alignment */}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, emptyIndex) => (
                    <View key={`empty-${rowIndex}-${emptyIndex}`} className="flex-1 max-w-[30%]" />
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
          {currentLevel < 4 && <ActionButton title={`Level Up`} icon="arrow-up" onPress={handleLevelUp} />}
          {currentLevel > 1 && <ActionButton title={`Level Down`} icon="arrow-down" onPress={handleLevelDown} />}
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
