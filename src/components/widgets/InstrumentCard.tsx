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
  const responsiveValue = (value: number) => Math.round(value * scaleFactor)

  const getInstrumentIcon = () => {
    // Assuming GuitarSvg and PianoSvg accept width and height props for scaling
    const iconSize = responsiveValue(30) // Example size, adjust as needed
    return instrument === "guitar" ? (
      <GuitarSvg width={iconSize} height={iconSize} />
    ) : (
      <PianoSvg width={iconSize} height={iconSize} />
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
        borderRadius: responsiveValue(8), // rounded-2xl
        paddingVertical: responsiveValue(15), // py-5
        paddingHorizontal: responsiveValue(32), // px-8
        marginBottom: responsiveValue(16), // mb-4
      }}
    >
      <View className="flex-row items-center justify-center">
        <View className={disabled ? "opacity-50" : ""}>{getInstrumentIcon()}</View>
        <Text
          className={`font-semibold ml-4 ${disabled ? "text-gray-400" : "text-[#003049]"}`}
          style={{
            fontSize: responsiveValue(20), // text-xl
            marginLeft: responsiveValue(16), // ml-4
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
