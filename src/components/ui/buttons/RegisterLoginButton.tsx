import { TouchableOpacity, Text } from "react-native"
import { Feather } from "@expo/vector-icons"

interface RegisterLoginButtonProps {
  onPress: () => void
  className?: string
}

export default function RegisterLoginButton({ onPress, className = "" }: RegisterLoginButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-[#1e3a5f] rounded-full py-4 px-6 flex-row items-center justify-center mb-4 ${className}`}
      accessibilityRole="button"
      accessibilityLabel="Register or Login"
    >
      <Feather name="user" size={20} color="white" />
      <Text className="text-white text-lg font-semibold ml-2">Register or Login</Text>
    </TouchableOpacity>
  )
}
