import { TouchableOpacity, Text } from "react-native"
import { Feather } from "@expo/vector-icons"

interface GuestButtonProps {
  onPress: () => void
  className?: string
}

export default function GuestButton({ onPress, className = "" }: GuestButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white border-2 border-[#1e3a5f] rounded-2xl py-4 px-6 flex-row  mb-4 items-center justify-center ${className}`}
      accessibilityRole="button"
      accessibilityLabel="Start as guest"
    >
      <Feather name="music" size={20} color="#1e3a5f" />
      <Text className="text-[#1e3a5f] text-2xl font-sans ml-2">Guest</Text>
    </TouchableOpacity>
  )
}
