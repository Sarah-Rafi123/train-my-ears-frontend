import { View, TouchableOpacity, Text } from "react-native"

interface LevelSelectorProps {
  selectedLevel: number
  onLevelChange: (level: number) => void
  maxLevel?: number
}

export default function LevelSelector({ selectedLevel, onLevelChange, maxLevel = 4 }: LevelSelectorProps) {
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1)

  return (
    <View className="flex-row justify-center gap-x-4 px-6 mb-8">
      {levels.map((level) => (
        <TouchableOpacity
          key={level}
          onPress={() => onLevelChange(level)}
          className={`w-16 h-20 rounded-2xl items-center justify-center ${
            selectedLevel === level ? "bg-white border-2 border-[#003049] shadow-sm" : "bg-gray-200"
          }`}
          accessibilityRole="button"
          accessibilityLabel={`Level ${level}`}
        >
          <Text className={`text-2xl font-bold ${selectedLevel === level ? "text-[#003049]" : "text-gray-600"}`}>
            {level}
          </Text>
          <Text className={`text-sm font-medium ${selectedLevel === level ? "text-[#003049]" : "text-gray-600"}`}>
            Level
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
