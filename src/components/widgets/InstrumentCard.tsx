import { TouchableOpacity, Text, View } from "react-native"
import GuitarSvg from "@/src/assets/svgs/Guitar"
import PianoSvg from "@/src/assets/svgs/Piano"

interface InstrumentCardProps {
  instrument: "guitar" | "piano"
  onPress?: () => void
}

export default function InstrumentCard({ instrument, onPress }: InstrumentCardProps) {
  const getInstrumentIcon = () => {
    return instrument === "guitar" ? <GuitarSvg /> : <PianoSvg />
  }

  const getInstrumentName = () => {
    return instrument === "guitar" ? "Guitar Chords" : "Piano Chords"
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-[#00304940] rounded-2xl py-5 px-8 mb-4 shadow-sm active:bg-gray-50"
      accessibilityRole="button"
      accessibilityLabel={`Select ${getInstrumentName()}`}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        {getInstrumentIcon()}
        <Text className="text-[#003049] text-xl font-semibold ml-4">{getInstrumentName()}</Text>
      </View>
    </TouchableOpacity>
  )
}
