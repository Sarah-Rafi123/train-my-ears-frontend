import { TouchableOpacity, Text, View } from "react-native"

interface ActionButtonProps {
  title: string
  variant?: "outline" | "filled"
  icon?: "dots" | "arrow-down"
  onPress?: () => void
}

export default function ActionButton({ title, variant = "outline", icon, onPress }: ActionButtonProps) {
  const buttonClass = variant === "filled" ? "bg-slate-800" : "bg-white border border-gray-300"

  const textClass = variant === "filled" ? "text-white" : "text-slate-800"

  const renderIcon = () => {
    if (icon === "dots") {
      return (
        <View className="flex-row space-x-1">
          <View className="w-1 h-1 bg-slate-800 rounded-full" />
          <View className="w-1 h-1 bg-slate-800 rounded-full" />
          <View className="w-1 h-1 bg-slate-800 rounded-full" />
        </View>
      )
    }
    if (icon === "arrow-down") {
      return (
        <View className="w-4 h-4 justify-center items-center">
          <View className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-800" />
        </View>
      )
    }
    return null
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${buttonClass} rounded-xl py-4 px-8 mx-6 mb-4 flex-row justify-center items-center space-x-2`}
    >
      <View>{renderIcon()}</View>
      <Text className={`${textClass} text-lg font-semibold`}>{title}</Text>
     
    </TouchableOpacity>
  )
}
