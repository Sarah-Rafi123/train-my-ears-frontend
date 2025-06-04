import { TouchableOpacity, View } from "react-native"
import LeftIconSVG from "@/src/assets/svgs/LeftIcon"
import { useNavigation } from "@react-navigation/native"

interface BackButtonProps {
  onPress?: () => void
}

export default function BackButton({ onPress }: BackButtonProps) {
  const navigation = useNavigation()

  const handlePress = () => {
    if (onPress) {
      // Use custom onPress if provided
      onPress()
    } else {
      // Default behavior: go back to previous screen
      navigation.goBack()
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-10 h-10 justify-center items-center"
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <View className="w-6 h-6">
        <LeftIconSVG />
      </View>
    </TouchableOpacity>
  )
}
