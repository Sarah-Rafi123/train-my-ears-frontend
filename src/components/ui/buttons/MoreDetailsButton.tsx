import { TouchableOpacity, Text, View } from "react-native"

interface MoreDetailsButtonProps {
  onPress?: () => void
  disabled?: boolean
}

export default function MoreDetailsButton({ onPress, disabled = false }: MoreDetailsButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="mb-16"
      accessibilityRole="button"
      accessibilityLabel="More Details"
    >
      <View className="flex-row justify-center items-center">
        {/* Three blue dots */}
        <View className="flex-row mr-3">
          <View className="w-2 h-2 bg-[#1877F2] rounded-full mr-1" />
          <View className="w-2 h-2 bg-[#1877F2] rounded-full mr-1" />
          <View className="w-2 h-2 bg-[#1877F2] rounded-full" />
        </View>
        {/* More Details text */}
        <Text className="text-[#007AFF] text-lg font-medium">More Details</Text>
      </View>
    </TouchableOpacity>
  )
}
