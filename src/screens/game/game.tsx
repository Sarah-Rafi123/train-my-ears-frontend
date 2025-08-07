"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { useAuth } from "@/src/context/AuthContext"

import { startGame, submitAnswer, clearError, clearGameResult, setCurrentLevel } from "@/src/store/slices/gameSlice"
import { audioService } from "@/src/services/audioService"
import BackButton from "@/src/components/ui/buttons/BackButton"
import StatCard from "@/src/components/widgets/StatsCard"
import PlayAgainButton from "@/src/components/ui/buttons/PlayAgainButton"
import NoteGrid from "@/src/components/widgets/NoteGrid"
import ActionButton from "@/src/components/ui/buttons/ActionButton"
import { SubscriptionModal } from "@/src/components/ui/modal/subscription-modal"
import { GameErrorModal } from "@/src/components/ui/modal/game-error-modal"
import { SafeAreaView } from "react-native-safe-area-context"
import MoreDetailsButton from "@/src/components/ui/buttons/MoreDetailsButton"

interface GameScreenProps {
  navigation: any
  route: any
  onBack?: () => void
  onMoreDetails?: () => void
  onSaveProgress?: () => void
}

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route, onBack, onMoreDetails, onSaveProgress }) => {
  const dispatch = useAppDispatch()
  // Get auth data
  const { userId, guitarId, pianoId } = useAuth()
// Get current token
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
    currentStats,
  } = useAppSelector((state) => state.game)

  const [selectedChordId, setSelectedChordId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showGameErrorModal, setShowGameErrorModal] = useState(false)
  // Add state to track if chords should be visible
  const [showChords, setShowChords] = useState(true)

  // Use a ref to track the ID of the round whose audio was last played
  const lastPlayedRoundIdRef = useRef<string | null>(null)
  // Use a ref to track the previous game round ID to detect actual changes
  const prevGameRoundIdRef = useRef<string | null>(null)

  // NEW STATE: To signal when UI is ready for a specific game round
  const [uiReadyForRoundId, setUiReadyForRoundId] = useState<string | null>(null)

  // Get route params
  const routeParams = route.params as any
  const instrumentFromRoute = routeParams?.instrument
  const instrumentIdFromRoute = routeParams?.instrumentId
  const userIdFromRoute = routeParams?.userId

  // Determine instrument ID based on route params or context
  let finalInstrumentId = instrumentIdFromRoute
  if (!finalInstrumentId && instrumentFromRoute) {
    if (instrumentFromRoute === "guitar") {
      finalInstrumentId = guitarId
    } else if (instrumentFromRoute === "piano") {
      finalInstrumentId = pianoId
    }
  }

  // Use IDs from route params or context (userId can be null for guest mode)
  const finalUserId = userIdFromRoute || userId || null

  // Initialize game when component mounts
  useEffect(() => {
    // Check if user is in guest mode (no token and no userId) and trying to access level 3 or 4
    if ( !finalUserId && currentLevel >= 3) {
      setShowSubscriptionModal(true)
      return
    }

    console.log("🎮 GameScreen: Initializing game with:", {
      userId: finalUserId,
      instrumentId: finalInstrumentId,
      instrument: instrumentFromRoute,
      level: currentLevel,
      isGuestMode: !finalUserId,
    })
    if (finalInstrumentId) {
      dispatch(
        startGame({
          userId: finalUserId, // Can be null for guest mode
          instrumentId: finalInstrumentId,
          level: currentLevel,
        }),
      )
    } else {
      console.error("❌ GameScreen: Missing required instrumentId:", {
        userId: finalUserId,
        instrumentId: finalInstrumentId,
      })
      setShowGameErrorModal(true)
    }
    return () => {
      audioService.stopAudio(); // Ensure the audio stops
    };
  }, [dispatch, finalUserId, finalInstrumentId, currentLevel]) // Add token to dependencies

  // Effect to reset UI states and signal UI readiness for a new round
  useEffect(() => {
    const currentRoundId = currentGameRound?.gameRoundId || null

    if (currentGameRound) {
      // Reset UI states for a new round
      setShowChords(true)
      setShowResult(false)
      setSelectedChordId(null)
      // Signal that UI is ready for this specific round
      setUiReadyForRoundId(currentRoundId)
    } else {
      // If currentGameRound becomes null (e.g., during loading or error), reset UI readiness
      setUiReadyForRoundId(null)
    }

    // Always update prevGameRoundIdRef to the current round ID for the next render cycle
    prevGameRoundIdRef.current = currentRoundId
    return () => {
      audioService.stopAudio(); // Ensure the audio stops
    };
  }, [currentGameRound]) // Only depend on currentGameRound

  // Play audio when game round loads AND UI is ready, ensuring it plays only once per round
  useEffect(() => {
    const currentRoundId = currentGameRound?.gameRoundId || null

    // Only play audio if:
    // 1. currentGameRound is defined and has an audio URL
    // 2. The current round ID matches the UI ready ID
    // 3. The current round ID has not been played yet (prevents re-playing same ID)
    if (
      currentGameRound?.targetChord?.audioFileUrl &&
      currentRoundId &&
      currentRoundId === uiReadyForRoundId && // Ensure UI is ready for this round
      currentRoundId !== lastPlayedRoundIdRef.current // Ensure this specific round's audio hasn't been played
    ) {
      playAudioSafely(currentGameRound.targetChord.audioFileUrl)
      lastPlayedRoundIdRef.current = currentRoundId // Mark this round's audio as played
    }
    return () => {
      audioService.stopAudio(); // Ensure the audio stops
    };
  }, [currentGameRound, uiReadyForRoundId]) // Depend on both currentGameRound and uiReadyForRoundId

  // Handle game result
  useEffect(() => {
    if (gameResult) {
      setShowResult(true)
      // Hide chords after submitting answer
      setShowChords(false)
      // Log the updated stats when we get a result
      console.log("🎯 Game result received with stats:", {
        isCorrect: gameResult.isCorrect,
        streak: gameResult.stats.streak,
        accuracy: gameResult.stats.accuracy,
        totalAttempts: gameResult.stats.totalAttempts,
        correctAnswers: gameResult.stats.correctAnswers,
        isGuestMode: !finalUserId,
      })
    }
    return () => {
      audioService.stopAudio(); // Ensure the audio stops
    };
  }, [gameResult])

  // In your GameScreen, add this useEffect to debug:
  useEffect(() => {
    console.log("🔍 Current stats in GameScreen:", {
      streak: currentStats.streak,
      accuracy: currentStats.accuracy,
      totalAttempts: currentStats.totalAttempts,
      correctAnswers: currentStats.correctAnswers,
      isGuestMode: !finalUserId,
    })
    return () => {
      audioService.stopAudio(); // Ensure the audio stops
    };
  }, [currentStats])

  // Handle errors with appropriate modals
  useEffect(() => {
    if (error && errorCode) {
      console.log("🔴 GameScreen: Handling error:", { error, errorCode })
      if (errorCode === "SUBSCRIPTION_REQUIRED") {
        setShowSubscriptionModal(true)
      } else {
        setShowGameErrorModal(true)
      }
    } else if (error && !errorCode) {
      // Generic error without code
      setShowGameErrorModal(true)
    }
    return () => {
      audioService.stopAudio(); // Ensure the audio stops
    };
  }, [error, errorCode])

  const playAudioSafely = async (audioUrl: string) => {
    try {
      setAudioError(null)
      // The audioService.playAudio now handles stopping previous sounds internally
      await audioService.playAudio(audioUrl)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown audio error"
      console.error("❌ GameScreen: Audio playback failed:", errorMessage)
      setAudioError(errorMessage)
    }
  }

  const handlePlayAgain = async () => {
    if (showChords && currentGameRound?.targetChord?.audioFileUrl) {
      // If chords are visible, just replay the audio
      console.log("🔄 GameScreen: Replaying audio for current round")
      await playAudioSafely(currentGameRound.targetChord.audioFileUrl)
    } else if (!showChords && finalInstrumentId) {
      // If chords are hidden (after submitting answer), start a new game round
      console.log("🔄 GameScreen: Starting new game round", {
        isGuestMode: !finalUserId,
      })
      dispatch(clearGameResult())
      // No need to manually reset UI states here, the useEffect for currentGameRound will handle it
      // No need to manually reset uiReadyForRoundId, it will be set by the useEffect
      dispatch(
        startGame({
          userId: finalUserId, // Can be null for guest mode
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
    console.log("🎯 GameScreen: Submitting answer:", {
      chordId,
      responseTime,
      gameRoundId: currentGameRound.gameRoundId,
      isGuestMode: !finalUserId,
    })
    // Submit answer (works for both authenticated users and guests)
    dispatch(
      submitAnswer({
        userId: finalUserId, // Can be null for guest mode
        gameRoundId: currentGameRound.gameRoundId,
        selectedChordId: chordId,
        responseTimeMs: responseTime,
      }),
    )
  }

  const handleLevelDown = () => {
    if (currentLevel > 1 && finalInstrumentId) {
      const newLevel = currentLevel - 1
      console.log("📉 GameScreen: Level down to:", newLevel, {
        isGuestMode: !finalUserId,
      })
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
      // No need to manually reset UI states here, the useEffect for currentGameRound will handle it
      // No need to manually reset uiReadyForRoundId, it will be set by the useEffect
      dispatch(
        startGame({
          userId: finalUserId, // Can be null for guest mode
          instrumentId: finalInstrumentId,
          level: newLevel,
        }),
      )
    }
  }

  const handleLevelUp = () => {
    // Check if user is in guest mode (no token and no userId) and trying to access level 3 or 4
    if ( !finalUserId && currentLevel >= 2) {
      setShowSubscriptionModal(true)
      return
    }

    if (currentLevel < 4 && finalInstrumentId) {
      const newLevel = currentLevel + 1
      console.log("📈 GameScreen: Level up to:", newLevel, {
        isGuestMode: !finalUserId,
      })
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
      // No need to manually reset UI states here, the useEffect for currentGameRound will handle it
      // No need to manually reset uiReadyForRoundId, it will be set by the useEffect
      dispatch(
        startGame({
          userId: finalUserId, // Can be null for guest mode
          instrumentId: finalInstrumentId,
          level: newLevel,
        }),
      )
    }
  }

  const handleMoreDetails = () => {
    console.log("🔍 GameScreen: More Details pressed", {
      isGuestMode: !finalUserId,
    })
    onMoreDetails?.()
    navigation.navigate("Menu" as never, {
      accuracy: currentStats.accuracy.toFixed(1) + "%",
      level: currentLevel,
      streaks: currentStats.streak,
      selectedNote: selectedChordId,
      gameResult: gameResult?.isCorrect ? "correct" : "incorrect",
      isGuestMode: !finalUserId,
    })
  }

  const handleSaveProgress = () => {
    console.log("💾 GameScreen: Save Progress pressed")
    onSaveProgress?.()
    navigation.navigate("Register" as never)
  }

  const handleSubscriptionUpgrade = () => {
    setShowSubscriptionModal(false)
    dispatch(clearError())
    console.log("💳 GameScreen: Navigating to subscription screen")
    navigation.navigate("Subscription" as never)
  }

  const handleSubscriptionCancel = () => {
    setShowSubscriptionModal(false)
    dispatch(clearError())
    if (currentLevel > 1) {
      const previousLevel = currentLevel - 1
      dispatch(setCurrentLevel(previousLevel))
      console.log("📉 GameScreen: Returning to level:", previousLevel)
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
          userId: finalUserId, // Can be null for guest mode
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
          {/* Stats Row - Now using real-time stats from API */}
          <View className="flex-row justify-center mb-6 gap-x-2">
            <StatCard value={Math.round(currentStats.accuracy) + "%"} label="Accuracy" size="large" />
            <StatCard value={currentLevel.toString()} label="Level" size="large" valueColor="dark" />
            <StatCard value={currentStats.streak.toString()} label="Streaks" size="large" />
            <StatCard
              value="" // Not used when showFraction is true
              label="Wins / Attempts"
              size="large"
              showFraction={true}
              numerator={currentStats.correctAnswers || 0}
              denominator={currentStats.totalAttempts || 0}
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
            correctChordId={gameResult?.correctChord?.id || null}
            selectedChordStyle={{ borderColor: 'black', borderWidth: 2 }} // Added this prop
          />
        )}
        {/* Level Control Buttons */}
        <View className="px-6 mb-4 items-center gap-y-3">
          {currentLevel > 1 && (
            <ActionButton
              title="Level Down"
              icon="arrow-down"
              onPress={handleLevelDown}
              disabled={isLoading || isSubmittingAnswer}
            />
          )}
          {currentLevel < 4 && (
            <ActionButton
              title="Level Up"
              icon="arrow-up"
              onPress={handleLevelUp}
              disabled={isLoading || isSubmittingAnswer}
            />
          )}
        </View>
        {/* Extra space to ensure content doesn't get hidden behind fixed button */}
        <View className="h-20" />
      </ScrollView>
      {/* Fixed More Details Button at bottom */}
      <View className="px-6 pb-8 pt-4 justify-center items-center">
        <MoreDetailsButton onPress={handleMoreDetails} />
        {/* Only show Save Progress for logged-in users */}
        {!finalUserId && (
          <View className="pt-4">
            <Text className="text-black text-lg font-semibold text-center" onPress={handleSaveProgress}>
              Save your progress
            </Text>
          </View>
        )}
      </View>
      {/* Subscription Required Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        message={
          error || "Level 3 and above require an account. Sign up or subscribe to unlock all levels and features!"
        }
        onUpgrade={handleSubscriptionUpgrade}
        onCancel={handleSubscriptionCancel}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: "center",
  },
  detailsButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
})

export default GameScreen