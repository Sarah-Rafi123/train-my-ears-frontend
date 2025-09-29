import { TouchableOpacity, Text, Dimensions } from "react-native"
import PersonSvg from "@/src/assets/svgs/Person"

interface RegisterLoginButtonProps {
  onPress: () => void
  className?: string
}

export default function RegisterLoginButton({ onPress, className = "" }: RegisterLoginButtonProps) {
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
      className={`bg-[#1e3a5f] rounded-2xl  flex-row items-center justify-center ${className}`}
      accessibilityRole="button"
      accessibilityLabel="Register or Login"
      style={{
        paddingVertical: isTablet ? responsiveValue(8) : responsiveValue(8),
        paddingHorizontal: isTablet ? responsiveValue(16) : responsiveValue(28),
      }}
    >
      <PersonSvg width={isTablet ? responsiveValue(14) : responsiveValue(20)} height={isTablet ? responsiveValue(14) : responsiveValue(20)} />
      <Text
        className="text-white font-sans ml-2"
        style={{
          fontSize: isTablet ? responsiveValue(16) : responsiveValue(22),
        }}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        Register or Login
      </Text>
    </TouchableOpacity>
  )
}
