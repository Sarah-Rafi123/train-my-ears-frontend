"use client"

import { View, Text, SafeAreaView, Image, Alert, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { useAuth } from "@/src/context/AuthContext"
import BackButton from "@/src/components/ui/buttons/BackButton"
import InstrumentCard from "@/src/components/widgets/InstrumentCard"
import { instrumentsApi, type Instrument } from "@/src/services/instrumentApi"

// Import your musical background image
import musicbg from "@/src/assets/images/musicbg.png"

interface SelectInstrumentScreenProps {
  onBack?: () => void
  onInstrumentSelect?: (instrument: "guitar" | "piano") => void
}

export default function SelectInstrumentScreen({ onBack, onInstrumentSelect }: SelectInstrumentScreenProps) {
  const navigation = useNavigation()

  // Get data from auth context
  const { guitarId, pianoId, userId, token, setGuitarId, setPianoId } = useAuth()

  // Local state for instruments
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch instruments when component mounts
  useEffect(() => {
    fetchInstruments()
  }, [])

  const fetchInstruments = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🎵 SelectInstrumentScreen: Fetching instruments...")

      const response = await instrumentsApi.getInstruments()

      if (response.success && response.data.instruments) {
        setInstruments(response.data.instruments)
        console.log("✅ SelectInstrumentScreen: Instruments loaded successfully")

        // Store instrument IDs in context
        const guitarInstrument = response.data.instruments.find(
          (instrument) => instrument.name.toLowerCase() === "guitar",
        )
        const pianoInstrument = response.data.instruments.find(
          (instrument) => instrument.name.toLowerCase() === "piano",
        )

        if (guitarInstrument && !guitarId) {
          await setGuitarId(guitarInstrument.id)
          console.log("🎸 SelectInstrumentScreen: Guitar ID stored:", guitarInstrument.id)
        }

        if (pianoInstrument && !pianoId) {
          await setPianoId(pianoInstrument.id)
          console.log("🎹 SelectInstrumentScreen: Piano ID stored:", pianoInstrument.id)
        }
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load instruments"
      setError(errorMessage)
      console.error("❌ SelectInstrumentScreen: Error fetching instruments:", errorMessage)

      // Show error to user in development mode
      if (__DEV__) {
        Alert.alert("Error", `Failed to load instruments: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInstrumentSelect = async (instrument: "guitar" | "piano") => {
    console.log(`🎯 SelectInstrumentScreen: Selected instrument: ${instrument}`)

    // Call the optional callback
    onInstrumentSelect?.(instrument)

    // Get the appropriate instrument ID from context
    let selectedInstrumentId: string | null = null

    if (instrument === "guitar") {
      selectedInstrumentId = guitarId
      console.log("🎸 Selected Guitar ID:", guitarId || "Not yet loaded")
    } else if (instrument === "piano") {
      selectedInstrumentId = pianoId
      console.log("🎹 Selected Piano ID:", pianoId || "Not yet loaded")
    }

    // If instrument ID is not available, try to get it from the loaded instruments
    if (!selectedInstrumentId && instruments.length > 0) {
      const foundInstrument = instruments.find((inst) => inst.name.toLowerCase() === instrument)
      if (foundInstrument) {
        selectedInstrumentId = foundInstrument.id
        console.log(`🎼 Found ${instrument} ID from loaded instruments:`, selectedInstrumentId)

        // Store it in context for future use
        if (instrument === "guitar") {
          await setGuitarId(selectedInstrumentId)
        } else if (instrument === "piano") {
          await setPianoId(selectedInstrumentId)
        }
      }
    }

    // Log all available data for debugging
    if (__DEV__) {
      console.log("🔍 SelectInstrumentScreen: Debug info:")
      console.log("  - User ID:", userId || "Not logged in")
      console.log("  - Token:", token ? "Available" : "Not available")
      console.log("  - Selected Instrument ID:", selectedInstrumentId || "Not available")
      console.log("  - All instruments loaded:", instruments.length)
    }

    // Navigate to different screens based on instrument selection
    if (instrument === "guitar") {
      navigation.navigate("Game" as never, {
        instrument: "guitar",
        instrumentId: selectedInstrumentId || undefined,
        userId: userId || undefined,
      })
    } else if (instrument === "piano") {
      navigation.navigate("Game" as never, {
        instrument: "piano",
        instrumentId: selectedInstrumentId || undefined,
        userId: userId || undefined,
      })
    }
  }

  const __DEV__ = Platform.OS !== "production"

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center mt-8 px-6 py-8">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-[#003049] text-lg font-semibold text-center mt-5 mr-10">Select an Instrument</Text>
        </View>
      </View>

      {/* Musical background image at the top */}
      <View className="h-64 w-full mt-28">
        <Image source={musicbg} className="w-full h-full" resizeMode="contain" />
      </View>

      {/* Content below the image */}
      <View className="flex-1 px-6 pt-8">
        <View className="mb-8 mt-auto">
          <Text className="text-[#003049] text-3xl font-bold  mb-4">Train My Ear</Text>
          <Text className="text-[#003049] text-base">A simple tool to help recognize chords by ear.</Text>
        </View>

        {/* Loading state */}
        {loading && (
          <View className="mb-16 items-center">
            <Text className="text-[#003049] text-lg">Loading instruments...</Text>
          </View>
        )}

        {/* Error state */}
        {error && !loading && (
          <View className="mb-16 items-center">
            <Text className="text-red-500 text-lg text-center mb-4">Failed to load instruments</Text>
            <Text className="text-gray-600 text-center mb-4">{error}</Text>
            <Text className="text-[#006AE6] text-lg font-semibold" onPress={fetchInstruments}>
              Retry
            </Text>
          </View>
        )}

        {/* Instrument cards */}
        {!loading && !error && (
          <View className="mb-16">
            <InstrumentCard instrument="guitar" onPress={() => handleInstrumentSelect("guitar")} />
            <InstrumentCard instrument="piano" onPress={() => handleInstrumentSelect("piano")} />
          </View>
        )}

        {/* Debug info (only in development) */}
        {/* {__DEV__ && (
          <View className="mb-4 p-4 bg-gray-100 rounded">
            <Text className="text-xs text-gray-600">Debug Info:</Text>
            <Text className="text-xs text-gray-600">Guitar ID: {guitarId || "Not loaded yet"}</Text>
            <Text className="text-xs text-gray-600">Piano ID: {pianoId || "Not loaded yet"}</Text>
            <Text className="text-xs text-gray-600">User ID: {userId || "Not logged in"}</Text>
            <Text className="text-xs text-gray-600">Instruments loaded: {instruments.length}</Text>
            <Text className="text-xs text-gray-600">Loading: {loading ? "Yes" : "No"}</Text>
            <Text className="text-xs text-gray-600">Error: {error || "None"}</Text>
          </View>
        )} */}
      </View>
    </SafeAreaView>
  )
}
