"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { useAuth } from "@/src/context/AuthContext"

import { startGame, submitAnswer, clearError, clearGameResult, clearGameRound, setCurrentLevel, resetGame } from "@/src/store/slices/gameSlice"
import { audioService } from "@/src/services/audioService"
import BackButton from "@/src/components/ui/buttons/BackButton"
import StatCard from "@/src/components/widgets/StatsCard"
import PlayAgainButton from "@/src/components/ui/buttons/PlayAgainButton"
import NoteGrid from "@/src/components/widgets/NoteGrid"
import ActionButton from "@/src/components/ui/buttons/ActionButton"
import { LoginPromptModal } from "@/src/components/ui/modal/login-prompt-modal"
import { GameErrorModal } from "@/src/components/ui/modal/game-error-modal"
import { SafeAreaView } from "react-native-safe-area-context"
import MoreDetailsButton from "@/src/components/ui/buttons/MoreDetailsButton"
import { GuestStatsService, type GuestStats } from "@/src/services/guestStatsService"

interface GameGuestScreenProps {
  navigation: any
  route: any
  onBack?: () => void
  onMoreDetails?: () => void
  onSaveProgress?: () => void
}

const GameGuestScreen: React.FC<GameGuestScreenProps> = ({ navigation, route, onBack, onMoreDetails, onSaveProgress }) => {
  const dispatch = useAppDispatch()
  // Get auth data
  const { guitarId, pianoId } = useAuth()

  // Get game state from Redux
  const {
    currentGameRound,
    gameResult,
    isLoading,
    isSubmittingAnswer,
    error,
    errorCode,
    currentLevel,
    responseStartTime,
  } = useAppSelector((state) => state.game)

  const [selectedChordId, setSelectedChordId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false)
  const [showGameErrorModal, setShowGameErrorModal] = useState(false)
  // Add state to track if chords should be visible
  const [showChords, setShowChords] = useState(true)

  // Guest mode stats state
  const [guestStats, setGuestStats] = useState<GuestStats>({
    accuracy: 0,
    streak: 0,
    totalAttempts: 0,
    correctAnswers: 0,
    lastPlayedDate: "",
    wins: 0,
  })

  // Use a ref to track the ID of the round whose audio was last played
  const lastPlayedRoundIdRef = useRef<string | null>(null)
  // Use a ref to track the previous game round ID to detect actual changes
  const prevGameRoundIdRef = useRef<string | null>(null)

  // Get route params
  const routeParams = route.params as any
  const instrumentFromRoute = routeParams?.instrument
  const instrumentIdFromRoute = routeParams?.instrumentId

  // Determine instrument ID based on route params or context
  let finalInstrumentId = instrumentIdFromRoute
  if (!finalInstrumentId && instrumentFromRoute) {
    if (instrumentFromRoute === "guitar") {
      finalInstrumentId = guitarId || 'cmdh5ji090002ta0boucdg1dd' // Fallback guitar ID
    } else if (instrumentFromRoute === "piano") {
      finalInstrumentId = pianoId || 'cmdh5jjpq0003ta0bpxoplgsi' // Fallback piano ID
    }
  }

  // Load guest stats on component mount
  useEffect(() => {
    const loadGuestStats = async () => {
      const stats = await GuestStatsService.getGameModeStats("regularGame")
      setGuestStats(stats)
      console.log("📊 GameGuestScreen: Loaded guest stats:", stats)
    }
    loadGuestStats()
  }, [])

  // Initialize game only once when component mounts
  useEffect(() => {
    console.log("🎮 GameGuestScreen: Component mounted, initializing...")
    // Clear any previous game state and stop audio when entering game screen fresh
    dispatch(clearGameRound())
    dispatch(resetGame()) // Clear all game data for fresh start
    audioService.stopAudio()
    
    // Reset audio tracking refs to ensure fresh start
    lastPlayedRoundIdRef.current = null
    prevGameRoundIdRef.current = null
    
    return () => {
      audioService.stopAudio()
    }
  }, [dispatch]) // Only run once on mount

  // Separate effect to start game when instrumentId or level changes
  useEffect(() => {
    // Don't start game if no instrumentId
    if (!finalInstrumentId) {
      console.error("❌ GameGuestScreen: Missing required instrumentId:", {
        instrumentId: finalInstrumentId,
      })
      setShowGameErrorModal(true)
      return
    }

    // Check if trying to access level 3 or 4 (login required)
    if (currentLevel >= 3) {
      setShowLoginPromptModal(true)
      return
    }

    console.log("🎮 GameGuestScreen: Starting game with:", {
      instrumentId: finalInstrumentId,
      instrument: instrumentFromRoute,
      level: currentLevel,
      isGuestMode: true,
    })
    
    dispatch(
      startGame({
        userId: null, // Guest mode - no userId
        instrumentId: finalInstrumentId,
        level: currentLevel,
      }),
    )
  }, [dispatch, finalInstrumentId, currentLevel, instrumentFromRoute])

  // Component unmount cleanup effect
  useEffect(() => {
    return () => {
      console.log("🧹 GameGuestScreen: Component unmounting - clearing session")
      dispatch(clearGameRound())
      audioService.stopAudio()
    }
  }, [])

  // Effect to reset UI states for a new round and play audio
  useEffect(() => {
    const currentRoundId = currentGameRound?.gameRoundId || null
    const prevRoundId = prevGameRoundIdRef.current

    if (currentGameRound) {
      // Reset UI states for a new round
      setShowChords(true)
      setShowResult(false)
      setSelectedChordId(null)
      
      // Auto-play audio for new rounds (but not on initial render with same round)
      if (currentRoundId && currentRoundId !== prevRoundId && currentGameRound.targetChord?.name && currentGameRound.instrument?.name) {
        console.log("🎵 GameGuestScreen: Auto-playing chord audio for new round:", currentRoundId)
        console.log("🎵 GameGuestScreen: Playing chord:", currentGameRound.targetChord.name, "instrument:", currentGameRound.instrument.name)
        playChordAudioSafely(currentGameRound.targetChord.name, currentGameRound.instrument.name)
      }
    }

    // Always update prevGameRoundIdRef to the current round ID for the next render cycle
    prevGameRoundIdRef.current = currentRoundId
    return () => {
      audioService.stopAudio()
    }
  }, [currentGameRound])

  // Handle game result and update guest stats
  useEffect(() => {
    if (gameResult) {
      setShowResult(true)
      setShowChords(false) // Hide chords after submitting answer
      
      // Update guest stats
      const updateStats = async () => {
        const isCorrect = gameResult.isCorrect
        const isWin = gameResult.isCorrect // In regular game, correct answer = win
        
        const updatedStats = await GuestStatsService.updateGameStats("regularGame", isCorrect, isWin)
        setGuestStats(updatedStats)
        
        console.log("🎯 GameGuestScreen: Game result with updated guest stats:", {
          isCorrect,
          isWin,
          updatedStats,
        })
      }
      
      updateStats()
    }
    return () => {
      audioService.stopAudio()
    }
  }, [gameResult])

  // Handle errors with appropriate modals
  useEffect(() => {
    if (error && errorCode) {
      console.log("🔴 GameGuestScreen: Handling error:", { error, errorCode })
      if (errorCode === "SUBSCRIPTION_REQUIRED") {
        setShowLoginPromptModal(true)
      } else {
        setShowGameErrorModal(true)
      }
    } else if (error && !errorCode) {
      setShowGameErrorModal(true)
    }
    return () => {
      audioService.stopAudio()
    }
  }, [error, errorCode])

  const playChordAudioSafely = async (chordName: string, instrumentName: string) => {
    try {
      setAudioError(null)
      await audioService.playChordAudio(chordName, instrumentName)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown audio error"
      console.error("❌ GameGuestScreen: Chord audio playback failed:", errorMessage)
      setAudioError(errorMessage)
    }
  }

  const handlePlayAgain = async () => {
    if (showChords && currentGameRound?.targetChord?.name && currentGameRound.instrument?.name) {
      // If chords are visible, just replay the chord audio
      console.log("🔄 GameGuestScreen: Replaying chord audio for current round")
      console.log("🔄 GameGuestScreen: Playing chord:", currentGameRound.targetChord.name, "instrument:", currentGameRound.instrument.name)
      await playChordAudioSafely(currentGameRound.targetChord.name, currentGameRound.instrument.name)
    } else if (!showChords && finalInstrumentId) {
      // If chords are hidden (after submitting answer), start a new game round
      console.log("🔄 GameGuestScreen: Starting new game round (guest mode)")
      dispatch(clearGameResult())
      dispatch(
        startGame({
          userId: null, // Guest mode
          instrumentId: finalInstrumentId,
          level: currentLevel,
        }),
      )
    }
  }

  const handleChordSelect = (chordId: string) => {
    if (isSubmittingAnswer || !currentGameRound) return
    setSelectedChordId(chordId)
    // Calculate response time
    const responseTime = responseStartTime ? Date.now() - responseStartTime : 0
    console.log("🎯 GameGuestScreen: Submitting answer:", {
      chordId,
      responseTime,
      gameRoundId: currentGameRound.gameRoundId,
      isGuestMode: true,
    })
    // Submit answer for guest mode
    dispatch(
      submitAnswer({
        userId: null, // Guest mode
        gameRoundId: currentGameRound.gameRoundId,
        selectedChordId: chordId,
        responseTimeMs: responseTime,
      }),
    )
  }

  const handleLevelDown = () => {
    if (currentLevel > 1 && finalInstrumentId) {
      const newLevel = currentLevel - 1
      console.log("📉 GameGuestScreen: Level down to:", newLevel)
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
      dispatch(
        startGame({
          userId: null, // Guest mode
          instrumentId: finalInstrumentId,
          level: newLevel,
        }),
      )
    }
  }

  const handleLevelUp = () => {
    // Check if trying to access level 3 or 4 (login required)
    if (currentLevel >= 2) {
      setShowLoginPromptModal(true)
      return
    }

    if (currentLevel < 4 && finalInstrumentId) {
      const newLevel = currentLevel + 1
      console.log("📈 GameGuestScreen: Level up to:", newLevel)
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
      dispatch(
        startGame({
          userId: null, // Guest mode
          instrumentId: finalInstrumentId,
          level: newLevel,
        }),
      )
    }
  }

  const handleMoreDetails = () => {
    console.log("🔍 GameGuestScreen: More Details pressed (guest mode)")
    onMoreDetails?.()
    navigation.navigate("Menu" as never, {
      accuracy: guestStats.accuracy.toFixed(1) + "%",
      level: currentLevel,
      streaks: guestStats.streak,
      selectedNote: selectedChordId,
      gameResult: gameResult?.isCorrect ? "correct" : "incorrect",
      isGuestMode: true,
    })
  }

  const handleSaveProgress = () => {
    console.log("💾 GameGuestScreen: Save Progress pressed")
    onSaveProgress?.()
    navigation.navigate("Register" as never)
  }

  const handleLoginPrompt = () => {
    setShowLoginPromptModal(false)
    dispatch(clearError())
    console.log("🔐 GameGuestScreen: Navigating to login screen")
    navigation.navigate("Login" as never)
  }

  const handleLoginPromptCancel = () => {
    setShowLoginPromptModal(false)
    dispatch(clearError())
    if (currentLevel > 1) {
      const previousLevel = currentLevel - 1
      dispatch(setCurrentLevel(previousLevel))
      console.log("📉 GameGuestScreen: Returning to level:", previousLevel)
    }
  }

  const handleGameErrorClose = () => {
    setShowGameErrorModal(false)
    dispatch(clearError())
  }

  const handleGameErrorRetry = () => {
    setShowGameErrorModal(false)
    dispatch(clearError())
    if (finalInstrumentId) {
      dispatch(
        startGame({
          userId: null, // Guest mode
          instrumentId: finalInstrumentId,
          level: currentLevel,
        }),
      )
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-6 py-4">
          <BackButton onPress={onBack} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#003049" />
          <Text className="mt-4 text-[#003049] text-lg">Loading game...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Error state
  if (!currentGameRound && !error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-6 py-4">
          <BackButton onPress={onBack} />
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-[#003049] text-lg text-center mb-4">Unable to load game. Please try again.</Text>
          <ActionButton title="Retry" onPress={handleGameErrorRetry} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-6 py-4">
        <BackButton onPress={onBack} />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Audio Error Warning (if any) */}
        {audioError && (
          <View className="mx-6 mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <Text className="text-yellow-800 text-sm">⚠️ Audio playback issue: {audioError}</Text>
          </View>
        )}
        <View className="bg-[#E5EAED80] rounded-3xl m-4">
          {/* Stats Row - Using guest mode stats */}
          <View className="flex-row justify-center mb-6 gap-x-2">
            <StatCard value={Math.round(guestStats.accuracy) + "%"} label="Accuracy" size="large" />
            <StatCard value={currentLevel.toString()} label="Level" size="large" valueColor="dark" />
            <StatCard value={guestStats.streak.toString()} label="Streaks" size="large" />
            <StatCard
              value="" // Not used when showFraction is true
              label="Correct/Total"
              size="large"
              showFraction={true}
              numerator={guestStats.wins || 0}
              denominator={guestStats.totalAttempts || 0}
            />
          </View>
          {/* Play Again Button */}
          {currentGameRound && (
            <View className="px-6 mb-6">
              <PlayAgainButton onPress={handlePlayAgain} />
            </View>
          )}
        </View>
        {/* Game Result Feedback */}
        {showResult && gameResult && (
          <View className="px-6 mb-6">
            <Text
              className={`text-xl font-bold text-center mb-2 ${
                gameResult.isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {gameResult.isCorrect
                ? "Correct!"
                : `Sorry, that was ${gameResult.correctChord?.displayName}. Try Again!`}
            </Text>
          </View>
        )}
        {/* Note Grid with chord options - Only show when showChords is true */}
        {currentGameRound && showChords && (
          <NoteGrid
            chordOptions={currentGameRound.chordOptions}
            selectedChordId={selectedChordId}
            onChordPress={handleChordSelect}
            disabled={isSubmittingAnswer}
            showResult={showResult}
            correctChordId={gameResult?.correctChord?.id || undefined}
            selectedChordStyle={{ borderColor: 'black', borderWidth: 2 }}
          />
        )}
        {/* Level Control Buttons */}
        <View className="px-6 mb-4 items-center gap-y-3">
          {currentLevel > 1 && (
            <ActionButton
              title="Level Down"
              icon="arrow-down"
              onPress={handleLevelDown}
            />
          )}
          {currentLevel < 4 && (
            <ActionButton
              title="Level Up"
              icon="arrow-up"
              onPress={handleLevelUp}
            />
          )}
        </View>
        {/* Extra space to ensure content doesn't get hidden behind fixed button */}
        <View className="h-20" />
      </ScrollView>
      {/* Fixed More Details Button at bottom */}
      <View className="px-6 pb-8 pt-4 justify-center items-center">
        <MoreDetailsButton onPress={handleMoreDetails} />
        {/* Save Progress Button for guest users */}
        <View className="pt-4">
          <Text className="text-black text-lg font-semibold text-center" onPress={handleSaveProgress}>
            Save your progress
          </Text>
        </View>
      </View>
      {/* Login Required Modal */}
      <LoginPromptModal
        visible={showLoginPromptModal}
        message="Level 3 and above require an account. Please login or register to unlock all levels and features!"
        onLogin={handleLoginPrompt}
        onCancel={handleLoginPromptCancel}
      />
      {/* Game Error Modal */}
      <GameErrorModal
        visible={showGameErrorModal}
        title={errorCode === "NETWORK_ERROR" ? "Connection Error" : "Game Error"}
        message={error || "An unexpected error occurred. Please try again."}
        errorCode={errorCode || undefined}
        onRetry={handleGameErrorRetry}
        onClose={handleGameErrorClose}
        showRetry={errorCode === "NETWORK_ERROR" || !errorCode}
      />
    </SafeAreaView>
  )
}

export default GameGuestScreen