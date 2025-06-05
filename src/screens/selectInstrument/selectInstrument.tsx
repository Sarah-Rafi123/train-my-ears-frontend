import { View, Text, SafeAreaView, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import InstrumentCard from "@/src/components/widgets/InstrumentCard"

// Import your musical background image
import musicbg from "@/src/assets/images/musicbg.png"

interface SelectInstrumentScreenProps {
  onBack?: () => void
  onInstrumentSelect?: (instrument: "guitar" | "piano") => void
}

export default function SelectInstrumentScreen({ onBack, onInstrumentSelect }: SelectInstrumentScreenProps) {
  const navigation = useNavigation()

  const handleInstrumentSelect = (instrument: "guitar" | "piano") => {
    console.log(`Selected instrument: ${instrument}`)

    // Call the optional callback
    onInstrumentSelect?.(instrument)

    // Navigate to different screens based on instrument selection
    if (instrument === "guitar") {
      navigation.navigate("Game" as never, { instrument: "guitar" })
    } else if (instrument === "piano") {
      navigation.navigate("Game" as never, { instrument: "piano" })
    }

    // Alternative: Navigate to the same screen but pass the instrument as a parameter
    // navigation.navigate("Game" as never, { selectedInstrument: instrument })
  }

  return (
    <SafeAreaView className="flex-1  bg-white">
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
          <Text className="text-[#003049] text-3xl font-bold text-center mb-4">SELECT AN INSTRUMENT</Text>
          <Text className="text-[#003049] text-lg text-center">Select which instrument you want to learn.</Text>
        </View>

        <View className="mb-16">
          <InstrumentCard instrument="guitar" onPress={() => handleInstrumentSelect("guitar")} />
          <InstrumentCard instrument="piano" onPress={() => handleInstrumentSelect("piano")} />
        </View>
      </View>
    </SafeAreaView>
  )
}
