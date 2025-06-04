import { View, Text, Image } from "react-native"
import GuestButton from "@/src/components/ui/buttons/GuestButton"
import { SafeAreaView } from "react-native-safe-area-context"
import RegisterLoginButton from "@/src/components/ui/buttons/RegisterLoginButton"
import { useNavigation } from "@react-navigation/native"
import Homebg from "@/src/assets/images/Homebg.png"

interface TrainMyEarScreenProps {
  onGetStarted?: () => void
}

export default function HomeScreen({ onGetStarted }: TrainMyEarScreenProps) {
    const navigation = useNavigation()
  const handleRegisterLogin = () => {
    console.log("Register or Login pressed")

    navigation.navigate("Register" as never)
  }

  const handleGuestStart = () => {
    console.log("Start as guest pressed")
    
    navigation.navigate("SelectInstrument" as never)
  }

  return (
    <SafeAreaView className="flex-1 relative">
      <View className="absolute top-0 left-0">

     
      <Image source={Homebg} className="absolute z-50 top-0 left-0" resizeMode="contain" />
 </View>
      <View className="mt-auto bg-white px-6 pt-40 pb-8 h-[55%]">
        <Text className="text-[#003049] text-3xl font-bold text-center mb-4">TRAIN MY EAR</Text>
        <Text className="text-[#003049] text-lg text-center mb-12">Ready to improve your ear for music?</Text>
     <View className="mb-6">
          <RegisterLoginButton onPress={handleRegisterLogin} />
          <GuestButton onPress={handleGuestStart} />
        </View>

        <View className="w-32 h-1 bg-black rounded-full self-center mt-4" />
      </View>
    </SafeAreaView>
  )
}
