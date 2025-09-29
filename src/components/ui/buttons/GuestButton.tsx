import { TouchableOpacity, Text, Dimensions } from "react-native"
import { Feather } from "@expo/vector-icons"

interface GuestButtonProps {
  onPress: () => void
  className?: string
  isLoading?: boolean
}

export default function GuestButton({ onPress, className, isLoading }: GuestButtonProps) {
  const screenWidth = Dimensions.get("window").width
  const BASE_WIDTH = 375
  const scaleFactor = screenWidth / BASE_WIDTH
  const isTablet = screenWidth > 600
  const responsiveValue = (value: number) => {
    const scaled = Math.round(value * scaleFactor)
    // On tablets, cap the scaling to keep buttons smaller
    return isTablet ? Math.min(scaled, value * 1.1) : scaled
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`border-2 border-[#1e3a5f] rounded-2xl flex-row mb-4 items-center justify-center ${className}`}
      accessibilityRole="button"
      accessibilityLabel="Start as guest"
      disabled={isLoading}
      style={{
        paddingVertical: isTablet ? responsiveValue(8) : responsiveValue(8),
        paddingHorizontal: isTablet ? responsiveValue(16) : responsiveValue(28),
      }}
    >
      <Feather name="music" size={isTablet ? responsiveValue(14) : responsiveValue(20)} color="#1e3a5f" />
      <Text
        className="text-[#1e3a5f] justify-center items-center font-sans ml-2"
        style={{
          fontSize: isTablet ? responsiveValue(16) : responsiveValue(22),
        }}
      >
        {isLoading ? "Guest" : "Guest"}
      </Text>
    </TouchableOpacity>
  )
}
