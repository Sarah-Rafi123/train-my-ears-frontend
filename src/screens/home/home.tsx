"use client"

import { View, Text, Image, Dimensions, Platform } from "react-native"
import GuestButton from "@/src/components/ui/buttons/GuestButton"
import { SafeAreaView } from "react-native-safe-area-context"
import RegisterLoginButton from "@/src/components/ui/buttons/RegisterLoginButton"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react" // Keep useState
import { useAuth } from "@/src/context/AuthContext" // Keep useAuth
import Homebg from "@/src/assets/images/Homebg.png"

interface TrainMyEarScreenProps {
  onGetStarted?: () => void
}

export default function HomeScreen({ onGetStarted }: TrainMyEarScreenProps) {
  const navigation = useNavigation()
  const { logout, isAuthenticated, user } = useAuth() // Keep useAuth destructuring
  const [isLoggingOut, setIsLoggingOut] = useState(false) // Keep isLoggingOut state
  const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height
  const imageHeight = screenHeight * 0.6

  const handleRegisterLogin = () => {
    console.log("Register or Login pressed")
    navigation.navigate("SocialRegister" as never)
  }

  const handleGuestStart = async () => {
    // Make async again
    try {
      console.log("Start as guest pressed")
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

  // Create platform-specific text styles
  const titleStyle = {
    fontSize: Platform.OS === "ios" ? 32 : 32, // Slightly smaller on iOS
    lineHeight: Platform.OS === "ios" ? 40 : 40, // Explicit line height
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    paddingVertical: Platform.OS === "ios" ? 8 : 4, // Extra padding on iOS
    letterSpacing: 2, // Added letter spacing from previous request
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
        <Text
          style={titleStyle}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          TRAIN MY EAR
        </Text>
        <Text
          style={subtitleStyle}
          adjustsFontSizeToFit // Keep adjustsFontSizeToFit
          
        >
          A simple tool to help recognize chords by ear.
        </Text>
        <View className="mb-16">
          <GuestButton onPress={handleGuestStart} isLoading={isLoggingOut} /> {/* Keep isLoading */}
          <RegisterLoginButton onPress={handleRegisterLogin} />
        </View>
      </View>
    </SafeAreaView>
  )
}
