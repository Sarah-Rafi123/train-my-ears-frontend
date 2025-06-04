import { View, Text, SafeAreaView, Image } from "react-native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import InstrumentCard from "@/src/components/widgets/InstrumentCard"
import musicbg from "@/src/assets/images/musicbg.png"

interface SelectInstrumentScreenProps {
  onBack?: () => void
  onInstrumentSelect?: (instrument: "guitar" | "piano") => void
}

export default function SelectInstrumentScreen({ onBack, onInstrumentSelect }: SelectInstrumentScreenProps) {
  const handleInstrumentSelect = (instrument: "guitar" | "piano") => {
    console.log(`Selected instrument: ${instrument}`)
    onInstrumentSelect?.(instrument)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-6 py-4">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-[#003049] text-lg font-semibold text-center mr-10">Select an Instrument</Text>
        </View>
      </View>
      <View className="h-64 mt-20 w-full">
        <Image source={musicbg} className="w-full h-full" resizeMode="contain" />
      </View>

      {/* Content below the image */}
      <View className="flex mt-auto px-6 pt-8">
        <View className="mb-8">
          <Text className="text-[#003049] text-3xl font-bold text-center mb-4">SELECT AN INSTRUMENT</Text>
          <Text className="text-[#003049] text-lg text-center">Select which instrument you want to learn.</Text>
        </View>

        <View className="mb-8">
          <InstrumentCard instrument="guitar" onPress={() => handleInstrumentSelect("guitar")} />
          <InstrumentCard instrument="piano" onPress={() => handleInstrumentSelect("piano")} />
        </View>
        <View className="w-32 h-1 bg-black rounded-full self-center mb-8" />
      </View>
    </SafeAreaView>
  )
}
