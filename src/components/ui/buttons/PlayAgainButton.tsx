import { TouchableOpacity, Text, View } from "react-native"

interface PlayAgainButtonProps {
  onPress?: () => void
}

export default function PlayAgainButton({ onPress }: PlayAgainButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-300 rounded-xl py-4 px-8 mx-6 mb-8 flex-row justify-center items-center space-x-2"
    >
      {/* Refresh icon */}
      <View className="w-5 h-5">
        <View className="absolute inset-0 border-2 border-slate-800 rounded-full" />
        <View className="absolute top-0 right-1 w-0 h-0 border-l-[4px] border-l-slate-800 border-b-[4px] border-b-transparent" />
      </View>
      <Text className="text-slate-800 text-lg font-semibold">Play Again</Text>
    </TouchableOpacity>
  )
}
