import { View, ScrollView, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import BackButton from "@/src/components/ui/buttons/BackButton"
import MenuOption from "@/src/components/widgets/MenuOption"

interface MenuScreenProps {
  onBack?: () => void
  onViewSample?: () => void
  onAdvanceMode?: () => void
  onViewStats?: () => void
  onLeaderboard?: () => void
  onShare?: () => void
}

export default function MenuScreen({
  onBack,
  onViewSample,
  onAdvanceMode,
  onViewStats,
  onLeaderboard,
  onShare,
}: MenuScreenProps) {
  const navigation = useNavigation()

  const handleViewSample = () => {
    console.log("View Sample pressed")
    onViewSample?.()
    navigation.navigate("Sample" as never)
  }

  const handleAdvanceMode = () => {
    console.log("Advance Mode pressed")
    onAdvanceMode?.()
    navigation.navigate("Advance" as never)
  }

  const handleViewStats = () => {
    console.log("View Stats pressed")
    onViewStats?.()
    navigation.navigate("Stats" as never)
  }

  const handleLeaderboard = () => {
    console.log("Leaderboard pressed")
    onLeaderboard?.()
    navigation.navigate("Leaderboard" as never)
  }

  const handleShare = () => {
    console.log("Share pressed")
    onShare?.()
    // Implement share functionality
  }

  const handleBack = () => {
    console.log("Back pressed")
    onBack?.()
    navigation.goBack()
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-6 py-4">
        <BackButton onPress={handleBack} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4 px-4 gap-y-2">
          <MenuOption title="My Stats" onPress={handleViewStats} />
         <MenuOption title="Advanced Play" onPress={handleAdvanceMode} />
          <MenuOption title="Sample Chords"  onPress={handleViewSample} />
          <MenuOption title="Leader Board" onPress={handleLeaderboard} />
          <MenuOption title="Share" onPress={handleShare} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
