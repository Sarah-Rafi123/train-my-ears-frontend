import { View, Text } from "react-native"

interface LeaderboardRowProps {
  place: number
  name: string
  streak: number
  accuracy: string
}

export default function LeaderboardRow({ place, name, streak, accuracy }: LeaderboardRowProps) {
  const getPlaceStyle = () => {
    switch (place) {
      case 1:
        return "bg-yellow-400"
      case 2:
        return "bg-gray-400"
      case 3:
        return "bg-orange-400"
      default:
        return "bg-gray-200"
    }
  }

  return (
    <View className="flex-row items-center py-4 px-6 border-b border-gray-100">
      <View className={`w-8 h-8 ${getPlaceStyle()} rounded-full justify-center items-center mr-4`}>
        <Text className="text-white font-bold text-sm">{place}</Text>
      </View>
      <Text className="flex-1 text-[#003049] bg-red-600 ml-4 font-medium text-base">{name}</Text>
      <Text className="text-[#003049] font-medium bg-blue-500 w-16 text-center">{streak}</Text>
      <Text className="text-[#003049] font-medium w-20 text-center">{accuracy}</Text>
    </View>
  )
}
