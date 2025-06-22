import { View, Text, Image, Dimensions } from "react-native"
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
  const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height
  const imageHeight = screenHeight * 0.6 // 70% of screen height

  const handleRegisterLogin = () => {
    console.log("Register or Login pressed")
    navigation.navigate("SocialRegister" as never)
  }

  const handleGuestStart = () => {
    console.log("Start as guest pressed")
    navigation.navigate("SelectInstrument" as never)
  }

  return (
    <SafeAreaView className="flex-1 relative">
      {/* Background Image - 70% of screen height */}
      <Image
        source={Homebg}
        className="absolute top-0 left-0"
        style={{
          width: screenWidth,
          height: imageHeight,
          zIndex: 100,
        }}
        resizeMode="cover"
      />

      {/* Content Container */}
      <View className="mt-auto bg-white px-6 pt-44 h-[60%]" style={{ zIndex: 50 }}>
        <Text className="text-[#003049] text-4xl font-bold font-sans text-center">TRAIN MY EAR</Text>
        <Text className="text-[#003049] text-2xl text-center mb-12 font-sans">A simple tool to help recognize chords by ear.</Text>

        <View className="mt-8 mb-16">
           <GuestButton onPress={handleGuestStart} />
          <RegisterLoginButton onPress={handleRegisterLogin} />
         
        </View>
      </View>
    </SafeAreaView>
  )
}