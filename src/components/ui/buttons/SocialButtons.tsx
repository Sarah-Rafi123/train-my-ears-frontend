import { View } from "react-native"
import SocialIconButton from "./SocialIconButton"

export default function SocialButtons() {
  return (
    <View className="flex-row justify-center space-x-8">
      <SocialIconButton provider="apple" />
      <SocialIconButton provider="facebook" />
      <SocialIconButton provider="google" />
    </View>
  )
}
