import { TouchableOpacity, Text, ActivityIndicator } from "react-native"

interface PrimaryButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  className = "",
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-[#003049] rounded-xl py-4 items-center ${disabled || loading ? "opacity-50" : ""} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-white font-semibold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  )
}
