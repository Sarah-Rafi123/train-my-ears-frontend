import { View } from "react-native"
import { Feather } from "@expo/vector-icons"

interface CircularIndicatorProps {
  type: "success" | "error" | "empty"
  size?: number
}

export default function CircularIndicator({ type, size = 40 }: CircularIndicatorProps) {
  const getIndicatorStyle = () => {
    switch (type) {
      case "success":
        return "border-[#588157]"
      case "error":
        return "border-red-500"
      case "empty":
        return " border-gray-300"
      default:
        return "bg-gray-200 border-gray-300"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Feather name="check" size={size * 0.5} color="green" />
      case "error":
        return <Feather name="x" size={size * 0.5} color="red" />
      case "empty":
        return null
      default:
        return null
    }
  }

  return (
    <View
      className={`rounded-full border-2 items-center justify-center ${getIndicatorStyle()}`}
      style={{ width: size, height: size }}
    >
      {getIcon()}
    </View>
  )
}
