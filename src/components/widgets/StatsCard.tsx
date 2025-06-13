import { View, Text } from "react-native"

interface StatCardProps {
  value: string
  label: string
  size?: "small" | "large"
  valueColor?: "blue" | "red" | "green" | "gray" | "dark"
}

export default function StatCard({ value, label, size = "small", valueColor = "gray" }: StatCardProps) {
  // Color mapping for different value colors
  const getValueColor = () => {
    switch (valueColor) {
      case "blue":
        return "text-blue-600"
      case "red":
        return "text-red-500"
      case "green":
        return "text-green-600"
      case "dark":
        return "text-[#1e3a5f]"
      case "gray":
      default:
        return "text-gray-900"
    }
  }

  // Size-based styling
  const getSizeStyles = () => {
    if (size === "large") {
      return {
        container: "px-4 py-3",
        label: "text-sm font-medium mb-1",
        value: "text-2xl font-bold",
      }
    }
    return {
      container: "px-3 py-2",
      label: "text-xs font-medium mb-1",
      value: "text-lg font-bold",
    }
  }

  const sizeStyles = getSizeStyles()

  return (
    <View className={`items-center ${sizeStyles.container}`}>
      <Text className={`text-gray-600 ${sizeStyles.label} text-center`}>{label}</Text>
      <Text className={`${getValueColor()} ${sizeStyles.value} text-center`}>{value}</Text>
    </View>
  )
}
