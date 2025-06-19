import { View } from "react-native"
import SocialIconButton from "./SocialIconButton"

export default function SocialButtons() {
  return (
    <View className="flex-row justify-center my-6 gap-x-6">
      <SocialIconButton provider="apple" />
      <SocialIconButton provider="facebook" />
      <SocialIconButton provider="google" />
    </View>
  )
}
