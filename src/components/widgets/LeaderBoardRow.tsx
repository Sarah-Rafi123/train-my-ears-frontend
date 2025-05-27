import { View, Text } from "react-native"

interface LeaderboardRowProps {
  place: number
  name: string
  streak: number
  accuracy: string
}

export default function LeaderboardRow({ place, name, streak, accuracy }: LeaderboardRowProps) {
  const getPlaceColor = () => {
    switch (place) {
      case 1:
        return "bg-yellow-200"
      case 2:
        return "bg-gray-200"
      case 3:
        return "bg-orange-200"
      default:
        return "bg-transparent"
    }
  }

  return (
    <View className="flex-row items-center py-4 px-6">
      <View className={`w-8 h-8 ${getPlaceColor()} rounded-lg justify-center items-center mr-4`}>
        <Text className="text-slate-800 font-semibold">{place}</Text>
      </View>
      <Text className="flex-1 text-slate-800 font-medium">{name}</Text>
      <Text className="text-slate-800 font-medium w-16 text-center">{streak}</Text>
      <Text className="text-slate-800 font-medium w-20 text-center">{accuracy}</Text>
    </View>
  )
}
