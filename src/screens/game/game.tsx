import { View, Text, ScrollView } from "react-native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import StatCard from "@/src/components/widgets/StatsCard"
import PlayAgainButton from "@/src/components/ui/buttons/PlayAgainButton"
import NoteGrid from "@/src/components/widgets/NoteGrid"
import ActionButton from "@/src/components/ui/buttons/ActionButton"

interface GameResultScreenProps {
  onBack?: () => void
  onPlayAgain?: () => void
  onNotePress?: (note: string) => void
  onLevelDown?: () => void
  onMoreDetails?: () => void
  onRegister?: () => void
}

export default function GameScreen({
  onBack,
  onPlayAgain,
  onNotePress,
  onLevelDown,
  onMoreDetails,
  onRegister,
}: GameResultScreenProps) {
  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="flex-row items-center px-6 pb-8">
        <BackButton onPress={onBack} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View className="flex-row px-6 mb-8">
          <StatCard value="53%" label="Accuracy" valueColor="green" />
          <StatCard value="2" label="Level" />
          <StatCard value="10" label="Streaks" />
        </View>
        <View className="items-center">
     <View className="w-2/3">
        <PlayAgainButton onPress={onPlayAgain} />
        <Text className="text-slate-800 text-2xl font-bold text-center mb-8">Correct!</Text>
        <NoteGrid selectedNote="G" onNotePress={onNotePress} />
        <ActionButton title="Level Down" icon="arrow-down" onPress={onLevelDown} />
        </View>
        </View>
        <ActionButton title="More Details" icon="dots" onPress={onMoreDetails} />

        <ActionButton title="Register" variant="filled" onPress={onRegister} />
      </ScrollView>
      <View className="pb-8 pt-4">
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </View>
  )
}
