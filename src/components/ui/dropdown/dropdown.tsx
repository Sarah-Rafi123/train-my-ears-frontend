import { TouchableOpacity, Text, View } from "react-native"

interface DropdownProps {
  value: string
  onPress?: () => void
}

export default function Dropdown({ value, onPress }: DropdownProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-300 rounded-xl py-3 px-4 flex-row justify-between items-center min-w-[120px]"
    >
      <Text className="text-slate-800 font-medium">{value}</Text>
      <View className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-800 ml-2" />
    </TouchableOpacity>
  )
}
