import { TouchableOpacity, Text } from "react-native"

import ReplaySvg from "@/src/assets/svgs/Replay"
interface PlayAgainButtonProps {
  onPress?: () => void
}

export default function PlayAgainButton({ onPress }: PlayAgainButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1e3a5f] rounded-2xl py-4 px-8 flex-row justify-center items-center"
      accessibilityRole="button"
      accessibilityLabel="Play Again"
    >
      <ReplaySvg />
      <Text className="text-white text-lg font-semibold ml-3">Play Again</Text>
    </TouchableOpacity>
  )
}
