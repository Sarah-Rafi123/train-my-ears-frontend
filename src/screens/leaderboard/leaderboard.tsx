 import { View, Text, ScrollView } from "react-native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import Dropdown from "@/src/components/ui/dropdown/dropdown"
import PodiumPlayer from "@/src/components/widgets/PodiumPlayer"
import LeaderboardRow from "@/src/components/widgets/LeaderBoardRow"

interface LeaderboardScreenProps {
  onBack?: () => void
  showPodium?: boolean
}

export default function LeaderboardScreen({ onBack, showPodium = true }: LeaderboardScreenProps) {
  const leaderboardData = [
    { place: 1, name: "Cody Fisher", streak: 23, accuracy: "20%" },
    { place: 2, name: "Kathryn Murphy", streak: 19, accuracy: "14%" },
    { place: 3, name: "Kristin Watson", streak: 18, accuracy: "14%" },
    { place: 4, name: "Jerome Bell", streak: 15, accuracy: "14%" },
    { place: 5, name: "Annette Black", streak: 10, accuracy: "14%" },
    { place: 6, name: "Annette Black", streak: 10, accuracy: "14%" },
    { place: 7, name: "Annette Black", streak: 10, accuracy: "14%" },
    { place: 8, name: "Annette Black", streak: 10, accuracy: "14%" },
    { place: 9, name: "Annette Black", streak: 10, accuracy: "14%" },
  ]

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 pb-8">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-slate-800 text-xl font-semibold text-center mr-10">Leaderboard</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View className="flex-row justify-center space-x-4 mb-8">
          <Dropdown value="Level 1" />
          <Dropdown value="Simple Mode" />
        </View>

        {/* Podium (if enabled) */}
        {showPodium && (
          <View className="flex-row justify-center items-end space-x-8 mb-8 px-6">
            <PodiumPlayer name="Kathryn Murphy" position={2} hasStars />
            <PodiumPlayer name="Cody Fisher" position={1} />
            <PodiumPlayer name="Kristin Watson" position={3} hasStars />
          </View>
        )}

        {/* Table Header */}
        <View className="flex-row items-center py-4 px-6 border-b border-gray-200">
          <Text className="text-slate-600 font-semibold w-12">Place</Text>
          <Text className="text-slate-600 font-semibold flex-1 ml-4">Name</Text>
          <Text className="text-slate-600 font-semibold w-16 text-center">Streak</Text>
          <Text className="text-slate-600 font-semibold w-20 text-center">Accuracy</Text>
        </View>

        {/* Leaderboard Rows */}
        {leaderboardData.map((player) => (
          <LeaderboardRow
            key={player.place}
            place={player.place}
            name={player.name}
            streak={player.streak}
            accuracy={player.accuracy}
          />
        ))}

        {/* Pagination */}
        <View className="flex-row justify-center items-center py-8 space-x-4">
          <View className="w-8 h-8 justify-center items-center">
            <View className="w-0 h-0 border-r-[6px] border-r-slate-800 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
          </View>
          <Text className="text-slate-800 font-semibold text-lg">1</Text>
          <View className="w-8 h-8 justify-center items-center">
            <View className="w-0 h-0 border-l-[6px] border-l-slate-800 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
          </View>
        </View>
      </ScrollView>

      {/* Home indicator */}
      <View className="pb-8 pt-4">
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </View>
  )
}
