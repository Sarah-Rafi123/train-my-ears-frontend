import { View, ScrollView, SafeAreaView } from "react-native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import StatCard from "@/src/components/widgets/StatsCard"
import PlayAgainButton from "@/src/components/ui/buttons/PlayAgainButton"
import CircularIndicator from "@/src/components/widgets/CircularIndicator"
import NoteGrid from "@/src/components/widgets/NoteGrid"
import ActionButton from "@/src/components/ui/buttons/ActionButton"

interface AdvancedStatsScreenProps {
  onBack?: () => void
  onPlayAgain?: () => void
  onNotePress?: (note: string) => void
  onLevelDown?: () => void
  onMoreDetails?: () => void
  onRegister?: () => void
}

export default function StatsScreen({
  onBack,
  onPlayAgain,
  onNotePress,
  onLevelDown,
  onMoreDetails,
  onRegister,
}: AdvancedStatsScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 pb-8">
        <BackButton onPress={onBack} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View className="flex-row px-6 mb-8">
          <StatCard value="23%" label="Accuracy" />
          <StatCard value="1" label="Level" />
          <StatCard value="10" label="Streaks" />
        </View>

        {/* Play Again Button */}
        <PlayAgainButton onPress={onPlayAgain} />

        {/* Circular Indicators */}
        <View className="flex-row justify-center space-x-4 mb-8">
          <CircularIndicator type="error" />
          <CircularIndicator type="empty" />
          <CircularIndicator type="empty" />
        </View>

        {/* Note Grid */}
        <NoteGrid selectedNote="G" onNotePress={onNotePress} />

        {/* Action Buttons */}
        <ActionButton title="Level Down" onPress={onLevelDown} />

        <ActionButton title="More Details" icon="dots" onPress={onMoreDetails} />

        <ActionButton title="Register" variant="filled" onPress={onRegister} />
      </ScrollView>

      {/* Home indicator */}
      <View className="pb-8 pt-4">
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </SafeAreaView>
  )
}
