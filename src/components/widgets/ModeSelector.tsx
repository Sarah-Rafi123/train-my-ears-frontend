import { View, TouchableOpacity, Text } from "react-native"

interface ModeSelectorProps {
  selectedMode: "simple" | "advanced"
  onModeChange: (mode: "simple" | "advanced") => void
}

export default function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <View className="flex-row bg-gray-100 rounded-2xl p-1 mx-6 mb-6">
      <TouchableOpacity
        onPress={() => onModeChange("simple")}
        className={`flex-1 py-4 px-6 rounded-xl ${selectedMode === "simple" ? "bg-[#003049]" : "bg-transparent"}`}
        accessibilityRole="button"
        accessibilityLabel="Simple Mode"
      >
        <Text
          className={`text-center text-lg font-semibold ${selectedMode === "simple" ? "text-white" : "text-gray-500"}`}
        >
          Simple Mode
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onModeChange("advanced")}
        className={`flex-1 py-4 px-6 rounded-xl ${selectedMode === "advanced" ? "bg-[#003049]" : "bg-transparent"}`}
        accessibilityRole="button"
        accessibilityLabel="Advanced Mode"
      >
        <Text
          className={`text-center text-lg font-semibold ${
            selectedMode === "advanced" ? "text-white" : "text-gray-500"
          }`}
        >
          Advanced
        </Text>
      </TouchableOpacity>
    </View>
  )
}
