import { View, Text } from "react-native"

interface StatCardProps {
  value: string
  label: string
  valueColor?: "green" | "blue"
  size?: "small" | "large"
}

export default function StatCard({ value, label, valueColor = "blue", size = "large" }: StatCardProps) {
  const textColorClass = valueColor === "green" ? "text-green-600" : "text-[#003049]"

  // Different sizes for different cards
  const cardSize = size === "large" ? "w-24 h-24" : "w-20 h-20"
  const textSize = size === "large" ? "text-2xl" : "text-xl"

  return (
    <View className="items-center">
      <View
        className={`bg-white border border-gray-200 rounded-2xl p-4 mb-3 ${cardSize} justify-center items-center shadow-sm`}
      >
        <Text className={`${textSize} font-bold ${textColorClass}`}>{value}</Text>
      </View>
      <Text className="text-[#003049] text-base font-medium">{label}</Text>
    </View>
  )
}
