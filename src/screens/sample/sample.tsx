"use client"

import { View, Text, ScrollView, SafeAreaView, Alert, Image } from "react-native"
import { useState, useCallback, useRef, useEffect } from "react"
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
  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const [isGifAnimating, setIsGifAnimating] = useState(false)
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    if (isOnCooldown) {
      console.log("🚫 Level Up on cooldown, ignoring press")
      return
    }
    if (currentLevel < 4) {
      const newLevel = currentLevel + 1
      setCurrentLevel(newLevel)
      setSelectedChord(null)
      console.log("Level Up pressed, new level:", newLevel)
    }
  }, [currentLevel, isOnCooldown])

  const handleLevelDown = useCallback(() => {
    if (isOnCooldown) {
      console.log("🚫 Level Down on cooldown, ignoring press")
      return
    }
    if (currentLevel > 1) {
      const newLevel = currentLevel - 1
      setCurrentLevel(newLevel)
      setSelectedChord(null)
      console.log("Level Down pressed, new level:", newLevel)
    }
  }, [currentLevel, isOnCooldown])

  const handleChordPress = useCallback(async (chord: Chord, rowIndex: number, chordIndex: number) => {
    // If on cooldown, ignore all button presses
    if (isOnCooldown) {
      console.log("🚫 Button on cooldown, ignoring press")
      return
    }

    const chordId = `${chord.id}-${rowIndex}-${chordIndex}`
    setSelectedChord(chordId)

    console.log(`🎵 Chord pressed: ${chord.displayName} (${chord.name})`)

    // Play chord audio using local assets
    if (chord.name && chord.instrument?.name) {
      try {
        // Set cooldown immediately
        setIsOnCooldown(true)
        setIsGifAnimating(true) // Start GIF animation

        // Clear any existing timeout
        if (cooldownTimeoutRef.current) {
          clearTimeout(cooldownTimeoutRef.current)
        }

        // Play the audio
        await audioService.playChordAudio(chord.name, chord.instrument.name)
        console.log(`🎵 Playing chord audio: ${chord.displayName} (${chord.instrument.name})`)

        // Set cooldown for exactly 2 seconds
        cooldownTimeoutRef.current = setTimeout(() => {
          console.log("✅ Cooldown ended, buttons enabled")
          setIsOnCooldown(false)
          setIsGifAnimating(false)
          cooldownTimeoutRef.current = null
        }, 2000) // Exactly 2 second cooldown

      } catch (error) {
        console.error("❌ Error playing chord audio:", error)
        Alert.alert("Audio Error", "Failed to play chord audio")
        // Immediately clear cooldown on error
        setIsOnCooldown(false)
        setIsGifAnimating(false)
        if (cooldownTimeoutRef.current) {
          clearTimeout(cooldownTimeoutRef.current)
          cooldownTimeoutRef.current = null
        }
      }
    } else {
      console.warn("⚠️ No audio file available for chord:", chord.displayName)
      Alert.alert("No Audio", `No audio file available for ${chord.displayName}`)
    }
  }, [isOnCooldown])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current)
      }
      // Also stop any playing audio
      audioService.stopAudio()
    }
  }, [])

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
        <View className="flex-row items-center px-6 py-8">
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
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-6 py-8">
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


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 pt-8">
        <BackButton onPress={onBack} />
        <View className="flex-1"></View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="justify-center items-center mb-4" style={{ height: 100 }}>
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
                source={require("@/src/assets/images/sound.png")} 
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: "contain",
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
                      disabled={isOnCooldown}
                      state={selectedChord === `${chord.id}-${rowIndex}-${chordIndex}` ? "selected" : "default"}
                    />
                  </View>
                ))}
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
        <View className="px-6 mb-4 items-center gap-y-3">
          {currentLevel < 4 && (
            <ActionButton 
              title={`Level Up`} 
              icon="arrow-up" 
              onPress={handleLevelUp}
              disabled={isOnCooldown}
            />
          )}
          {currentLevel > 1 && (
            <ActionButton 
              title={`Level Down`} 
              icon="arrow-down" 
              onPress={handleLevelDown}
              disabled={isOnCooldown}
            />
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}
