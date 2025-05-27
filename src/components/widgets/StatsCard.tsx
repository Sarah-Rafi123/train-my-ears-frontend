import { View, Text } from "react-native"

interface StatCardProps {
  value: string
  label: string
  valueColor?: "green" | "blue"
}

export default function StatCard({ value, label, valueColor = "blue" }: StatCardProps) {
  const textColorClass = valueColor === "green" ? "text-green-600" : "text-slate-800"

  return (
    <View className="flex-1 items-center">
      <View className="bg-white border border-gray-300 rounded-xl p-4 mb-2 min-w-[80px] min-h-[80px] justify-center items-center">
        <Text className={`text-2xl font-bold ${textColorClass}`}>{value}</Text>
      </View>
      <Text className="text-slate-800 text-base font-medium">{label}</Text>
    </View>
  )
}
