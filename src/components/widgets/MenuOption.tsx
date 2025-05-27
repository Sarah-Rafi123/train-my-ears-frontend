import { TouchableOpacity, Text, View } from "react-native"

interface MenuOptionProps {
  title: string
  icon: "play" | "stats" | "medal"
  onPress?: () => void
}

export default function MenuOption({ title, icon, onPress }: MenuOptionProps) {
  const renderIcon = () => {
    switch (icon) {
      case "play":
        return (
          <View className="w-6 h-6 mr-3">
            <View className="w-0 h-0 border-l-[12px] border-l-slate-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
          </View>
        )
      case "stats":
        return (
          <View className="w-6 h-6 mr-3 flex-row items-end space-x-1">
            <View className="w-1 h-3 bg-slate-800" />
            <View className="w-1 h-4 bg-slate-800" />
            <View className="w-1 h-5 bg-slate-800" />
            <View className="w-1 h-6 bg-slate-800" />
          </View>
        )
      case "medal":
        return (
          <View className="w-6 h-6 mr-3">
            <View className="w-5 h-5 border-2 border-slate-800 rounded-full" />
            <View className="absolute bottom-0 left-1 w-3 h-2 bg-slate-800" />
          </View>
        )
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-300 rounded-2xl py-6 px-6 mx-6 mb-6 flex-row items-center"
    >
      {renderIcon()}
      <Text className="text-slate-800 text-lg font-semibold">{title}</Text>
    </TouchableOpacity>
  )
}
