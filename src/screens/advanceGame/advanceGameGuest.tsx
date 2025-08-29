"use client"
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from "react-native"
import { useState, useEffect, useRef } from "react"
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
  clearRoundData,
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
import { debounce } from "@/src/lib/utils"
import { GuestStatsService, type GuestStats } from "@/src/services/guestStatsService"

interface AdvancedGameGuestScreenProps {
  onBack?: () => void
  onMoreDetails?: () => void
  onSaveProgress?: () => void
}

export default function AdvancedGameGuestScreen({ onBack, onMoreDetails, onSaveProgress }: AdvancedGameGuestScreenProps) {
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useAppDispatch()
  const screenWidth = Dimensions.get("window").width

  // Get auth data
  const { guitarId, pianoId } = useAuth()
  
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
    selectedSequence,
  } = useAppSelector((state) => state.advancedGame)

  const [showResult, setShowResult] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showGameErrorModal, setShowGameErrorModal] = useState(false)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)

  // Guest mode stats state
  const [guestStats, setGuestStats] = useState<GuestStats>({
    accuracy: 0,
    streak: 0,
    totalAttempts: 0,
    correctAnswers: 0,
    lastPlayedDate: "",
    wins: 0,
    gamesPlayed: 0,
  })

  // Use simpler state tracking instead of complex refs
  const [isInitializing, setIsInitializing] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false)

  // Use a ref to track the ID of the round whose audio was last played
  const lastPlayedRoundIdRef = useRef<string | null>(null)
  const prevGameRoundIdRef = useRef<string | null>(null)

  // Get route params
  const routeParams = route.params as any
  const instrumentFromRoute = routeParams?.instrument
  const instrumentIdFromRoute = routeParams?.instrumentId

  // Determine instrument ID based on route params or context
  let finalInstrumentId = instrumentIdFromRoute
  if (!finalInstrumentId && instrumentFromRoute) {
    if (instrumentFromRoute === "guitar") {
      finalInstrumentId = guitarId
      console.log("🎸 AdvancedGameGuestScreen: Using guitar ID from context:", guitarId)
    } else if (instrumentFromRoute === "piano") {
      finalInstrumentId = pianoId
      console.log("🎹 AdvancedGameGuestScreen: Using piano ID from context:", pianoId)
    }
  }

  // If still no instrument ID, try to get it from the stored instrument IDs
  if (!finalInstrumentId) {
    console.log("🔍 AdvancedGameGuestScreen: No instrument ID found, checking stored IDs...")
    if (guitarId) {
      finalInstrumentId = guitarId
      console.log("🎸 AdvancedGameGuestScreen: Using default guitar ID:", guitarId)
    } else if (pianoId) {
      finalInstrumentId = pianoId
      console.log("🎹 AdvancedGameGuestScreen: Using default piano ID:", pianoId)
    }
  }

  // Log the final IDs being used
  console.log("🎮 AdvancedGameGuestScreen: Final IDs determined:", {
    instrumentId: finalInstrumentId,
    instrument: instrumentFromRoute,
    guitarIdFromContext: guitarId,
    pianoIdFromContext: pianoId,
    isGuestMode: true,
  })

  // Load guest stats on component mount
  useEffect(() => {
    const loadGuestStats = async () => {
      const stats = await GuestStatsService.getGameModeStats("advancedGame")
      setGuestStats(stats)
      console.log("📊 AdvancedGameGuestScreen: Loaded guest stats:", stats)
    }
    loadGuestStats()
  }, [])

  // Function to format chord name for display in indicators
  const formatChordForDisplay = (chordName: string): string => {
    const parts = chordName.toLowerCase().split(" ")
    if (parts.length >= 2) {
      const note = parts[0].toUpperCase()
      const quality = parts[1]
      if (quality === "minor") {
        return `${note} m`
      } else if (quality === "major") {
        return note
      } else {
        return `${note} ${quality.charAt(0)}`
      }
    }
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
        return `${note} ${quality.charAt(0).toUpperCase() + quality.slice(1)}`
      }
    }
    return chordName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Updated initialization logic for guest mode
  useEffect(() => {
    const initializeGame = async () => {
      if (finalInstrumentId && !hasInitialized && !isInitializing && !currentGameRound && !isApiCallInProgress) {
        console.log("🎮 AdvancedGameGuestScreen: Initializing game for level:", currentLevel)
        setIsInitializing(true)
        setHasInitialized(true)
        setIsApiCallInProgress(true)
        try {
          await dispatch(
            startAdvancedGame({
              userId: null, // Guest mode - no userId
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
    finalInstrumentId,
    hasInitialized,
    isInitializing,
    currentGameRound,
    currentLevel,
    dispatch,
    isApiCallInProgress,
  ])

  // Component unmount cleanup effect
  useEffect(() => {
    return () => {
      console.log("🧹 AdvancedGameGuestScreen: Component unmounting - clearing session")
      dispatch(clearRoundData())
      audioService.stopAudio()
    }
  }, [])

  // Updated startNewGame for guest mode
  const startNewGame = async (levelToUse: number) => {
    if (!finalInstrumentId || isInitializing || isApiCallInProgress) {
      console.log("🔄 Cannot start game: missing instrumentId or already initializing/API call in progress")
      return
    }
    console.log("🎮 Starting new game at level:", levelToUse)
    setIsInitializing(true)
    setIsApiCallInProgress(true)
    setShowResult(false)
    setAudioError(null)
    dispatch(clearRoundData())
    
    if (levelToUse !== currentLevel) {
      dispatch(setCurrentLevel(levelToUse))
    }
    try {
      await dispatch(
        startAdvancedGame({
          userId: null, // Guest mode
          instrumentId: finalInstrumentId,
          level: levelToUse,
        }),
      ).unwrap()
      console.log("✅ New game started successfully")
    } catch (error) {
      console.error("❌ Error starting new game:", error)
      setShowGameErrorModal(true)
    } finally {
      setIsInitializing(false)
      setIsApiCallInProgress(false)
    }
  }

  // Auto-submit sequence when complete
  useEffect(() => {
    const debouncedSubmit = debounce(() => {
      if (
        currentGameRound &&
        selectedSequence.length === currentGameRound.sequenceLength &&
        !isSubmittingSequence &&
        !showResult
      ) {
        console.log("🎯 AdvancedGameGuestScreen: Auto-submitting sequence (debounced)")
        handleSubmitSequence()
      }
    }, 1000) // 1 second debounce time
    debouncedSubmit()
  }, [selectedSequence.length, currentGameRound, isSubmittingSequence, showResult])

  // Handle game result and update guest stats
  useEffect(() => {
    if (gameResult) {
      setShowResult(true)
      
      // Update guest stats for advanced game
      const updateStats = async () => {
        const isWin = gameResult.isCorrect // Full sequence correct = win
        
        // For advanced game, calculate individual chord correctness
        let correctChords = 0
        if (gameResult.sequenceComparison) {
          correctChords = gameResult.sequenceComparison.filter(comp => comp.correct).length
        }
        
        const sequenceLength = currentGameRound?.sequenceLength || 1
        
        // Get current stats to manually update them
        const currentGuestStats = await GuestStatsService.getGameModeStats("advancedGame")
        
        // Calculate updates manually for advanced game logic
        const newTotalAttempts = currentGuestStats.totalAttempts + sequenceLength // Each chord = 1 attempt
        const newCorrectAnswers = currentGuestStats.correctAnswers + correctChords // Individual correct chords
        const newWins = currentGuestStats.wins + correctChords // Each correct chord counts as a win
        const newAccuracy = newTotalAttempts > 0 ? Math.round((newCorrectAnswers / newTotalAttempts) * 100) : 0
        
        // Handle streak logic
        const today = new Date().toISOString().split("T")[0]
        const lastPlayedDate = currentGuestStats.lastPlayedDate
        let newStreak = currentGuestStats.streak
        
        if (lastPlayedDate) {
          const lastPlayed = new Date(lastPlayedDate)
          const todayDate = new Date(today)
          const daysDifference = Math.floor((todayDate.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDifference === 0) {
            // Same day, keep streak
            newStreak = currentGuestStats.streak
          } else if (daysDifference === 1 && correctChords > 0) {
            // Next day and got at least one chord correct, increment streak
            newStreak = currentGuestStats.streak + 1
          } else if (daysDifference > 1 || correctChords === 0) {
            // Skipped days or got no chords correct, reset streak
            newStreak = correctChords > 0 ? 1 : 0
          }
        } else {
          // First time playing
          newStreak = correctChords > 0 ? 1 : 0
        }
        
        // Track games played separately (each sequence = 1 game)
        const newGamesPlayed = (currentGuestStats.gamesPlayed || 0) + 1
        
        // Create the updated stats object
        const updatedStats = {
          accuracy: newAccuracy,
          streak: newStreak,
          totalAttempts: newTotalAttempts, // This tracks chord attempts for accuracy calculation
          correctAnswers: newCorrectAnswers,
          wins: newWins,
          lastPlayedDate: today,
          gamesPlayed: newGamesPlayed, // Add this to track actual game sessions
        }
        
        // Save the updated stats manually
        const allStats = await GuestStatsService.getGuestStats()
        allStats.advancedGame = updatedStats
        await GuestStatsService.saveGuestStats(allStats)
        
        setGuestStats(updatedStats)
        
        console.log("🎯 Advanced game result received with stats:", {
          fullSequenceCorrect: gameResult.isCorrect,
          correctChords,
          sequenceLength,
          chordWins: correctChords,
          updatedStats,
        })
      }
      
      updateStats()
    }
  }, [gameResult])

  // Handle errors with appropriate modals
  useEffect(() => {
    if (error && errorCode) {
      console.log("🔴 AdvancedGameGuestScreen: Handling error:", { error, errorCode })
      if (errorCode === "SUBSCRIPTION_REQUIRED") {
        setShowSubscriptionModal(true)
      } else {
        setShowGameErrorModal(true)
      }
    } else if (error && !errorCode) {
      setShowGameErrorModal(true)
    }
  }, [error, errorCode])

  // Effect to reset UI states when a new round loads
  useEffect(() => {
    const currentRoundId = currentGameRound?.gameSessionId || null

    if (currentGameRound) {
      setShowResult(false)
      lastPlayedRoundIdRef.current = null // Reset for manual audio play
    }

    prevGameRoundIdRef.current = currentRoundId
  }, [currentGameRound])

  // Audio playback function (no automatic playback)
  const playSequenceAudio = async () => {
    if (!currentGameRound?.sequenceAudioUrls || isPlayingSequence) return
    try {
      setIsPlayingSequence(true)
      setAudioError(null)
      console.log("🎵 AdvancedGameGuestScreen: Playing sequence audio...")
      
      for (let i = 0; i < currentGameRound.sequenceAudioUrls.length; i++) {
        const audioUrl = currentGameRound.sequenceAudioUrls[i]
        console.log(`🎵 Playing audio ${i + 1}/${currentGameRound.sequenceAudioUrls.length}:`, audioUrl)
        
        try {
          await audioService.playAudio(audioUrl)
        } catch (audioError) {
          console.error(`❌ Error playing audio ${i + 1}:`, audioError)
          if (i < currentGameRound.sequenceAudioUrls.length - 1) {
            setAudioError(`Error playing chord ${i + 1}. Continuing with next chord.`)
          } else {
            setAudioError(`Error playing chord ${i + 1}.`)
          }
        }
        
        // Wait between audio files
        if (i < currentGameRound.sequenceAudioUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
      console.log("✅ AdvancedGameGuestScreen: Sequence audio playback completed")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown audio error"
      console.error("❌ AdvancedGameGuestScreen: Audio playback failed:", errorMessage)
      setAudioError(errorMessage)
    } finally {
      setIsPlayingSequence(false)
    }
  }

  const handlePlayAgain = () => {
    if (!finalInstrumentId) return
    console.log("🔄 AdvancedGameGuestScreen: Play Again clicked (guest mode)")
    setHasInitialized(false)
    startNewGame(currentLevel)
  }

  const handleChordSelect = (chordId: string) => {
    if (isSubmittingSequence || !currentGameRound || showResult) return
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
    
    const responseTime = responseStartTime ? Date.now() - responseStartTime : 0
    console.log("🎯 AdvancedGameGuestScreen: Auto-submitting sequence:", {
      sequence: selectedSequence,
      responseTime,
      gameSessionId: currentGameRound.gameSessionId,
      isGuestMode: true,
    })
    setIsApiCallInProgress(true)
    
    dispatch(
      submitSequence({
        userId: null, // Guest mode
        gameSessionId: currentGameRound.gameSessionId,
        submittedSequence: selectedSequence,
        responseTimeMs: responseTime,
      }),
    ).finally(() => {
      setIsApiCallInProgress(false)
    })
  }

  const handleLevelDown = () => {
    if (currentLevel > 1 && finalInstrumentId) {
      const newLevel = currentLevel - 1
      console.log("📉 AdvancedGameGuestScreen: Level down to:", newLevel)
      setHasInitialized(false)
      startNewGame(newLevel)
    }
  }

  const handleLevelUp = () => {
    if (currentLevel < 4 && finalInstrumentId) {
      const newLevel = currentLevel + 1
      console.log("📈 AdvancedGameGuestScreen: Attempting level up to:", newLevel)
      
      // Show subscription modal for level 3+ for guests
      if (newLevel >= 3) {
        console.log("🚫 AdvancedGameGuestScreen: Subscription required for level 3+")
        setShowSubscriptionModal(true)
        return
      }
      setHasInitialized(false)
      startNewGame(newLevel)
    }
  }

  const handleMoreDetails = () => {
    console.log("🔍 AdvancedGameGuestScreen: More Details pressed (guest mode)")
    onMoreDetails?.()
    const nav = navigation as any
    nav.navigate("Menu", {
      accuracy: guestStats.accuracy.toFixed(1) + "%",
      level: currentLevel,
      streaks: guestStats.streak,
      gameType: "advanced",
      gameResult: gameResult?.isCorrect ? "correct" : "incorrect",
      isGuestMode: true,
    })
  }

  const handleSaveProgress = () => {
    console.log("💾 AdvancedGameGuestScreen: Save Progress pressed")
    onSaveProgress?.()
    const nav = navigation as any
    nav.navigate("Register")
  }

  const handleSubscriptionUpgrade = () => {
    setShowSubscriptionModal(false)
    dispatch(clearError())
    console.log("💳 AdvancedGameGuestScreen: Navigating to subscription screen")
    const nav = navigation as any
    nav.navigate("Subscription")
  }

  const handleSubscriptionCancel = () => {
    setShowSubscriptionModal(false)
    dispatch(clearError())
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

    if (showResult && gameResult && gameResult.correctSequence) {
      const sortedCorrectSequence = [...gameResult.correctSequence].sort((a, b) => a.position - b.position)

      for (let i = 0; i < currentGameRound.sequenceLength; i++) {
        const correctChord = sortedCorrectSequence[i]
        const comparison = gameResult.sequenceComparison?.find(
          (comp) => comp.position === (correctChord?.position || i + 1),
        )

        let type: "success" | "error" | "empty" | "filled" = "empty"
        let chordText = ""
        let showIcon = false

        if (correctChord) {
          chordText = formatChordForDisplay(correctChord.name)
          if (comparison) {
            type = comparison.correct ? "success" : "error"
            showIcon = true
          } else {
            type = "error"
            showIcon = true
          }
        } else {
          type = "empty"
          showIcon = false
        }
        indicators.push({ type, chordText, showIcon })
      }
    } else {
      for (let i = 0; i < currentGameRound.sequenceLength; i++) {
        if (i < selectedSequence.length) {
          const selectedChordId = selectedSequence[i]
          const selectedChord = currentGameRound.chordPool.find((chord) => chord.id === selectedChordId)
          const chordText = selectedChord ? formatChordForDisplay(selectedChord.name) : ""
          indicators.push({
            type: "filled",
            chordText,
            showIcon: false,
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
    if (chords.length <= buttonsPerRow) {
      return [chords]
    }
    const completeRows = Math.floor(chords.length / buttonsPerRow)
    const remainder = chords.length % buttonsPerRow
    for (let i = 0; i < completeRows; i++) {
      const startIndex = i * buttonsPerRow
      const endIndex = startIndex + buttonsPerRow
      rows.push(chords.slice(startIndex, endIndex))
    }
    if (remainder > 0) {
      const remainingChords = chords.slice(completeRows * buttonsPerRow)
      if (remainder === 1) {
        if (rows.length > 0) {
          const lastCompleteRow = rows[rows.length - 1]
          const redistributed = lastCompleteRow.slice(-2).concat(remainingChords)
          rows[rows.length - 1] = lastCompleteRow.slice(0, -2)
          rows.push(redistributed)
        } else {
          rows.push(remainingChords)
        }
      } else if (remainder === 2) {
        if (rows.length > 0) {
          const lastCompleteRow = rows[rows.length - 1]
          const redistributed = lastCompleteRow.slice(-1).concat(remainingChords)
          rows[rows.length - 1] = lastCompleteRow.slice(0, -1)
          rows.push(redistributed)
        } else {
          rows.push(remainingChords)
        }
      }
    }
    return rows
  }

  // Calculate button width for exactly 3 buttons per row
  const calculateButtonWidth = () => {
    const padding = 48
    const gap = 8
    const availableWidth = screenWidth - padding - gap
    return Math.floor(availableWidth / 3)
  }

  if (isLoading || isInitializing) {
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
        {audioError && (
          <View className="mx-6 mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <Text className="text-yellow-800 text-sm">⚠️ Audio playback issue: {audioError}</Text>
          </View>
        )}
        <View className="bg-[#E5EAED80] rounded-3xl m-4">
          {/* Stats Row - Using guest mode stats */}
          <View className="flex-row justify-between mb-8 gap-x-1">
            <StatCard value={guestStats.accuracy.toFixed(1) + "%"} label="Accuracy" size="large" />
            <StatCard value={currentLevel.toString()} label="Level" size="large" />
            <StatCard value={guestStats.streak.toString()} label="Streaks" size="large" />
            <StatCard
              showFraction={true}
              numerator={guestStats.wins}
              denominator={guestStats.totalAttempts || 1}
              label="Wins / Attempts"
              size="large"
              value=""
            />
          </View>
        </View>
        {/* Play Again Button - Manual audio playback only */}
        {currentGameRound && (
          <View className="px-6 mb-8">
            <TouchableOpacity
              onPress={showResult ? handlePlayAgain : () => playSequenceAudio()}
              disabled={isPlayingSequence || isLoading || isInitializing}
              className="bg-[#1e3a5f] rounded-2xl py-4 px-6 flex-row justify-center items-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel={showResult ? "Play Again" : "Play Sequence"}
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
        {/* Sequence Indicators */}
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
            {(() => {
              const correctSequenceDisplay =
                gameResult.correctSequence && Array.isArray(gameResult.correctSequence)
                  ? gameResult.correctSequence
                      .sort((a, b) => a.position - b.position)
                      .map((chord) => formatChordForSequence(chord.name))
                      .join(" → ")
                  : "N/A"

              return (
                <Text
                  className={`text-2xl font-bold text-center mb-4 ${gameResult.isCorrect ? "text-green-600" : "text-red-600"}`}
                >
                  {gameResult.isCorrect ? "Perfect Sequence!" : `Sorry, the sequence was: ${correctSequenceDisplay}`}
                </Text>
              )
            })()}
          </View>
        )}
        {/* Chord Selection Grid */}
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
        <View className="h-32" />
      </ScrollView>
      {/* Fixed Bottom Section */}
      <View className="px-6 pb-8 pt-4 items-center justify-center bg-white">
        <MoreDetailsButton onPress={handleMoreDetails} />
        <SaveProgressButton onPress={handleSaveProgress} />
      </View>
      {/* Subscription Required Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        message="Subscription required for Level 3 and above. Upgrade to Premium to unlock all levels and features!"
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