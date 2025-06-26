import { Feather } from "@expo/vector-icons"
import { View, Text } from "react-native"

interface CircularIndicatorProps {
  type: "success" | "error" | "empty" | "filled"
  size?: number
  chordText?: string // New prop for displaying chord names
  showIcon?: boolean // New prop to control whether to show tick/cross icons
}

export default function CircularIndicator({ type, size = 40, chordText, showIcon = false }: CircularIndicatorProps) {
  const getIndicatorStyle = () => {
    switch (type) {
      case "success":
        return showIcon ? "border-[#588157] bg-[#588157]" : "border-[#588157] bg-white"
      case "error":
        return showIcon ? "border-red-500 bg-red-500" : "border-red-500 bg-white"
      case "filled":
        return "border-gray-400 bg-gray-100"
      case "empty":
        return "border-gray-300 bg-white"
      default:
        return "bg-gray-200 border-gray-300"
    }
  }

  const getContent = () => {
    // If showIcon is true, show full-circle tick/cross
    if (showIcon) {
      if (type === "success") {
        return (
          <View className="items-center justify-center">
            <Feather name="check" size={size * 0.6} color="white" />
            {chordText && (
              <Text
                className="font-bold text-white absolute"
                style={{ fontSize: size * 0.15, bottom: -2 }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {chordText}
              </Text>
            )}
          </View>
        )
      } else if (type === "error") {
        return (
          <View className="items-center justify-center">
            <Feather name="x" size={size * 0.6} color="white" />
            {chordText && (
              <Text
                className="font-bold text-white absolute"
                style={{ fontSize: size * 0.15, bottom: -2 }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {chordText}
              </Text>
            )}
          </View>
        )
      }
    }

    // If we have chord text and no icon, show it
    if (chordText && !showIcon) {
      return (
        <Text
          className="font-bold text-gray-800"
          style={{ fontSize: size * 0.25 }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {chordText}
        </Text>
      )
    }

    // Default icon behavior when no chord text and no showIcon
    switch (type) {
      case "success":
        return <Feather name="check" size={size * 0.5} color="#588157" />
      case "error":
        return <Feather name="x" size={size * 0.5} color="red" />
      case "filled":
        return (
          <View
            className="rounded-full bg-gray-400"
            style={{
              width: size * 0.3,
              height: size * 0.3,
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
      {getContent()}
    </View>
  )
}
