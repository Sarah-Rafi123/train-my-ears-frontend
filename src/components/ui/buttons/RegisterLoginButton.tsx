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
  const responsiveValue = (value: number) => Math.round(value * scaleFactor)

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-[#1e3a5f] rounded-2xl  flex-row items-center justify-center ${className}`}
      accessibilityRole="button"
      accessibilityLabel="Register or Login"
      style={{
        paddingVertical: responsiveValue(6), // py-4 is 16px
        paddingHorizontal: responsiveValue(24), // px-6 is 24px
      }}
    >
      {/* Assuming PersonSvg accepts width and height props for scaling */}
      <PersonSvg width={responsiveValue(20)} height={responsiveValue(20)} />
      <Text
        className="text-white font-sans ml-2"
        style={{
          fontSize: responsiveValue(24), // text-2xl is 24px
        }}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        Register or Login
      </Text>
    </TouchableOpacity>
  )
}
