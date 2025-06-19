import { TouchableOpacity, Text } from "react-native"
import { Feather } from "@expo/vector-icons"
import PersonSvg from "@/src/assets/svgs/Person"
interface RegisterLoginButtonProps {
  onPress: () => void
  className?: string
}

export default function RegisterLoginButton({ onPress, className = "" }: RegisterLoginButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-[#1e3a5f] rounded-2xl py-4 px-6 flex-row items-center justify-center ${className}`}
      accessibilityRole="button"
      accessibilityLabel="Register or Login"
    >
      <PersonSvg/>
      <Text className="text-white text-xl font-sans ml-2">Register or Login</Text>
    </TouchableOpacity>
  )
}
