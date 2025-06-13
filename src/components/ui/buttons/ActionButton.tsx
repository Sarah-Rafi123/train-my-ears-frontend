import { TouchableOpacity, Text, View } from "react-native"
import { Feather } from "@expo/vector-icons"

interface ActionButtonProps {
  title: string
  variant?: "outline" | "filled"
  icon?: "dots" | "arrow-down" | "arrow-up"
  onPress?: () => void
}

export default function ActionButton({ title, variant = "outline", icon, onPress }: ActionButtonProps) {
  const buttonClass = variant === "filled" ? "bg-[#003049]" : "bg-white border border-gray-200"
  const textClass = variant === "filled" ? "text-white" : "text-[#003049]"

  const renderIcon = () => {
    const iconColor = variant === "filled" ? "white" : "#003049"

    if (icon === "dots") {
      return <Feather name="more-horizontal" size={20} color={iconColor} />
    }
    if (icon === "arrow-down") {
      return <Feather name="chevron-down" size={20} color={iconColor} />
    }
    if (icon === "arrow-up") {
      return <Feather name="chevron-up" size={20} color={iconColor} />
    }
    return null
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${buttonClass} rounded-xl max-w-44 py-4 px-8 flex-row justify-center items-center shadow-sm`}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {icon && <View className="mr-2">{renderIcon()}</View>}
      <Text className={`${textClass} text-lg font-semibold`}>{title}</Text>
    </TouchableOpacity>
  )
}
