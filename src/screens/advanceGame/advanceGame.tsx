"use client"
import { View, Text, ScrollView, ActivityIndicator, Dimensions , TouchableOpacity } from "react-native"
import { useState, useEffect, useRef } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { useAuth } from "@/src/context/AuthContext"
import { useSelector } from "react-redux"
import type { RootState } from "@/src/store/store"
import {
  startAdvancedGame,
  submitSequence,
  clearError,
  setCurrentLevel,
  addToSequence,
  removeFromSequence,
  clearRoundData, // Import the new action
  resetGame, // Import resetGame
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
import { Feather } from "@expo/vector-icons"
import StatCard from "@/src/components/widgets/StatsCard"
// Import the debounce function at the top of the file
import { debounce } from "@/src/lib/utils"
import { LevelStatsService, type LevelStats } from "@/src/services/levelStatsService"
import { BASE_URL } from "@/src/constants/urls.constant"
import GameSkeleton from "@/src/components/ui/skeletons/GameSkeleton"

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

  // Get auth data and selected instrument from Redux
  const { userId, guitarId, pianoId } = useAuth()
  const selectedInstrumentId = useSelector((state: RootState) => state.instruments.selectedInstrumentId)
  const instruments = useSelector((state: RootState) => state.instruments.instruments)
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
  const [isPlayingSequence, setIsPlayingSequence] = useState(false) // Initialize to false
  // Remove unused variables for advanced game since they're not used

  // Use simpler state tracking instead of complex refs
  const [isInitializing, setIsInitializing] = useState(true) // Start as true to prevent "Unable to load" message
  const [hasInitialized, setHasInitialized] = useState(false)
  // Add API call prevention state
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false)
  
  // Level-specific stats state for authenticated users
  const [levelStats, setLevelStats] = useState<LevelStats | null>(null)

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

  // Determine instrument ID - prioritize Redux store selection
  let finalInstrumentId = selectedInstrumentId || instrumentIdFromRoute
  
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
    if (guitarId) {
      finalInstrumentId = guitarId
      console.log("🎸 AdvancedGameScreen: Using default guitar ID:", guitarId)
    } else if (pianoId) {
      finalInstrumentId = pianoId
      console.log("🎹 AdvancedGameScreen: Using default piano ID:", pianoId)
    }
  }

  // Determine instrument name for logging
  const getSelectedInstrumentName = () => {
    if (selectedInstrumentId && instruments.length > 0) {
      const instrument = instruments.find(inst => inst.id === selectedInstrumentId)
      return instrument?.name || 'Unknown'
    }
    return instrumentFromRoute || 'Unknown'
  }

  // Use IDs from route params or context (userId can be null for guest mode)
  const finalUserId = userIdFromRoute || userId || null

  // Log the final IDs being used
  console.log("🎮 AdvancedGameScreen: Final IDs determined:", {
    userId: finalUserId,
    instrumentId: finalInstrumentId,
    selectedFromRedux: selectedInstrumentId,
    instrumentName: getSelectedInstrumentName(),
    instrument: instrumentFromRoute,
    guitarIdFromContext: guitarId,
    pianoIdFromContext: pianoId,
    isGuestMode: !finalUserId,
  })

  // Load level-specific stats for authenticated users
  useEffect(() => {
    if (finalUserId) {
      const loadLevelStats = async () => {
        const stats = await LevelStatsService.loadUserLevelStats(finalUserId, "advancedGame", currentLevel)
        setLevelStats(stats)
        console.log("📊 AdvancedGameScreen: Loaded level stats:", stats)
      }
      loadLevelStats()
    }
  }, [finalUserId, currentLevel])

  // Component mount effect to reset state
  useEffect(() => {
    console.log("🎮 AdvancedGameScreen: Component mounted, resetting state...")
    // Clear any previous game state
    dispatch(clearRoundData())
    audioService.stopAudio()
    
    return () => {
      audioService.stopAudio()
    }
  }, [dispatch])

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

  // Updated initialization logic to work without userId requirement and handle user changes
  useEffect(() => {
    const initializeGame = async () => {
      // Check if we have the required instrumentId
      if (!finalInstrumentId) {
        console.error("❌ Missing required instrumentId for game initialization")
        setIsInitializing(false) // Stop loading since we can't proceed
        setShowGameErrorModal(true)
        return
      }

      // Only initialize if we haven't already initialized and aren't in the middle of an API call
      if (!hasInitialized && !isApiCallInProgress && !currentGameRound) {
        console.log("🎮 AdvancedGameScreen: Initializing game for level:", currentLevel, {
          isGuestMode: !finalUserId,
          userId: finalUserId,
        })
        
        // Check subscription status for authenticated users at level 3+
        if (finalUserId && currentLevel >= 3) {
          const hasActiveSubscription = await checkSubscriptionStatus(finalUserId)
          if (!hasActiveSubscription) {
            console.log("🚫 AdvancedGameScreen: Subscription required for level 3+ during initialization")
            setIsInitializing(false)
            setShowSubscriptionModal(true)
            return
          }
        }
        
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
      } else if (currentGameRound) {
        // If we already have a game round, stop initializing
        setIsInitializing(false)
      }
    }
    
    initializeGame()
  }, [
    finalUserId,
    finalInstrumentId,
    currentLevel,
    dispatch,
    hasInitialized,
    isApiCallInProgress,
    currentGameRound,
  ])

  // Simple effect to reset initialization when user changes (no circular deps)
  const prevUserIdRef = useRef(finalUserId)
  useEffect(() => {
    if (prevUserIdRef.current !== finalUserId && hasInitialized) {
      console.log("🔄 AdvancedGameScreen: User changed, resetting initialization state")
      setHasInitialized(false)
      dispatch(clearRoundData()) // Clear any existing game data
    }
    prevUserIdRef.current = finalUserId
  }, [finalUserId, hasInitialized, dispatch])

  // Component unmount cleanup effect - separated to avoid infinite loops
  useEffect(() => {
    // This cleanup function runs only when the component is unmounted
    return () => {
      console.log("🧹 AdvancedGameScreen: Component unmounting - clearing session")
      dispatch(clearRoundData()) // Use clearRoundData instead of resetGame to avoid infinite loops
      audioService.stopAudio()
    }
  }, []) // Empty dependency array ensures this only runs on mount/unmount

  // Updated startNewGame to work without userId requirement
  const startNewGame = async (levelToUse: number) => {
    if (!finalInstrumentId || isInitializing || isApiCallInProgress) {
      console.log("🔄 Cannot start game: missing instrumentId or already initializing/API call in progress")
      return
    }
    console.log("🎮 Starting new game at level:", levelToUse, {
      isGuestMode: !finalUserId,
    })
    
    // Check subscription status for authenticated users at level 3+
    if (finalUserId && levelToUse >= 3) {
      const hasActiveSubscription = await checkSubscriptionStatus(finalUserId)
      if (!hasActiveSubscription) {
        console.log("🚫 AdvancedGameScreen: Subscription required for level 3+ in new game")
        setShowSubscriptionModal(true)
        return
      }
    }
    
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

  // Handle game result and update level-specific stats
  useEffect(() => {
    if (gameResult) {
      setShowResult(true)
      
      // Update level-specific stats for authenticated users
      if (finalUserId) {
        const updateLevelStats = async () => {
          // For advanced game, calculate individual chord correctness
          let correctChords = 0
          if (gameResult.sequenceComparison) {
            correctChords = gameResult.sequenceComparison.filter(comp => comp.correct).length
          }
          
          const sequenceLength = currentGameRound?.sequenceLength || 1
          
          // Get current level stats to manually update them
          const currentLevelStats = await LevelStatsService.getUserLevelStats(finalUserId, "advancedGame", currentLevel)
          
          // Calculate updates manually for advanced game logic (same as guest mode)
          const newTotalAttempts = currentLevelStats.totalAttempts + sequenceLength // Each chord = 1 attempt
          const newCorrectAnswers = currentLevelStats.correctAnswers + correctChords // Individual correct chords
          const newWins = currentLevelStats.wins + correctChords // Each correct chord counts as a win
          const newAccuracy = newTotalAttempts > 0 ? Math.round((newCorrectAnswers / newTotalAttempts) * 100) : 0
          
          // Handle streak logic
          const today = new Date().toISOString().split("T")[0]
          const lastPlayedDate = currentLevelStats.lastPlayedDate
          let newStreak = currentLevelStats.streak
          
          if (lastPlayedDate) {
            const lastPlayed = new Date(lastPlayedDate)
            const todayDate = new Date(today)
            const daysDifference = Math.floor((todayDate.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))
            
            if (daysDifference === 0) {
              // Same day, keep streak
              newStreak = currentLevelStats.streak
            } else if (daysDifference === 1 && correctChords > 0) {
              // Next day and got at least one chord correct, increment streak
              newStreak = currentLevelStats.streak + 1
            } else if (daysDifference > 1 || correctChords === 0) {
              // Skipped days or got no chords correct, reset streak
              newStreak = correctChords > 0 ? 1 : 0
            }
          } else {
            // First time playing this level
            newStreak = correctChords > 0 ? 1 : 0
          }
          
          // Store the updated stats manually
          await LevelStatsService.storeUserLevelStats(finalUserId, "advancedGame", currentLevel, {
            accuracy: newAccuracy,
            streak: newStreak,
            totalAttempts: newTotalAttempts,
            correctAnswers: newCorrectAnswers,
            wins: newWins,
          })
          
          // Create updated level stats object for local state
          const updatedStats = {
            accuracy: newAccuracy,
            streak: newStreak,
            totalAttempts: newTotalAttempts,
            correctAnswers: newCorrectAnswers,
            wins: newWins,
            lastPlayedDate: today,
            level: currentLevel,
          }
          
          setLevelStats(updatedStats)
          
          console.log("🎯 Advanced game result with updated level stats:", {
            fullSequenceCorrect: gameResult.isCorrect,
            correctChords,
            sequenceLength,
            chordWins: correctChords,
            level: currentLevel,
            updatedStats,
            isGuestMode: false,
          })
        }
        updateLevelStats()
      } else {
        // Log for guest mode (handled by guest screens)
        console.log("🎯 Advanced game result received (guest mode):", {
          isCorrect: gameResult.isCorrect,
          streak: gameResult.stats.streak,
          accuracy: currentStats.accuracy,
          totalAttempts: currentStats.totalAttempts,
          correctAnswers: currentStats.correctAnswers,
          isGuestMode: true,
          correctSequenceData: gameResult.correctSequence,
          sequenceComparisonData: gameResult.sequenceComparison,
        })
      }
    }
  }, [gameResult, finalUserId, currentLevel, currentGameRound])

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

  // Effect to reset UI states when a new round loads
  useEffect(() => {
    const currentRoundId = currentGameRound?.gameSessionId || null

    if (currentGameRound) {
      // Reset UI states for a new round
      setShowResult(false)
      // Reset the last played round ID so audio can be played manually
      lastPlayedRoundIdRef.current = null
    }

    // Always update prevGameRoundIdRef to the current round ID for the next render cycle
    prevGameRoundIdRef.current = currentRoundId
  }, [currentGameRound]) // Only depend on currentGameRound

  // Removed automatic audio playback - audio will only play when user clicks "Play Sequence" button

  // Removed playAudioSafely function as it's not used in advanced game

  // Updated the playSequenceAudio function to use local assets like game.tsx
  const playSequenceAudio = async () => {
    if (!currentGameRound?.targetSequence || isPlayingSequence) return
    try {
      setIsPlayingSequence(true)
      setAudioError(null)
      console.log("🎵 AdvancedGameScreen: Playing sequence audio using local assets...")
      
      // Sort the target sequence by position to play chords in the right order
      const sortedSequence = [...currentGameRound.targetSequence].sort((a, b) => a.position - b.position)
      console.log("🎵 AdvancedGameScreen: Chords to play:", sortedSequence.map(chord => chord.name))
      
      // Get instrument name from current game round
      const instrumentName = currentGameRound.instrument?.name
      if (!instrumentName) {
        throw new Error("No instrument name found in current game round")
      }
      
      for (let i = 0; i < sortedSequence.length; i++) {
        const chord = sortedSequence[i]
        console.log(`🎵 Playing chord ${i + 1}/${sortedSequence.length}:`, chord.name, "on", instrumentName)
        
        try {
          await audioService.playChordAudio(chord.name, instrumentName)
        } catch (audioError) {
          console.error(`❌ Error playing chord ${i + 1} (${chord.name}):`, audioError)
          // Try to continue with next chord instead of stopping the whole sequence
          if (i < sortedSequence.length - 1) {
            setAudioError(`Error playing chord ${i + 1} (${chord.name}). Continuing with next chord.`)
          } else {
            setAudioError(`Error playing chord ${i + 1} (${chord.name}).`)
          }
        }
        // Wait a bit between audio files
        if (i < sortedSequence.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
      console.log("✅ AdvancedGameScreen: Sequence audio playback completed using local assets")
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

  // Updated handleLevelDown to store stats before changing levels
  const handleLevelDown = async () => {
    if (currentLevel > 1 && finalInstrumentId) {
      const newLevel = currentLevel - 1
      
      // Store current level stats before changing levels (for authenticated users)
      if (finalUserId && levelStats && currentStats) {
        await LevelStatsService.storeUserLevelStats(finalUserId, "advancedGame", currentLevel, {
          accuracy: currentStats.accuracy,
          streak: currentStats.streak,
          totalAttempts: currentStats.totalAttempts,
          correctAnswers: currentStats.correctAnswers,
          wins: levelStats.wins,
        })
        console.log("📊 AdvancedGameScreen: Stored current level stats before level down")
      }
      
      console.log("📉 AdvancedGameScreen: Level down to:", newLevel, {
        isGuestMode: !finalUserId,
      })
      setHasInitialized(false) // Reset initialization flag
      startNewGame(newLevel)
    }
  }

  // Check user's subscription status via API
  const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
    try {
      console.log("🔍 AdvancedGameScreen: Checking subscription status for user:", userId)
      const response = await fetch(`${BASE_URL}api/subscription/status/${userId}`)
      const result = await response.json()
      
      if (!response.ok) {
        console.error("❌ AdvancedGameScreen: Subscription API error:", result)
        return false
      }
      
      const hasActiveSubscription = result.data?.hasActiveSubscription || false
      console.log("💳 AdvancedGameScreen: Subscription status:", hasActiveSubscription ? "Active" : "Inactive")
      return hasActiveSubscription
    } catch (error) {
      console.error("❌ AdvancedGameScreen: Error checking subscription status:", error)
      return false
    }
  }

  // Updated handleLevelUp to properly check subscription status
  const handleLevelUp = async () => {
    if (currentLevel < 4 && finalInstrumentId) {
      const newLevel = currentLevel + 1
      console.log("📈 AdvancedGameScreen: Attempting level up to:", newLevel, {
        isGuestMode: !finalUserId,
      })
      
      // For guest users, show subscription modal for level 3+ (same as game.tsx)
      if (!finalUserId && newLevel >= 3) {
        console.log("🚫 AdvancedGameScreen: Subscription required for guest users at level 3+")
        setShowSubscriptionModal(true)
        return
      }
      
      // For authenticated users, check actual subscription status for level 3+
      if (finalUserId && newLevel >= 3) {
        const hasActiveSubscription = await checkSubscriptionStatus(finalUserId)
        if (!hasActiveSubscription) {
          console.log("🚫 AdvancedGameScreen: Active subscription required for level 3+")
          setShowSubscriptionModal(true)
          return
        }
      }
      
      // Store current level stats before changing levels (for authenticated users)
      if (finalUserId && levelStats && currentStats) {
        await LevelStatsService.storeUserLevelStats(finalUserId, "advancedGame", currentLevel, {
          accuracy: currentStats.accuracy,
          streak: currentStats.streak,
          totalAttempts: currentStats.totalAttempts,
          correctAnswers: currentStats.correctAnswers,
          wins: levelStats.wins,
        })
        console.log("📊 AdvancedGameScreen: Stored current level stats before level up")
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
    // Fix navigation type issue by using proper typing
    const nav = navigation as any
    nav.navigate("Menu", {
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
    const nav = navigation as any
    nav.navigate("Register")
  }

  const handleSubscriptionUpgrade = () => {
    setShowSubscriptionModal(false)
    dispatch(clearError())
    console.log("💳 AdvancedGameScreen: Navigating to subscription screen")
    const nav = navigation as any
    nav.navigate("RevenueCatScreen")
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
  const getSequenceIndicators = (): {
    type: "success" | "error" | "empty" | "filled"
    chordText?: string
    showIcon?: boolean
  }[] => {
    if (!currentGameRound) return []
    const indicators: {
      type: "success" | "error" | "empty" | "filled"
      chordText?: string
      showIcon?: boolean
    }[] = []

    if (showResult && gameResult && gameResult.correctSequence) {
      // Sort correct sequence to ensure correct order for display
      const sortedCorrectSequence = [...gameResult.correctSequence].sort((a, b) => a.position - b.position)

      for (let i = 0; i < currentGameRound.sequenceLength; i++) {
        const correctChord = sortedCorrectSequence[i] // Get chord by index after sorting
        // Find comparison by position, or default to an incorrect comparison if not found
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
            // Fallback: If correctChord exists but no comparison for this position, assume it's an error
            // This might indicate an issue with the sequenceComparison data from the API
            type = "error"
            showIcon = true
          }
        } else {
          // This case means correctSequence is shorter than sequenceLength, or data is missing for this position
          type = "empty"
          showIcon = false
        }
        indicators.push({ type, chordText, showIcon })
      }
    } else {
      // Original logic for when not showing result (during user selection)
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

  // Organize sequence indicators into rows (max 6 per row)
  const organizeIndicatorRows = (indicators: {
    type: "success" | "error" | "empty" | "filled"
    chordText?: string
    showIcon?: boolean
  }[]) => {
    const rows = []
    const indicatorsPerRow = 6
    
    for (let i = 0; i < indicators.length; i += indicatorsPerRow) {
      rows.push(indicators.slice(i, i + indicatorsPerRow))
    }
    return rows
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
        <GameSkeleton />
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
        {audioError && (
          <View className="mx-6 mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <Text className="text-yellow-800 text-sm">⚠️ Audio playback issue: {audioError}</Text>
          </View>
        )}
        <View className="bg-[#E5EAED80] rounded-3xl m-4">
          {/* Stats Row - Using level-specific stats for authenticated users */}
          <View className="flex-row justify-between mb-8 gap-x-1">
            <StatCard 
              value={levelStats?.accuracy?.toFixed(1) + "%" || currentStats.accuracy.toFixed(1) + "%"} 
              label="Accuracy" 
              size="large" 
            />
            <StatCard value={currentLevel.toString()} label="Level" size="large" />
            <StatCard 
              value={levelStats?.streak?.toString() || currentStats.streak.toString()} 
              label="Streaks" 
              size="large" 
            />
            <StatCard
              showFraction={true}
              numerator={levelStats?.correctAnswers || currentStats.correctAnswers}
              denominator={levelStats?.totalAttempts || currentStats.totalAttempts}
              label="Correct/Total"
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
          <View className="mb-8">
            {organizeIndicatorRows(getSequenceIndicators()).map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-center gap-x-1 mb-2">
                {row.map((indicator, index) => {
                  const globalIndex = rowIndex * 6 + index
                  return (
                    <TouchableOpacity
                      key={globalIndex}
                      onPress={() => handleSequenceItemRemove(globalIndex)}
                      disabled={showResult || !indicator.chordText}
                    >
                      <CircularIndicator
                        type={indicator.type}
                        size={42}
                        chordText={indicator.chordText}
                        showIcon={indicator.showIcon}
                      />
                    </TouchableOpacity>
                  )
                })}
              </View>
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
            {/* Define correctSequenceDisplay here */}
            {(() => {
              const correctSequenceDisplay =
                gameResult.correctSequence && Array.isArray(gameResult.correctSequence)
                  ? gameResult.correctSequence
                      .sort((a, b) => a.position - b.position)
                      .map((chord) => formatChordForSequence(chord.name))
                      .join(" → ")
                  : "N/A" // Fallback if correctSequence is not an array or is null/undefined

              return (
                <Text
                  className={`text-2xl font-bold text-center mb-4 ${gameResult.isCorrect ? "text-green-600" : "text-red-600"}`}
                >
                  {gameResult.isCorrect ? "Perfect Sequence!" : `Sorry, the sequence was: ${correctSequenceDisplay}`}
                </Text>
              )
            })()}
            {/* The commented-out block below is no longer needed as the sequence is now integrated into the main message */}
            {/*
            {gameResult.correctSequence && gameResult.correctSequence.length > 0 && (
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <Text className="text-black text-lg font-semibold text-center mb-2">
                  {gameResult.isCorrect ? "Your Answer:" : "Correct Sequence:"}
                </Text>
                <Text className="text-black text-base text-center leading-6">
                  {gameResult.correctSequence
                    ?.sort((a, b) => a.position - b.position)
                    .map((chord) => formatChordForSequence(chord.name))
                    .join(" → ")}
                </Text>
              </View>
            )}
            */}
          </View>
        )}
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
        {/* Extra space to ensure content doesn't get hidden behind fixed button */}
        <View className="h-32" />
      </ScrollView>
      {/* Fixed Bottom Section */}
      <View className="px-6 pb-8 pt-4 items-center justify-center bg-white">
        <MoreDetailsButton onPress={handleMoreDetails} />
        {/* Only show Save Progress for logged-in users */}
        {!finalUserId && <SaveProgressButton onPress={handleSaveProgress} />}
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

// Removed unused styles