import { TouchableOpacity, View } from "react-native"
import LeftIconSVG from "@/src/assets/svgs/LeftIcon"
interface BackButtonProps {
  onPress?: () => void
}

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} className="w-10 h-10 justify-center items-center">
      <View className="w-6 h-6">
       <LeftIconSVG/>
      </View>
    </TouchableOpacity>
  )
}
