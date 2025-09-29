import { TouchableOpacity, Text, View, Dimensions } from "react-native"
import GuitarSvg from "@/src/assets/svgs/Guitar"
import PianoSvg from "@/src/assets/svgs/Piano"

interface InstrumentCardProps {
  instrument: "guitar" | "piano"
  onPress?: () => void
  disabled?: boolean
}

export default function InstrumentCard({ instrument, onPress, disabled = false }: InstrumentCardProps) {
  const screenWidth = Dimensions.get("window").width
  const BASE_WIDTH = 375
  const scaleFactor = screenWidth / BASE_WIDTH
  const isTablet = screenWidth > 600
  const responsiveValue = (value: number) => {
    const scaled = Math.round(value * scaleFactor)
    // On tablets, cap the scaling to keep buttons smaller
    return isTablet ? Math.min(scaled, value * 1.1) : scaled
  }

  const getInstrumentIcon = () => {
    // Bigger icons for phones, smaller for tablets
    const iconSize = isTablet ? responsiveValue(20) : responsiveValue(28)
    return instrument === "guitar" ? (
      <GuitarSvg />
    ) : (
      <PianoSvg />
    )
  }

  const getInstrumentName = () => {
    return instrument === "guitar" ? "Guitar Chord" : "Piano Chord"
  }

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`border shadow-sm ${
        disabled ? "bg-gray-100 border-gray-300 opacity-60" : "bg-white border-[#00304940] active:bg-gray-50"
      }`}
      accessibilityRole="button"
      accessibilityLabel={disabled ? `${getInstrumentName()} - Not available` : `Select ${getInstrumentName()}`}
      activeOpacity={disabled ? 1 : 0.8}
      style={{
        borderRadius: responsiveValue(8),
        paddingVertical: isTablet ? responsiveValue(8) : responsiveValue(18),
        paddingHorizontal: isTablet ? responsiveValue(16) : responsiveValue(32),
        marginBottom: isTablet ? responsiveValue(8) : responsiveValue(16),
      }}
    >
      <View className="flex-row items-center justify-center">
        <View className={disabled ? "opacity-50" : ""}>{getInstrumentIcon()}</View>
        <Text
          className={`font-semibold ml-4 ${disabled ? "text-gray-400" : "text-[#003049]"}`}
          style={{
            fontSize: isTablet ? responsiveValue(14) : responsiveValue(20),
            marginLeft: isTablet ? responsiveValue(8) : responsiveValue(16),
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {getInstrumentName()}
        </Text>
        {disabled && (
          <Text
            className="text-gray-400 ml-2"
            style={{
              fontSize: responsiveValue(14), // text-sm
              marginLeft: responsiveValue(8), // ml-2
            }}
          >
            (Loading...)
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}
