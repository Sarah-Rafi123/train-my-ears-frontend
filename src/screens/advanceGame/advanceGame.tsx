"use client"

import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { useAuth } from "@/src/context/AuthContext"
import {
  startAdvancedGame,
  submitSequence,
  clearError,
  clearGameResult,
  setCurrentLevel,
  addToSequence,
  removeFromSequence,
  clearSequence,
} from "@/src/store/slices/advancedGameSlice"
import { audioService } from "@/src/services/audioService"
import BackButton from "@/src/components/ui/buttons/BackButton"

import CircularIndicator from "@/src/components/widgets/CircularIndicator"
import ActionButton from "@/src/components/ui/buttons/ActionButton"
import MoreDetailsButton from "@/src/components/ui/buttons/MoreDetailsButton"
import SaveProgressButton from "@/src/components/ui/buttons/SaveProgressButton"
import { SubscriptionModal } from "@/src/components/ui/modal/subscription-modal"
import { GameErrorModal } from "@/src/components/ui/modal/game-error-modal"
import { SafeAreaView } from "react-native-safe-area-context"
import { TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import StatCard from "@/src/components/widgets/StatsCard"

interface AdvancedGameScreenProps {
  onBack?: () => void
  onMoreDetails?: () => void
  onSaveProgress?: () => void
}

export default function AdvancedGameScreen({ onBack, onMoreDetails, onSaveProgress }: AdvancedGameScreenProps) {
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useAppDispatch()

  // Get auth data
  const { userId, guitarId, pianoId } = useAuth()

  // Get advanced game state from Redux
  const {
    currentGameRound,
    gameResult,
    isLoading,
    isSubmittingSequence,
    error,
    errorCode,
    currentLevel,
    responseStartTime,
    currentStats,
    selectedSequence,
  } = useAppSelector((state) => state.advancedGame)

  const [showResult, setShowResult] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showGameErrorModal, setShowGameErrorModal] = useState(false)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)

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
      console.log("🎸 AdvancedGameScreen: Using guitar ID from context:", guitarId)
    } else if (instrumentFromRoute === "piano") {
      finalInstrumentId = pianoId
      console.log("🎹 AdvancedGameScreen: Using piano ID from context:", pianoId)
    }
  }

  // If still no instrument ID, try to get it from the stored instrument IDs
  if (!finalInstrumentId) {
    console.log("🔍 AdvancedGameScreen: No instrument ID found, checking stored IDs...")

    // Use guitar as default if no specific instrument is specified
    if (guitarId) {
      finalInstrumentId = guitarId
      console.log("🎸 AdvancedGameScreen: Using default guitar ID:", guitarId)
    } else if (pianoId) {
      finalInstrumentId = pianoId
      console.log("🎹 AdvancedGameScreen: Using default piano ID:", pianoId)
    }
  }

  // Use IDs from route params or context
  const finalUserId = userIdFromRoute || userId

  // Log the final IDs being used
  console.log("🎮 AdvancedGameScreen: Final IDs determined:", {
    userId: finalUserId,
    instrumentId: finalInstrumentId,
    instrument: instrumentFromRoute,
    guitarIdFromContext: guitarId,
    pianoIdFromContext: pianoId,
  })

  // Initialize game when component mounts
  useEffect(() => {
    console.log("🎮 AdvancedGameScreen: Initializing game with:", {
      userId: finalUserId,
      instrumentId: finalInstrumentId,
      instrument: instrumentFromRoute,
      level: currentLevel,
    })

    if (finalUserId && finalInstrumentId) {
      dispatch(
        startAdvancedGame({
          userId: finalUserId,
          instrumentId: finalInstrumentId,
          level: currentLevel,
        }),
      )
    } else {
      console.error("❌ AdvancedGameScreen: Missing required data:", {
        userId: finalUserId,
        instrumentId: finalInstrumentId,
        guitarId,
        pianoId,
        instrumentFromRoute,
      })

      // Show more specific error message
      const missingItems = []
      if (!finalUserId) missingItems.push("User ID")
      if (!finalInstrumentId) missingItems.push("Instrument ID")

      console.error(`❌ Missing: ${missingItems.join(", ")}`)
      setShowGameErrorModal(true)
    }
  }, [dispatch, finalUserId, finalInstrumentId, currentLevel, guitarId, pianoId, currentGameRound?.sequenceLength])

  // Auto-submit sequence when complete
  useEffect(() => {
    if (
      currentGameRound &&
      finalUserId &&
      selectedSequence.length === currentGameRound.sequenceLength &&
      !isSubmittingSequence &&
      !showResult
    ) {
      // Add a small delay to make the auto-submission feel more natural
      const timer = setTimeout(() => {
        handleSubmitSequence()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [selectedSequence.length, currentGameRound?.sequenceLength, isSubmittingSequence, showResult])

  // Handle game result
  useEffect(() => {
    if (gameResult) {
      setShowResult(true)

      // Log the updated stats when we get a result
      console.log("🎯 Advanced game result received with stats:", {
        isCorrect: gameResult.isCorrect,
        streak: gameResult.stats.streak,
        accuracy: gameResult.stats.accuracy,
        totalAttempts: gameResult.stats.totalAttempts,
        correctAnswers: gameResult.stats.correctAnswers,
      })
    }
  }, [gameResult])

  // Handle errors with appropriate modals
  useEffect(() => {
    if (error && errorCode) {
      console.log("🔴 AdvancedGameScreen: Handling error:", { error, errorCode })

      if (errorCode === "SUBSCRIPTION_REQUIRED") {
        setShowSubscriptionModal(true)
      } else {
        setShowGameErrorModal(true)
      }
    } else if (error && !errorCode) {
      // Generic error without code
      setShowGameErrorModal(true)
    }
  }, [error, errorCode])

  const playSequenceAudio = async () => {
    if (!currentGameRound?.sequenceAudioUrls || isPlayingSequence) return

    try {
      setIsPlayingSequence(true)
      setAudioError(null)
      console.log("🎵 AdvancedGameScreen: Playing sequence audio...")

      for (let i = 0; i < currentGameRound.sequenceAudioUrls.length; i++) {
        const audioUrl = currentGameRound.sequenceAudioUrls[i]
        console.log(`🎵 Playing audio ${i + 1}/${currentGameRound.sequenceAudioUrls.length}:`, audioUrl)

        await audioService.playAudio(audioUrl)

        // Wait a bit between audio files
        if (i < currentGameRound.sequenceAudioUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      console.log("✅ AdvancedGameScreen: Sequence audio playback completed")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown audio error"
      console.error("❌ AdvancedGameScreen: Audio playback failed:", errorMessage)
      setAudioError(errorMessage)
    } finally {
      setIsPlayingSequence(false)
    }
  }

  const handlePlayAgain = async () => {
    await playSequenceAudio()
  }

  const handleChordSelect = (chordId: string) => {
    if (isSubmittingSequence || !currentGameRound || showResult) return

    // Add chord to sequence if not full
    if (selectedSequence.length < currentGameRound.sequenceLength) {
      dispatch(addToSequence(chordId))
    }
  }

  const handleSequenceItemRemove = (index: number) => {
    if (showResult) return
    dispatch(removeFromSequence(index))
  }

  const handleSubmitSequence = () => {
    if (
      !currentGameRound ||
      !finalUserId ||
      selectedSequence.length !== currentGameRound.sequenceLength ||
      isSubmittingSequence
    ) {
      return
    }

    // Calculate response time
    const responseTime = responseStartTime ? Date.now() - responseStartTime : 0

    console.log("🎯 AdvancedGameScreen: Auto-submitting sequence:", {
      sequence: selectedSequence,
      responseTime,
      gameSessionId: currentGameRound.gameSessionId,
    })

    // Submit sequence
    dispatch(
      submitSequence({
        userId: finalUserId,
        gameSessionId: currentGameRound.gameSessionId,
        submittedSequence: selectedSequence,
        responseTimeMs: responseTime,
      }),
    )
  }

  const handleLevelDown = () => {
    if (currentLevel > 1 && finalUserId && finalInstrumentId) {
      const newLevel = currentLevel - 1
      console.log("📉 AdvancedGameScreen: Level down to:", newLevel)
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
      dispatch(clearSequence())
      setShowResult(false)

      dispatch(
        startAdvancedGame({
          userId: finalUserId,
          instrumentId: finalInstrumentId,
          level: newLevel,
        }),
      )
    }
  }

  const handleLevelUp = () => {
    if (currentLevel < 4 && finalUserId && finalInstrumentId) {
      const newLevel = currentLevel + 1
      console.log("📈 AdvancedGameScreen: Level up to:", newLevel)
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
      dispatch(clearSequence())
      setShowResult(false)

      dispatch(
        startAdvancedGame({
          userId: finalUserId,
          instrumentId: finalInstrumentId,
          level: newLevel,
        }),
      )
    }
  }

  const handleMoreDetails = () => {
    console.log("🔍 AdvancedGameScreen: More Details pressed")
    onMoreDetails?.()
    navigation.navigate("Menu" as never, {
      accuracy: currentStats.accuracy.toFixed(1) + "%",
      level: currentLevel,
      streaks: currentStats.streak,
      gameType: "advanced",
      gameResult: gameResult?.isCorrect ? "correct" : "incorrect",
    })
  }

  const handleSaveProgress = () => {
    console.log("💾 AdvancedGameScreen: Save Progress pressed")
    onSaveProgress?.()
    navigation.navigate("Register" as never)
  }

  const handleSubscriptionUpgrade = () => {
    setShowSubscriptionModal(false)
    dispatch(clearError())
    console.log("💳 AdvancedGameScreen: Navigating to subscription screen")
    navigation.navigate("Subscription" as never)
  }

  const handleSubscriptionCancel = () => {
    setShowSubscriptionModal(false)
    dispatch(clearError())

    if (currentLevel > 1) {
      const previousLevel = currentLevel - 1
      dispatch(setCurrentLevel(previousLevel))
      console.log("📉 AdvancedGameScreen: Returning to level:", previousLevel)
    }
  }

  const handleGameErrorClose = () => {
    setShowGameErrorModal(false)
    dispatch(clearError())
  }

  const handleGameErrorRetry = () => {
    setShowGameErrorModal(false)
    dispatch(clearError())

    if (finalUserId && finalInstrumentId) {
      dispatch(
        startAdvancedGame({
          userId: finalUserId,
          instrumentId: finalInstrumentId,
          level: currentLevel,
        }),
      )
    }
  }

  // Get sequence indicators based on current selection and result
  const getSequenceIndicators = (): ("success" | "error" | "empty")[] => {
    if (!currentGameRound) return []

    const indicators: ("success" | "error" | "empty")[] = []

    for (let i = 0; i < currentGameRound.sequenceLength; i++) {
      if (showResult && gameResult) {
        // Show result indicators
        const comparison = gameResult.sequenceComparison.find((comp) => comp.position === i + 1)
        if (comparison) {
          indicators.push(comparison.correct ? "success" : "error")
        } else {
          indicators.push("empty")
        }
      } else {
        // Show selection indicators
        indicators.push(i < selectedSequence.length ? "success" : "empty")
      }
    }

    return indicators
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
          <Text className="mt-4 text-[#003049] text-lg">Loading advanced game...</Text>
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
          <Text className="text-[#003049] text-lg text-center mb-4">
            Unable to load advanced game. Please try again.
          </Text>
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
          <View className="flex-row justify-center px-6 mb-8 gap-x-6">
            <StatCard value={currentStats.accuracy.toFixed(1) + "%"} label="Accuracy" size="large" valueColor="red" />
            <StatCard value={currentLevel.toString()} label="Level" size="large" />
            <StatCard value={currentStats.streak.toString()} label="Streaks" size="large" />
          </View>
        </View>

        {/* Play Again Button */}
        {currentGameRound && (
          <View className="px-6 mb-8">
            <TouchableOpacity
              onPress={handlePlayAgain}
              disabled={isPlayingSequence}
              className="bg-[#1e3a5f] rounded-2xl py-4 px-6 flex-row justify-center items-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Play Sequence Again"
            >
              {isPlayingSequence ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Feather name="refresh-cw" size={20} color="white" />
              )}
              <Text className="text-white text-lg font-semibold ml-3">
                {isPlayingSequence ? "Playing..." : "Play Again"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sequence Indicators */}
        {currentGameRound && (
          <View className="flex-row justify-center gap-x-4 mb-8">
            {getSequenceIndicators().map((type, index) => (
              <CircularIndicator key={index} type={type} size={50} />
            ))}
          </View>
        )}

        {/* Auto-submit status indicator */}
        {currentGameRound &&
          selectedSequence.length === currentGameRound.sequenceLength &&
          isSubmittingSequence &&
          !showResult && (
            <View className="px-6 mb-6">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#1e3a5f" />
                <Text className="text-[#1e3a5f] text-lg font-semibold ml-3">Auto-submitting sequence...</Text>
              </View>
            </View>
          )}

        {/* Game Result Feedback */}
        {showResult && gameResult && (
          <View className="px-6 mb-6">
            <Text
              className={`text-2xl font-bold text-center mb-2 ${
                gameResult.isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {gameResult.isCorrect ? "Perfect Sequence!" : "Incorrect Sequence"}
            </Text>
          </View>
        )}

        {/* Chord Pool Buttons */}
        {currentGameRound && (
          <View className=" mb-6">
            {/* Chord Pool Grid */}
            <View className="flex-row flex-wrap justify-center gap-1 mb-6">
              {currentGameRound.chordPool.map((chord) => (
                <TouchableOpacity
                  key={chord.id}
                  onPress={() => handleChordSelect(chord.id)}
                  disabled={
                    isSubmittingSequence || selectedSequence.length >= currentGameRound.sequenceLength || showResult
                  }
                  className={`border-2 border-transparent rounded-2xl py-4 px-6  bg-[#E5EAED] items-center ${
                    isSubmittingSequence || selectedSequence.length >= currentGameRound.sequenceLength || showResult
                      ? "max-h-[50px] min-w-[80px] bg-[#E5EAED]"
                      : "max-h-[50px] min-w-[80px] bg-[#E5EAED]"
                  }`}
                >
                  <Text
                    className={`text-lg font-bold text-center ${
                      isSubmittingSequence || selectedSequence.length >= currentGameRound.sequenceLength || showResult
                        ? "max-h-[50px] min-w-[80px] bg-[#E5EAED]"
                        : " max-h-[50px] min-w-[80px] bg-[#E5EAED]"
                    }`}
                  >
                    {chord.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Level Control Buttons */}
        <View className="px-6 mb-4 items-center gap-y-3">
          {currentLevel > 1 && (
            <ActionButton
              title="Level Down"
              icon="arrow-down"
              onPress={handleLevelDown}
              disabled={isLoading || isSubmittingSequence}
            />
          )}
          {currentLevel < 4 && (
            <ActionButton
              title="Level Up"
              icon="arrow-up"
              onPress={handleLevelUp}
              disabled={isLoading || isSubmittingSequence}
            />
          )}
        </View>

        {/* Extra space to ensure content doesn't get hidden behind fixed button */}
        <View className="h-32" />
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
        <MoreDetailsButton onPress={handleMoreDetails} />
        <SaveProgressButton onPress={handleSaveProgress} />
      </View>

      {/* Subscription Required Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        message={
          error || "Subscription required for Level 3 and above. Upgrade to Premium to unlock all levels and features!"
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
