import { View, Text, Image, Dimensions, Platform } from "react-native"
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
  const imageHeight = screenHeight * 0.6

  const handleRegisterLogin = () => {
    console.log("Register or Login pressed")
    navigation.navigate("SocialRegister" as never)
  }

  const handleGuestStart = () => {
    console.log("🎵 Navigating to SelectInstrument as guest")
    navigation.navigate("SelectInstrument" as never)
  }

  // Create platform-specific text styles
  const titleStyle = {
    fontSize: Platform.OS === "ios" ? 32 : 32, // Slightly smaller on iOS
    lineHeight: Platform.OS === "ios" ? 40 : 40, // Explicit line height
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    paddingVertical: Platform.OS === "ios" ? 8 : 4, // Extra padding on iOS
  }

  const subtitleStyle = {
    fontSize: Platform.OS === "ios" ? 20 : 20, // Slightly smaller on iOS
    lineHeight: Platform.OS === "ios" ? 28 : 28, // Explicit line height
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "center" as const,
    marginBottom: 30,
    paddingVertical: Platform.OS === "ios" ? 6 : 3, // Extra padding on iOS
    paddingHorizontal: 8, // Horizontal padding to prevent edge clipping
  }

  return (
    <SafeAreaView className="flex-1 relative">
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
      <View className="mt-auto bg-white px-6 pt-48 h-[60%]">
        <Text style={titleStyle}>TRAIN MY EAR</Text>
        <Text style={subtitleStyle}>A simple tool to help recognize chords by ear.</Text>
        <View className="mb-16">
          <GuestButton onPress={handleGuestStart} />
          <RegisterLoginButton onPress={handleRegisterLogin} />
        </View>
      </View>
    </SafeAreaView>
  )
}
