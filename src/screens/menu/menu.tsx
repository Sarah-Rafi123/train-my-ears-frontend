import { View, ScrollView, SafeAreaView } from "react-native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import MenuOption from "@/src/components/widgets/MenuOption"

interface MoreMenuScreenProps {
  onBack?: () => void
  onViewSample?: () => void
  onViewStats?: () => void
  onLeaderboard?: () => void
}

export default function MenuScreen({ onBack, onViewSample, onViewStats, onLeaderboard }: MoreMenuScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 pb-8">
        <BackButton onPress={onBack} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-8">
          <MenuOption title="View Sample" icon="play" onPress={onViewSample} />
          <MenuOption title="View Stats" icon="stats" onPress={onViewStats} />
          <MenuOption title="Leadership board" icon="medal" onPress={onLeaderboard} />
        </View>
      </ScrollView>

      {/* Home indicator */}
      <View className="pb-8 pt-4">
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </SafeAreaView>
  )
}
