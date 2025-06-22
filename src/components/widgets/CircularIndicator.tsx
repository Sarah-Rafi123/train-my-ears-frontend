import { Feather } from "@expo/vector-icons"
import { View } from "react-native"

interface CircularIndicatorProps {
  type: "success" | "error" | "empty" | "filled"
  size?: number
}

export default function CircularIndicator({ type, size = 40 }: CircularIndicatorProps) {
  const getIndicatorStyle = () => {
    switch (type) {
      case "success":
        return "border-[#588157] bg-white"
      case "error":
        return "border-red-500 bg-white"
      case "filled":
        return "border-gray-400 bg-black"
      case "empty":
        return "border-gray-300 bg-white"
      default:
        return "bg-gray-200 border-gray-300"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Feather name="check" size={size * 0.5} color="#588157" />
      case "error":
        return <Feather name="x" size={size * 0.5} color="red" />
      case "filled":
        return (
          <View 
            className="rounded-full bg-white"
            style={{ 
              width: size * 0.3, 
              height: size * 0.3 
            }} 
          />
        )
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