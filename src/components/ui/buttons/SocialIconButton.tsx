import React from "react"
import { TouchableOpacity } from "react-native"
import AppleSvg from "../../../assets/svgs/Apple_black"
import FacebookSvg from "../../../assets/svgs/Facebook_blue"
import GoogleSvg from "../../../assets/svgs/Google"

interface SocialIconButtonProps {
  provider: "apple" | "facebook" | "google"
  onPress?: () => void
}

export default function SocialIconButton({ provider, onPress }: SocialIconButtonProps) {
  const renderIcon = () => {
    switch (provider) {
      case "apple":
        return <AppleSvg width={32} height={32} />
      case "facebook":
        return <FacebookSvg width={32} height={32} />
      case "google":
        return <GoogleSvg width={32} height={32} />
      default:
        return null
    }
  }

  return (
    <TouchableOpacity
      className="w-12 h-12 rounded-full justify-center items-center"
      onPress={onPress}
    >
      {renderIcon()}
    </TouchableOpacity>
  )
}
