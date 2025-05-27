import { View } from "react-native"

interface CircularIndicatorProps {
  type: "error" | "empty"
}

export default function CircularIndicator({ type }: CircularIndicatorProps) {
  if (type === "error") {
    return (
      <View className="w-12 h-12 bg-pink-100 border-2 border-pink-500 rounded-full justify-center items-center">
        <View className="relative">
          <View className="absolute w-4 h-0.5 bg-pink-500 rotate-45" />
          <View className="absolute w-4 h-0.5 bg-pink-500 -rotate-45" />
        </View>
      </View>
    )
  }

  return <View className="w-12 h-12 border-2 border-gray-300 rounded-full" />
}
