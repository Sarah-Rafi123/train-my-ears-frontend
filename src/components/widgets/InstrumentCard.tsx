import { TouchableOpacity, Text, View } from "react-native"
import GuitarSvg from "@/src/assets/svgs/Guitar"
import PianoSvg from "@/src/assets/svgs/Piano"

interface InstrumentCardProps {
  instrument: "guitar" | "piano"
  onPress?: () => void
  disabled?: boolean
}

export default function InstrumentCard({ instrument, onPress, disabled = false }: InstrumentCardProps) {
  const getInstrumentIcon = () => {
    return instrument === "guitar" ? <GuitarSvg /> : <PianoSvg />
  }

  const getInstrumentName = () => {
    return instrument === "guitar" ? "Guitar Chord" : "Piano Chord"
  }

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`border rounded-2xl py-5 px-8 mb-4 shadow-sm ${
        disabled 
          ? 'bg-gray-100 border-gray-300 opacity-60' 
          : 'bg-white border-[#00304940] active:bg-gray-50'
      }`}
      accessibilityRole="button"
      accessibilityLabel={disabled ? `${getInstrumentName()} - Not available` : `Select ${getInstrumentName()}`}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <View className="flex-row items-center justify-center">
        <View className={disabled ? 'opacity-50' : ''}>
          {getInstrumentIcon()}
        </View>
        <Text className={`text-xl font-semibold ml-4 ${
          disabled ? 'text-gray-400' : 'text-[#003049]'
        }`}>
          {getInstrumentName()}
        </Text>
        {disabled && (
          <Text className="text-gray-400 text-sm ml-2">(Loading...)</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}