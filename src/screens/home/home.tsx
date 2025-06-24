import { View, Text, Image, Dimensions } from "react-native"
import GuestButton from "@/src/components/ui/buttons/GuestButton"
import { SafeAreaView } from "react-native-safe-area-context"
import RegisterLoginButton from "@/src/components/ui/buttons/RegisterLoginButton"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { useAuth } from "@/src/context/AuthContext"
import Homebg from "@/src/assets/images/Homebg.png"

interface TrainMyEarScreenProps {
  onGetStarted?: () => void
}

export default function HomeScreen({ onGetStarted }: TrainMyEarScreenProps) {
  const navigation = useNavigation()
  const { logout, isAuthenticated, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height
  const imageHeight = screenHeight * 0.6 // 60% of screen height

  const handleRegisterLogin = () => {
    console.log("Register or Login pressed")
    navigation.navigate("SocialRegister" as never)
  }

  const handleGuestStart = async () => {
    try {
      console.log("Start as guest pressed")
      
      // Check if user is currently authenticated
      if (isAuthenticated) {
        console.log("🔓 User is authenticated, logging out before guest access...")
        console.log("👤 Current user:", {
          userId: user?.id,
          email: user?.email,
          name: user?.name,
        })
        
        setIsLoggingOut(true)
        
        // Call logout to clear any existing session
        await logout()
        
        console.log("✅ Successfully logged out, proceeding as guest")
      } else {
        console.log("ℹ️ No authenticated user, proceeding directly as guest")
      }
      
      console.log("🎵 Navigating to SelectInstrument as guest")
      navigation.navigate("SelectInstrument" as never)
      
    } catch (error) {
      console.error("❌ Error during guest logout process:", error)
      
      // Navigate anyway even if logout fails
      console.log("⚠️ Proceeding to SelectInstrument despite logout error")
      navigation.navigate("SelectInstrument" as never)
    } finally {
      setIsLoggingOut(false)
    }
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

      {/* Content Container */}
      <View className="mt-auto bg-white px-6 pt-44 h-[60%]">
        <Text className="text-[#003049] text-4xl font-bold font-sans text-center">
          TRAIN MY EAR
        </Text>
        <Text className="text-[#003049] text-2xl text-center mb-12 font-sans">
          A simple tool to help recognize chords by ear.
        </Text>

        <View className="mt-8 mb-16">
          <GuestButton 
            onPress={handleGuestStart} 
            isLoading={isLoggingOut}
          />
          <RegisterLoginButton onPress={handleRegisterLogin} />
        </View>
      </View>
    </SafeAreaView>
  )
}