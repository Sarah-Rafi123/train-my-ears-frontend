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
  const responsiveValue = (value: number) => Math.round(value * scaleFactor)

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`border-2 border-[#1e3a5f] rounded-2xl flex-row mb-4 items-center justify-center ${className}`}
      accessibilityRole="button"
      accessibilityLabel="Start as guest"
      disabled={isLoading}
      style={{
        paddingVertical: responsiveValue(6), // py-4 is 16px
        paddingHorizontal: responsiveValue(24), // px-6 is 24px
      }}
    >
      <Feather name="music" size={responsiveValue(20)} color="#1e3a5f" />
      <Text
        className="text-[#1e3a5f] justify-center items-center font-sans ml-2"
        style={{
          fontSize: responsiveValue(24), // text-2xl is 24px
        }}
      >
        {isLoading ? "Guest" : "Guest"}
      </Text>
    </TouchableOpacity>
  )
}
