import { View, Text } from "react-native"

interface ChordCardProps {
  chord: string
  className?: string
}

export default function ChordCard({ chord, className = "" }: ChordCardProps) {
  return (
    <View className={`bg-white border border[#003049] rounded-3xl p-8 items-center justify-center shadow-sm ${className}`}>
      <Text className="text-[#003049] text-4xl font-bold">{chord}</Text>
    </View>
  )
}
