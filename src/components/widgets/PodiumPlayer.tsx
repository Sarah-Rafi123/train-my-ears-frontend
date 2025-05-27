import { View, Text } from "react-native"

interface PodiumPlayerProps {
  name: string
  position: 1 | 2 | 3
  hasStars?: boolean
}

export default function PodiumPlayer({ name, position, hasStars = false }: PodiumPlayerProps) {
  const getPositionColor = () => {
    switch (position) {
      case 1:
        return "border-slate-800"
      case 2:
        return "border-slate-600"
      case 3:
        return "border-orange-400"
      default:
        return "border-gray-400"
    }
  }

  const getCircleSize = () => {
    return position === 1 ? "w-20 h-20" : "w-16 h-16"
  }

  return (
    <View className="items-center">
      <View className="relative mb-2">
        {position === 1 && (
          <View className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <View className="w-8 h-6 bg-yellow-400" />
          </View>
        )}
        <View
          className={`${getCircleSize()} ${getPositionColor()} border-4 rounded-full bg-white justify-center items-center`}
        >
          <View className="w-6 h-6 bg-slate-800 rounded-full" />
        </View>
        {hasStars && (
          <View className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <View className="w-6 h-6 bg-yellow-400 rounded-full justify-center items-center">
              <Text className="text-white text-xs">★</Text>
            </View>
          </View>
        )}
        {position === 3 && (
          <View className="absolute -bottom-2 right-0">
            <View className="w-6 h-6 bg-orange-400 rounded-full justify-center items-center">
              <Text className="text-white text-xs">★</Text>
            </View>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-slate-800 mb-1">{position}</Text>
      <Text className="text-slate-800 text-sm text-center">{name}</Text>
    </View>
  )
}
