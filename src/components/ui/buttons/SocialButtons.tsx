import { View } from "react-native"
import SocialIconButton from "./SocialIconButton"

interface SocialButtonsProps {
  loadingSocialProvider?: string | null
  onLoadingChange?: (provider: string) => (loading: boolean) => void
}

export default function SocialButtons({ loadingSocialProvider, onLoadingChange }: SocialButtonsProps) {
  return (
    <View className="flex-row justify-center my-6 gap-x-6">
      <SocialIconButton 
        provider="apple" 
        disabled={loadingSocialProvider !== null && loadingSocialProvider !== "apple"}
        onLoadingChange={onLoadingChange?.("apple")}
      />
      <SocialIconButton 
        provider="facebook" 
        disabled={loadingSocialProvider !== null && loadingSocialProvider !== "facebook"}
        onLoadingChange={onLoadingChange?.("facebook")}
      />
      <SocialIconButton 
        provider="google" 
        disabled={loadingSocialProvider !== null && loadingSocialProvider !== "google"}
        onLoadingChange={onLoadingChange?.("google")}
      />
    </View>
  )
}
