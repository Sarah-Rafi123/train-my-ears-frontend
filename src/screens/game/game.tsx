"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { useAuth } from "@/src/context/AuthContext"

import { startGame, submitAnswer, clearError, clearGameResult, clearGameRound, setCurrentLevel, resetGame } from "@/src/store/slices/gameSlice"
import { audioService } from "@/src/services/audioService"
import { LevelStatsService, type LevelStats } from "@/src/services/levelStatsService"
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
  
  // Level-specific stats state for authenticated users
  const [levelStats, setLevelStats] = useState<LevelStats | null>(null)

  // Use a ref to track the previous game round ID to detect actual changes (simplified like gameGuest.tsx)
  const prevGameRoundIdRef = useRef<string | null>(null)
  
  // State to prevent multiple simultaneous game starts
  const [gameInitialized, setGameInitialized] = useState(false)
  const [screenReady, setScreenReady] = useState(false)

  // Get route params
  const routeParams = route.params as any
  const instrumentFromRoute = routeParams?.instrument
  const instrumentIdFromRoute = routeParams?.instrumentId
  const userIdFromRoute = routeParams?.userId

  // Determine instrument ID based on route params or context
  let finalInstrumentId = instrumentIdFromRoute
  if (!finalInstrumentId && instrumentFromRoute) {
    if (instrumentFromRoute === "guitar") {
      finalInstrumentId = guitarId || 'cmdh5ji090002ta0boucdg1dd' // Fallback guitar ID
    } else if (instrumentFromRoute === "piano") {
      finalInstrumentId = pianoId || 'cmdh5jjpq0003ta0bpxoplgsi' // Fallback piano ID
    }
  }

  // Use IDs from route params or context (userId can be null for guest mode)
  const finalUserId = userIdFromRoute || userId || null

  // Load level-specific stats for authenticated users
  useEffect(() => {
    if (finalUserId) {
      const loadLevelStats = async () => {
        const stats = await LevelStatsService.loadUserLevelStats(finalUserId, "regularGame", currentLevel)
        setLevelStats(stats)
        console.log("📊 GameScreen: Loaded level stats:", stats)
      }
      loadLevelStats()
    }
  }, [finalUserId, currentLevel])

  // Initialize game only once when component mounts
  useEffect(() => {
    console.log("🎮 GameScreen: Component mounted, initializing...")
    // Clear any previous game state and stop audio when entering game screen fresh
    dispatch(clearGameRound())
    dispatch(resetGame()) // Clear all game data including stats 
    audioService.stopAudio()
    
    // Reset audio tracking refs to ensure fresh start
    prevGameRoundIdRef.current = null
    setGameInitialized(false)
    
    // Set screen ready after a small delay to ensure everything is loaded
    setTimeout(() => {
      setScreenReady(true)
    }, 500)
    
    return () => {
      audioService.stopAudio(); // Ensure the audio stops
    };
  }, [dispatch]) // Only run once on mount

  // Separate effect to start game when instrumentId, level, or user changes
  useEffect(() => {
    // Don't start game if conditions aren't met
    if (!screenReady || gameInitialized || !finalInstrumentId) {
      if (!finalInstrumentId) {
        console.error("❌ GameScreen: Missing required instrumentId:", {
          userId: finalUserId,
          instrumentId: finalInstrumentId,
        })
        setShowGameErrorModal(true)
      }
      return
    }

    // Check if user is in guest mode (no token and no userId) and trying to access level 3 or 4
    if (!finalUserId && currentLevel >= 3) {
      setShowSubscriptionModal(true)
      return
    }

    console.log("🎮 GameScreen: Starting game with:", {
      userId: finalUserId,
      instrumentId: finalInstrumentId,
      instrument: instrumentFromRoute,
      level: currentLevel,
      isGuestMode: !finalUserId,
    })
    
    setGameInitialized(true)
    
    dispatch(
      startGame({
        userId: finalUserId, // Can be null for guest mode
        instrumentId: finalInstrumentId,
        level: currentLevel,
      }),
    )
  }, [dispatch, finalUserId, finalInstrumentId, currentLevel, instrumentFromRoute, screenReady, gameInitialized])

  // Component unmount cleanup effect - separated to avoid infinite loops
  useEffect(() => {
    // This cleanup function runs only when the component is unmounted
    return () => {
      console.log("🧹 GameScreen: Component unmounting - clearing session")
      dispatch(clearGameRound()) // Use clearGameRound instead of resetGame to avoid infinite loops
      audioService.stopAudio()
    }
  }, []) // Empty dependency array ensures this only runs on mount/unmount

  // Effect to reset UI states for a new round and play audio (simplified like gameGuest.tsx)
  useEffect(() => {
    const currentRoundId = currentGameRound?.gameRoundId || null
    const prevRoundId = prevGameRoundIdRef.current

    if (currentGameRound) {
      // Reset UI states for a new round
      setShowChords(true)
      setShowResult(false)
      setSelectedChordId(null)
      
      // Auto-play audio for new rounds (but not on initial render with same round)
      if (screenReady && currentRoundId && currentRoundId !== prevRoundId && currentGameRound.targetChord?.name && currentGameRound.instrument?.name) {
        console.log("🎵 GameScreen: Auto-playing chord audio for new round:", currentRoundId)
        console.log("🎵 GameScreen: Playing chord:", currentGameRound.targetChord.name, "instrument:", currentGameRound.instrument.name)
        // Add a small delay to ensure UI is fully rendered before playing audio
        setTimeout(() => {
          playChordAudioSafely(currentGameRound.targetChord.name, currentGameRound.instrument.name)
        }, 300)
      }
    }

    // Always update prevGameRoundIdRef to the current round ID for the next render cycle
    prevGameRoundIdRef.current = currentRoundId
  }, [currentGameRound, screenReady])

  // Handle game result and update level-specific stats
  useEffect(() => {
    if (gameResult) {
      setShowResult(true)
      // Hide chords after submitting answer
      setShowChords(false)
      
      // Update level-specific stats for authenticated users (non-blocking)
      if (finalUserId) {
        // Use Redux stats for immediate UI update (no dependency issues)
        const isCorrect = gameResult.isCorrect
        
        // Update persistent storage in background and refresh levelStats when done
        const updateLevelStats = async () => {
          const isWin = gameResult.isCorrect // In regular game, correct answer = win
          
          try {
            const updatedStats = await LevelStatsService.updateUserGameStats(finalUserId, "regularGame", currentLevel, isCorrect, isWin)
            setLevelStats(updatedStats)
          } catch (error) {
            console.error("Failed to update level stats:", error)
          }
        }
        // Don't await this - let it run in background
        updateLevelStats()
      }
    }
  }, [gameResult, finalUserId, currentLevel])


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
  }, [error, errorCode])

  const playChordAudioSafely = async (chordName: string, instrumentName: string) => {
    try {
      setAudioError(null)
      await audioService.playChordAudio(chordName, instrumentName)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown audio error"
      console.error("❌ GameScreen: Chord audio playback failed:", errorMessage)
      setAudioError(errorMessage)
    }
  }

  const handlePlayAgain = async () => {
    if (showChords && currentGameRound?.targetChord?.name && currentGameRound.instrument?.name) {
      // If chords are visible, just replay the chord audio
      console.log("🔄 GameScreen: Replaying chord audio for current round")
      console.log("🔄 GameScreen: Playing chord:", currentGameRound.targetChord.name, "instrument:", currentGameRound.instrument.name)
      await playChordAudioSafely(currentGameRound.targetChord.name, currentGameRound.instrument.name)
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
      setGameInitialized(false) // Allow new game start
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
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
      setGameInitialized(false) // Allow new game start
      dispatch(setCurrentLevel(newLevel))
      dispatch(clearGameResult())
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
    navigation.navigate("RevenueCatScreen" as never)
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
          {/* Stats Row - Using Redux stats for immediate updates */}
          <View className="flex-row justify-center mb-6 gap-x-2">
            <StatCard 
              value={Math.round(currentStats.accuracy) + "%"} 
              label="Accuracy" 
              size="large" 
            />
            <StatCard value={currentLevel.toString()} label="Level" size="large" valueColor="dark" />
            <StatCard 
              value={currentStats.streak.toString()} 
              label="Streaks" 
              size="large" 
            />
            <StatCard
              value="" // Not used when showFraction is true
              label="Correct/Total"
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
        {/* Answer Submission Loader */}
        {isSubmittingAnswer && (
          <View className="px-6 mb-6">
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#003049" />
              <Text className="text-[#003049] text-lg font-semibold ml-3">Submitting answer...</Text>
            </View>
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

// Removed unused styles

export default GameScreen