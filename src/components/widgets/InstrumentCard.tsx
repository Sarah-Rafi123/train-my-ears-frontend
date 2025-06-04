import { TouchableOpacity, Text, View } from "react-native"
import { Feather } from "@expo/vector-icons"

interface InstrumentCardProps {
  instrument: "guitar" | "piano"
  onPress?: () => void
}

export default function InstrumentCard({ instrument, onPress }: InstrumentCardProps) {
  const getInstrumentIcon = () => {
    return instrument === "guitar" ? "music" : "piano"
  }

  const getInstrumentName = () => {
    return instrument === "guitar" ? "Guitar Chords" : "Piano Chords"
  }

  const getIconColor = () => {
    return instrument === "guitar" ? "#DC2626" : "#1F2937"
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border-2 border-gray-200 rounded-full py-5 px-8 mb-4 shadow-sm active:bg-gray-50"
      accessibilityRole="button"
      accessibilityLabel={`Select ${getInstrumentName()}`}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        <Feather name={getInstrumentIcon()} size={28} color={getIconColor()} />
        <Text className="text-[#003049] text-xl font-semibold ml-4">{getInstrumentName()}</Text>
      </View>
    </TouchableOpacity>
  )
}
