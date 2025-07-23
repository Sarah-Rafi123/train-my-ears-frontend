import { TouchableOpacity, View, Dimensions } from "react-native"
import LeftIconSVG from "@/src/assets/svgs/LeftIcon"
import { useNavigation } from "@react-navigation/native"

interface BackButtonProps {
  onPress?: () => void
}

export default function BackButton({ onPress }: BackButtonProps) {
  const navigation = useNavigation()
  const screenWidth = Dimensions.get("window").width
  const BASE_WIDTH = 375
  const scaleFactor = screenWidth / BASE_WIDTH
  const responsiveValue = (value: number) => Math.round(value * scaleFactor)

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      navigation.goBack()
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="justify-center items-center"
      accessibilityLabel="Go back"
      accessibilityRole="button"
      style={{
        width: responsiveValue(40), // w-10
        height: responsiveValue(40), // h-10
      }}
    >
      <View
        style={{
          width: responsiveValue(24), // w-6
          height: responsiveValue(24), // h-6
        }}
      >
        {/* Assuming LeftIconSVG accepts width and height props for scaling */}
        <LeftIconSVG width={responsiveValue(24)} height={responsiveValue(24)} />
      </View>
    </TouchableOpacity>
  )
}
