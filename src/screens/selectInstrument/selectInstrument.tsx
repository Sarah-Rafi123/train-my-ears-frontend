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
      console.log("🎸 Selected Guitar ID:","cmbyuwdi00002qlhguosiz78c")
    } else if (instrument === "piano") {
      selectedInstrumentId = pianoId
      console.log("🎹 Selected Piano ID:","cmbyuwdi20003qlhg0w2epml0")
    }

    // If instrument ID is not available, try to get it from the loaded instruments
    if (!selectedInstrumentId && instruments.length > 0) {
      const foundInstrument = instruments.find((inst) => inst.name.toLowerCase() === instrument)
      if (foundInstrument) {
        selectedInstrumentId = foundInstrument.id
        console.log(`🎼 Found ${instrument} ID from loaded instruments:`, selectedInstrumentId)

        // Store it in context for future use
        if (instrument === "guitar") {
          await setGuitarId("cmbyuwdi00002qlhguosiz78c")
        } else if (instrument === "piano") {
          await setPianoId("cmbyuwdi00002qlhguosiz78c")
        }
      }
    }
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


  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center mt-8 px-6 py-8">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-[#003049] text-lg font-semibold text-center mt-5 mr-10">Select an Instrument</Text>
        </View>
      </View>
      <View className="h-64 w-full mt-28">
        <Image source={musicbg} className="w-full h-full" resizeMode="contain" />
      </View>
      <View className="flex-1 px-6 pt-8">
        <View className="mb-8 mt-auto">
          <Text className="text-[#003049] font-sans text-3xl text-center font-bold  mb-4">TRAIN MY EAR</Text>
          <Text className="text-[#003049] text-center font-sans text-2xl">A simple tool to help recognize chords by ear.</Text>
        </View>
        {loading && (
          <View className="mb-16 items-center">
            <Text className="text-[#003049] text-lg">Loading instruments...</Text>
          </View>
        )}
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
      </View>
    </SafeAreaView>
  )
}
