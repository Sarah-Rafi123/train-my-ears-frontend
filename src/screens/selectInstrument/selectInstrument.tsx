import { View, Text, ScrollView } from "react-native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import InstrumentCard from "@/src/components/widgets/InstrumentCard"

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
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center mt-10 px-6 pb-8">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-slate-800 text-xl font-semibold text-center mt-5 mr-10">Select an Instrument</Text>
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-8">
          <InstrumentCard instrument="guitar" onPress={() => handleInstrumentSelect("guitar")} />
          <InstrumentCard instrument="piano" onPress={() => handleInstrumentSelect("piano")} />
        </View>
      </ScrollView>
    </View>
  )
}
