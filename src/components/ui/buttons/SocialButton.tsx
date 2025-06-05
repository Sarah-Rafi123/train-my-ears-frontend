import { AntDesign, Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity, View } from "react-native"
import AppleWhiteSvg from "@/src/assets/svgs/Apple_white"
import GoogleSvg from "@/src/assets/svgs/Google"
import FacebookWhiteSvg from "@/src/assets/svgs/Facebook_white"
interface SocialButtonProps {
  provider: "apple" | "facebook" | "google"
  title: string
  onPress?: () => void
  className?: string
  textClassName?: string
}

export default function SocialButton({
  provider,
  title,
  onPress,
  className = "",
  textClassName = "",
}: SocialButtonProps) {
  const getIcon = () => {
    switch (provider) {
      case "apple":
        return <AppleWhiteSvg />
      case "facebook":
        return <FacebookWhiteSvg />
      case "google":
        return <GoogleSvg />
      default:
        return null
    }
  }

  return (
    <TouchableOpacity
      className={`w-full rounded-2xl py-3 px-4 border-black flex-row items-center justify-center ${className}`}
      onPress={onPress}
    >
      <View className="mr-2">{getIcon()}</View>
      <Text className={`font-medium ${textClassName}`}>{title}</Text>
    </TouchableOpacity>
  )
}
