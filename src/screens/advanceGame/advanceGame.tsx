"use client"
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from "react-native"
import { useState, useEffect } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { useAuth } from "@/src/context/AuthContext"
import {
  startAdvancedGame,
  submitSequence,
  clearError,
  setCurrentLevel,
  addToSequence,
  removeFromSequence,
  clearRoundData, // Import the new action
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
// Import the debounce function at the top of the file
import { debounce } from "@/src/lib/utils"

interface AdvancedGameScreenProps {
  onBack?: () => void
  onMoreDetails?: () => void
  onSaveProgress?: () => void
}

export default function AdvancedGameScreen({ onBack, onMoreDetails, onSaveProgress }: AdvancedGameScreenProps) {
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useAppDispatch()

  // Get screen dimensions for responsive layout
  const screenWidth = Dimensions.get("window").width

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
  const [isPlayingSequence, setIsPlayingSequence] = useState(isPlayingSequence)

  // Use simpler state tracking instead of complex refs
  const [isInitializing, setIsInitializing] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Add API call prevention state
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false)

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

  // Use IDs from route params or context (userId can be null for guest mode)
  const finalUserId = userIdFromRoute || userId || null

  // Log the final IDs being used
  console.log("🎮 AdvancedGameScreen: Final IDs determined:", {
    userId: finalUserId,
    instrumentId: finalInstrumentId,
    instrument: instrumentFromRoute,
    guitarIdFromContext: guitarId,
    pianoIdFromContext: pianoId,
    isGuestMode: !finalUserId,
  })

  // Function to format chord name for display in indicators
  const formatChordForDisplay = (chordName: string): string => {
    // Convert "a major" to "A", "a minor" to "A m", etc.
    const parts = chordName.toLowerCase().split(" ")
    if (parts.length >= 2) {
      const note = parts[0].toUpperCase()
      const quality = parts[1]
      if (quality === "minor") {
        return `${note} m`
      } else if (quality === "major") {
        return note
      } else {
        // For other qualities like diminished, augmented, etc.
        return `${note} ${quality.charAt(0)}`
      }
    }
    // Fallback: just capitalize first letter
    return chordName.charAt(0).toUpperCase() + chordName.slice(1, 3)
  }

  // Function to format chord name for sequence display (longer format)
  const formatChordForSequence = (chordName: string): string => {
    const parts = chordName.toLowerCase().split(" ")
    if (parts.length >= 2) {
      const note = parts[0].toUpperCase()
      const quality = parts[1]
      if (quality === "minor") {
        return `${note} Minor`
      } else if (quality === "major") {
        return `${note} Major`
      } else {
        // Capitalize first letter of quality
        return `${note} ${quality.charAt(0).toUpperCase() + quality.slice(1)}`
      }
    }
    // Fallback: capitalize properly
    return chordName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Updated initialization logic to work without userId requirement
  useEffect(() => {
    const initializeGame = async () => {
      // Only require instrumentId, userId is optional for guest mode
      if (finalInstrumentId && !hasInitialized && !isInitializing && !currentGameRound && !isApiCallInProgress) {
        console.log("🎮 AdvancedGameScreen: Initializing game for level:", currentLevel, {
          isGuestMode: !finalUserId,
        })
        setIsInitializing(true)
        setHasInitialized(true)
        setIsApiCallInProgress(true)
        try {
          await dispatch(
            startAdvancedGame({
              userId: finalUserId, // Can be null for guest mode
              instrumentId: finalInstrumentId,
              level: currentLevel,
            }),
          ).unwrap()
          console.log("✅ Game initialized successfully")
        } catch (error) {
          console.error("❌ Error initializing game:", error)
          setHasInitialized(false) // Allow retry on error
        } finally {
          setIsInitializing(false)
          setIsApiCallInProgress(false)
        }
      } else if (!finalInstrumentId) {
        console.error("❌ Missing required instrumentId for game initialization")
        setShowGameErrorModal(true)
      }
    }
    initializeGame()
  }, [
    finalUserId,
    finalInstrumentId,
    hasInitialized,
    isInitializing,
    currentGameRound,
    currentLevel,
    dispatch,
    isApiCallInProgress,
  ])

  // Updated startNewGame to work without userId requirement
  const startNewGame = async (levelToUse: number) => {
    if (!finalInstrumentId || isInitializing || isApiCallInProgress) {
      console.log("🔄 Cannot start game: missing instrumentId or already initializing/API call in progress")
      return
    }
    console.log("🎮 Starting new game at level:", levelToUse, {
      isGuestMode: !finalUserId,
    })
    setIsInitializing(true)
    setIsApiCallInProgress(true)
    setShowResult(false)
    setAudioError(null)

    // Use clearRoundData instead of resetGame to preserve currentLevel and stats
    dispatch(clearRoundData())

    // Set the level if different (this will update Redux state)
    // This dispatch is now redundant if level is only updated on fulfilled, but kept for clarity
    // The actual level update happens in the fulfilled case of startAdvancedGame
    if (levelToUse !== currentLevel) {
      dispatch(setCurrentLevel(levelToUse))
    }

    try {
      await dispatch(
        startAdvancedGame({
          userId: finalUserId, // Can be null for guest mode
          instrumentId: finalInstrumentId,
          level: levelToUse,
        }),
      ).unwrap()
      console.log("✅ New game started successfully")
    } catch (error) {
      console.error("❌ Error starting new game:", error)
      // The error handling useEffect will catch this and show the modal.
      // The level will automatically revert because setCurrentLevel is only effective on fulfilled.
      setShowGameErrorModal(true) // Fallback for generic errors
    } finally {
      setIsInitializing(false)
      setIsApiCallInProgress(false)
    }
  }

  // Auto-submit sequence when complete
  useEffect(() => {
    // Create a debounced version of the submit function
    const debouncedSubmit = debounce(() => {
      if (
        currentGameRound &&
        selectedSequence.length === currentGameRound.sequenceLength &&
        !isSubmittingSequence &&
        !showResult
      ) {
        console.log("🎯 AdvancedGameScreen: Auto-submitting sequence (debounced)", {
          isGuestMode: !finalUserId,
        })
        handleSubmitSequence()
      }
    }, 1000) // 1 second debounce time

    // Call the debounced function when conditions are met
    debouncedSubmit()

    // No need for cleanup as the debounce function handles it
  }, [selectedSequence.length, currentGameRound, finalUserId, isSubmittingSequence, showResult])

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
        isGuestMode: !finalUserId,
      })
    }
  }, [gameResult])

  // Handle errors with appropriate modals
  useEffect(() => {
    if (error && errorCode) {
      console.log("🔴 AdvancedGameScreen: Handling error:", { error, errorCode })
      if (errorCode === "SUBSCRIPTION_REQUIRED") {
        setShowSubscriptionModal(true)
        // No need to revert level here, as it's only updated on fulfilled now.
      } else {
        setShowGameErrorModal(true)
      }
    } else if (error && !errorCode) {
      // Generic error without code
      setShowGameErrorModal(true)
    }
  }, [error, errorCode])

  // Update the playSequenceAudio function in the AdvancedGameScreen component
  const playSequenceAudio = async () => {
    if (!currentGameRound?.sequenceAudioUrls || isPlayingSequence) return
    try {
      setIsPlayingSequence(true)
      setAudioError(null)
      console.log("🎵 AdvancedGameScreen: Playing sequence audio...")
      console.log("🎵 AdvancedGameScreen: Audio URLs to play:", currentGameRound.sequenceAudioUrls)

      for (let i = 0; i < currentGameRound.sequenceAudioUrls.length; i++) {
        const audioUrl = currentGameRound.sequenceAudioUrls[i]
        console.log(`🎵 Playing audio ${i + 1}/${currentGameRound.sequenceAudioUrls.length}:`, audioUrl)

        // Extract file name for clearer logging
        const fileName = audioUrl.split("/").pop() || audioUrl
        console.log(`🎵 File name: ${fileName}`)

        try {
          await audioService.playAudio(audioUrl)
        } catch (audioError) {
          console.error(`❌ Error playing audio ${i + 1}:`, audioError)
          // Try to continue with next audio file instead of stopping the whole sequence
          if (i < currentGameRound.sequenceAudioUrls.length - 1) {
            setAudioError(`Error playing chord ${i + 1}. Continuing with next chord.`)
          } else {
            setAudioError(`Error playing chord ${i + 1}.`)
          }
        }

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

  // Updated handlePlayAgain to start new game immediately
  const handlePlayAgain = () => {
    if (!finalInstrumentId) return
    console.log("🔄 AdvancedGameScreen: Play Again clicked", {
      isGuestMode: !finalUserId,
    })
    setHasInitialized(false) // Reset initialization flag
    startNewGame(currentLevel)
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
      selectedSequence.length !== currentGameRound.sequenceLength ||
      isSubmittingSequence ||
      isApiCallInProgress
    ) {
      console.log("🔄 Cannot submit sequence: conditions not met or API call in progress")
      return
    }

    // Calculate response time
    const responseTime = responseStartTime ? Date.now() - responseStartTime : 0
    console.log("🎯 AdvancedGameScreen: Auto-submitting sequence:", {
      sequence: selectedSequence,
      responseTime,
      gameSessionId: currentGameRound.gameSessionId,
      isGuestMode: !finalUserId,
    })

    setIsApiCallInProgress(true)

    // Submit sequence (works for both authenticated users and guests)
    dispatch(
      submitSequence({
        userId: finalUserId, // Can be null for guest mode
        gameSessionId: currentGameRound.gameSessionId,
        submittedSequence: selectedSequence,
        responseTimeMs: responseTime,
      }),
    ).finally(() => {
      setIsApiCallInProgress(false)
    })
  }

  // Updated handleLevelDown to start new game immediately
  const handleLevelDown = () => {
    if (currentLevel > 1 && finalInstrumentId) {
      const newLevel = currentLevel - 1
      console.log("📉 AdvancedGameScreen: Level down to:", newLevel, {
        isGuestMode: !finalUserId,
      })
      setHasInitialized(false) // Reset initialization flag
      startNewGame(newLevel)
    }
  }

  // Updated handleLevelUp to show subscription modal for guests at level 3+
  const handleLevelUp = () => {
    if (currentLevel < 4 && finalInstrumentId) {
      const newLevel = currentLevel + 1
      console.log("📈 AdvancedGameScreen: Attempting level up to:", newLevel, {
        isGuestMode: !finalUserId,
      })

      // If the new level is 3 or above, show subscription modal for ALL users
      if (newLevel >= 3) {
        // Removed `&& !finalUserId`
        console.log("🚫 AdvancedGameScreen: Subscription required for level 3+")
        setShowSubscriptionModal(true)
        return // Prevent starting the game
      }

      setHasInitialized(false) // Reset initialization flag
      startNewGame(newLevel)
    }
  }

  const handleMoreDetails = () => {
    console.log("🔍 AdvancedGameScreen: More Details pressed", {
      isGuestMode: !finalUserId,
    })
    onMoreDetails?.()
    navigation.navigate("Menu" as never, {
      accuracy: currentStats.accuracy.toFixed(1) + "%",
      level: currentLevel,
      streaks: currentStats.streak,
      gameType: "advanced",
      gameResult: gameResult?.isCorrect ? "correct" : "incorrect",
      isGuestMode: !finalUserId,
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
    // If the user cancels, ensure they stay on the current level
    // No explicit action needed here as currentLevel is only updated on successful game start
  }

  const handleGameErrorClose = () => {
    setShowGameErrorModal(false)
    dispatch(clearError())
  }

  const handleGameErrorRetry = () => {
    setShowGameErrorModal(false)
    dispatch(clearError())
    if (finalInstrumentId) {
      startNewGame(currentLevel)
    }
  }

  // Get sequence indicators based on current selection and result
  const getSequenceIndicators = (): Array<{
    type: "success" | "error" | "empty" | "filled"
    chordText?: string
    showIcon?: boolean
  }> => {
    if (!currentGameRound) return []

    const indicators: Array<{
      type: "success" | "error" | "empty" | "filled"
      chordText?: string
      showIcon?: boolean
    }> = []

    for (let i = 0; i < currentGameRound.sequenceLength; i++) {
      if (showResult && gameResult) {
        // Show result indicators with chord names and tick/cross icons
        // Add null check for gameResult.sequenceComparison
        const comparison = gameResult.sequenceComparison?.find((comp) => comp.position === i + 1)
        if (comparison) {
          // Find the chord name for display
          // Add null check for gameResult.correctSequence
          const correctChord = gameResult.correctSequence?.find((chord) => chord.position === i + 1)
          const chordText = correctChord ? formatChordForDisplay(correctChord.name) : ""
          indicators.push({
            type: comparison.correct ? "success" : "error",
            chordText,
            showIcon: true, // Show tick/cross icons in result view
          })
        } else {
          indicators.push({ type: "empty" })
        }
      } else {
        // Show selection indicators with selected chord names (no icons during gameplay)
        if (i < selectedSequence.length) {
          // Find the chord name from the selected chord ID
          const selectedChordId = selectedSequence[i]
          const selectedChord = currentGameRound.chordPool.find((chord) => chord.id === selectedChordId)
          const chordText = selectedChord ? formatChordForDisplay(selectedChord.name) : ""
          indicators.push({
            type: "filled",
            chordText,
            showIcon: false, // No icons during gameplay
          })
        } else {
          indicators.push({ type: "empty" })
        }
      }
    }

    return indicators
  }

  // Function to organize chords into rows with exactly 3 buttons per row
  const organizeChordRows = (chords: any[]) => {
    const rows = []
    const buttonsPerRow = 3

    // If we have fewer than 3 chords total, put them all in one row
    if (chords.length <= buttonsPerRow) {
      return [chords]
    }

    // Calculate how many complete rows of 3 we can make
    const completeRows = Math.floor(chords.length / buttonsPerRow)
    const remainder = chords.length % buttonsPerRow

    // Create complete rows of 3
    for (let i = 0; i < completeRows; i++) {
      const startIndex = i * buttonsPerRow
      const endIndex = startIndex + buttonsPerRow
      rows.push(chords.slice(startIndex, endIndex))
    }

    // Handle remaining chords
    if (remainder > 0) {
      const remainingChords = chords.slice(completeRows * buttonsPerRow)
      if (remainder === 1) {
        // If only 1 chord left, take 1 from the previous row to make 2 rows of 2 each
        // But since we want at least 3 per row, take 2 from previous row to make 3
        if (rows.length > 0) {
          const lastCompleteRow = rows[rows.length - 1]
          const redistributed = lastCompleteRow.slice(-2).concat(remainingChords)
          rows[rows.length - 1] = lastCompleteRow.slice(0, -2)
          rows.push(redistributed)
        } else {
          // This shouldn't happen given our initial check, but handle it
          rows.push(remainingChords)
        }
      } else if (remainder === 2) {
        // If 2 chords left, take 1 from the previous row to make a row of 3
        if (rows.length > 0) {
          const lastCompleteRow = rows[rows.length - 1]
          const redistributed = lastCompleteRow.slice(-1).concat(remainingChords)
          rows[rows.length - 1] = lastCompleteRow.slice(0, -1)
          rows.push(redistributed)
        } else {
          // This shouldn't happen given our initial check, but handle it
          rows.push(remainingChords)
        }
      }
    }

    return rows
  }

  // Calculate button width for exactly 3 buttons per row
  const calculateButtonWidth = () => {
    const padding = 48 // Total horizontal padding (24 on each side)
    const gap = 8 // Total gap space (2 gaps of 4px each between 3 buttons)
    const availableWidth = screenWidth - padding - gap
    return Math.floor(availableWidth / 3)
  }

  // Update the loading condition to use the simpler state:
  if (isLoading || isInitializing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-6 py-4">
          <BackButton onPress={onBack} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#003049" />
          <Text className="mt-4 text-[#003049] text-lg">Loading advanced game...</Text>
          {/* Add timeout message after 10 seconds */}
          <Text className="mt-2 text-gray-500 text-sm">If this takes too long, please check your connection</Text>
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
          {/* Stats Row - Now using real-time stats from API with Wins/Attempts card */}
          <View className="flex-row justify-between mb-8 gap-x-1">
            <StatCard value={currentStats.accuracy.toFixed(1) + "%"} label="Accuracy" size="large" />
            <StatCard value={currentLevel.toString()} label="Level" size="large" />
            <StatCard value={currentStats.streak.toString()} label="Streaks" size="large" />
            <StatCard
              showFraction={true}
              numerator={currentStats.correctAnswers}
              denominator={currentStats.totalAttempts}
              label="Wins / Attempts"
              size="large"
              value="" // Not used when showFraction is true
            />
          </View>
        </View>

        {/* Play Again Button - Updated to show proper text based on game state */}
        {currentGameRound && (
          <View className="px-6 mb-8">
            <TouchableOpacity
              onPress={showResult ? handlePlayAgain : () => playSequenceAudio()}
              disabled={isPlayingSequence || isLoading || isInitializing}
              className="bg-[#1e3a5f] rounded-2xl py-4 px-6 flex-row justify-center items-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel={showResult ? "Play Again" : "Play Sequence Again"}
            >
              {isPlayingSequence || isLoading || isInitializing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Feather name={showResult ? "play" : "refresh-cw"} size={20} color="white" />
              )}
              <Text className="text-white text-lg font-semibold ml-3">
                {isPlayingSequence
                  ? "Playing..."
                  : isLoading || isInitializing
                    ? "Loading..."
                    : showResult
                      ? "Play Again"
                      : "Play Sequence"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sequence Indicators - Now showing chord names with full-circle tick/cross icons */}
        {currentGameRound && (
          <View className="flex-row justify-center gap-x-4 mb-8">
            {getSequenceIndicators().map((indicator, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSequenceItemRemove(index)}
                disabled={showResult || !indicator.chordText}
              >
                <CircularIndicator
                  type={indicator.type}
                  size={50}
                  chordText={indicator.chordText}
                  showIcon={indicator.showIcon}
                />
              </TouchableOpacity>
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
              className={`text-2xl font-bold text-center mb-4 ${
                gameResult.isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {gameResult.isCorrect ? "Perfect Sequence!" : "Incorrect Sequence"}
            </Text>
            {/* Show correct sequence in text format */}
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <Text className="text-gray-700 text-lg font-semibold text-center mb-2">
                {gameResult.isCorrect ? "Your Answer:" : "Correct Sequence:"}
              </Text>
              <Text className="text-gray-800 text-base text-center leading-6">
                {gameResult.correctSequence
                  ?.sort((a, b) => a.position - b.position)
                  .map((chord) => formatChordForSequence(chord.name))
                  .join(" → ")}
              </Text>
            </View>
          </View>
        )}

        {/* Chord Pool Buttons - Updated to ensure exactly 3 buttons per row */}
        {currentGameRound && (
          <View className="px-6 mb-6">
            {organizeChordRows(currentGameRound.chordPool).map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-center gap-1 mb-2">
                {row.map((chord) => {
                  const buttonWidth = calculateButtonWidth()
                  return (
                    <TouchableOpacity
                      key={chord.id}
                      onPress={() => handleChordSelect(chord.id)}
                      disabled={
                        isSubmittingSequence ||
                        selectedSequence.length >= currentGameRound.sequenceLength ||
                        showResult ||
                        isInitializing
                      }
                      className={`border-2 border-transparent rounded-2xl py-4 px-2 bg-[#E5EAED] items-center justify-center ${
                        isSubmittingSequence ||
                        selectedSequence.length >= currentGameRound.sequenceLength ||
                        showResult ||
                        isInitializing
                          ? "opacity-50"
                          : ""
                      }`}
                      style={{
                        width: buttonWidth,
                        minHeight: 60,
                      }}
                    >
                      <Text
                        className={`text-lg font-bold text-center text-[#003049] ${
                          isSubmittingSequence ||
                          selectedSequence.length >= currentGameRound.sequenceLength ||
                          showResult ||
                          isInitializing
                            ? "opacity-50"
                            : ""
                        }`}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                      >
                        {chord.displayName}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </View>
        )}

        {/* Level Control Buttons */}
        <View className="px-6 mb-4 items-center gap-y-3">
          {currentLevel > 1 && (
            <ActionButton
              title="Level Down"
              icon="arrow-down"
              onPress={handleLevelDown}
              disabled={isLoading || isSubmittingSequence || isInitializing || isApiCallInProgress}
            />
          )}
          {currentLevel < 4 && (
            <ActionButton
              title="Level Up"
              icon="arrow-up"
              onPress={handleLevelUp}
              disabled={isLoading || isSubmittingSequence || isInitializing || isApiCallInProgress}
            />
          )}
        </View>

        {/* Extra space to ensure content doesn't get hidden behind fixed button */}
        <View className="h-32" />
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View className="px-6 pb-8 pt-4 items-center justify-center bg-white">
        <MoreDetailsButton onPress={handleMoreDetails} />
        {/* Only show Save Progress for logged-in users */}
        {finalUserId && <SaveProgressButton onPress={handleSaveProgress} />}
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
