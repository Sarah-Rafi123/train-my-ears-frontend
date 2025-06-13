import { TouchableOpacity, Text } from "react-native"

interface SaveProgressButtonProps {
  onPress?: () => void
  disabled?: boolean
}

export default function SaveProgressButton({ onPress, disabled = false }: SaveProgressButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Save your progress"
    >
      <Text className="text-gray-900 text-lg font-medium text-center">Save your progress</Text>
    </TouchableOpacity>
  )
}
