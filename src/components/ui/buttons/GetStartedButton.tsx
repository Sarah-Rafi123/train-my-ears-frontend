import { TouchableOpacity, Text, View } from "react-native"
import MusicSVG from "@/src/assets/svgs/Music"
interface GetStartedButtonProps {
  onPress?: () => void
}

export default function GetStartedButton({ onPress }: GetStartedButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#003049] mx-6 py-4 rounded-2xl flex-row justify-center items-center space-x-2 mb-8"
    >
      <Text className="text-white text-lg font-semibold">Get Started</Text>
      <View className="w-5 h-5">
       <MusicSVG/>
      </View>
    </TouchableOpacity>
  )
}
