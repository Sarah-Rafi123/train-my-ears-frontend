import { View, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import GetStartedButton from "@/src/components/ui/buttons/GetStartedButton"
import { SafeAreaView } from "react-native-safe-area-context"

interface TrainMyEarScreenProps {
  onGetStarted?: () => void
}

export default function HomeScreen({ onGetStarted }: TrainMyEarScreenProps) {
  const handleGetStarted = () => {
    console.log("Get Started pressed")
    onGetStarted?.()
  }


  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={["#1e3a5f", "#2d5a87", "#1a365d"]} className="flex-1">
      </LinearGradient>
      <View className="bg-white rounded-t-[40px] px-6 pt-12 pb-8">
        <Text className="text-[#003049] text-3xl font-bold text-center mb-4">TRAIN MY EAR</Text>
        <Text className="text-[#003049] text-lg text-center mb-12">Ready to improve your ear for music?</Text>
        <GetStartedButton onPress={handleGetStarted} />
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </SafeAreaView>
  )
}
