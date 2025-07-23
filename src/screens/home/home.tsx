import Homebg from "@/src/assets/images/Homebg.png"
import GuestButton from "@/src/components/ui/buttons/GuestButton"
import RegisterLoginButton from "@/src/components/ui/buttons/RegisterLoginButton"
import { useAuth } from "@/src/context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { Dimensions, Image, Platform, Text, View, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface TrainMyEarScreenProps {
  onGetStarted?: () => void
}

export default function HomeScreen({ onGetStarted }: TrainMyEarScreenProps) {
  const navigation = useNavigation()
  const { logout, isAuthenticated, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height

  // Define a base width and height for scaling (e.g., iPhone 8 dimensions)
  const BASE_WIDTH = 375
  const BASE_HEIGHT = 667

  // Calculate scale factors for width and height
  const widthScale = screenWidth / BASE_WIDTH
  const heightScale = screenHeight / BASE_HEIGHT

  // Use the smaller scale factor to ensure elements don't become too large on very wide/tall screens
  const responsiveScale = Math.min(widthScale, heightScale)

  // Utility function to apply responsive scaling to a value
  const responsiveValue = (value: number) => Math.round(value * responsiveScale)

  const handleRegisterLogin = () => {
    console.log("Register or Login pressed")
    navigation.navigate("SocialRegister" as never)
  }

  const handleGuestStart = async () => {
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
        await logout()
        console.log("✅ Successfully logged out, proceeding as guest")
      } else {
        console.log("ℹ️ No authenticated user, proceeding directly as guest")
      }
      console.log("🎵 Navigating to SelectInstrument as guest")
      navigation.navigate("SelectInstrument" as never)
    } catch (error) {
      console.error("❌ Error during guest logout process:", error)
      console.log("⚠️ Proceeding to SelectInstrument despite logout error")
      navigation.navigate("SelectInstrument" as never)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Create platform-specific and responsive text styles
  const titleStyle = {
    fontSize: responsiveValue(32),
    lineHeight: responsiveValue(40),
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    paddingVertical: responsiveValue(Platform.OS === "ios" ? 4 : 4),
    letterSpacing: responsiveValue(2),
  }

  const subtitleStyle = {
    fontSize: responsiveValue(20),
    lineHeight: responsiveValue(28),
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "center" as const,
    marginBottom: responsiveValue(30),
    paddingVertical: responsiveValue(Platform.OS === "ios" ? 6 : 3),
    paddingHorizontal: responsiveValue(8),
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={Homebg}
          style={[
            styles.backgroundImage,
            {
              width: screenWidth,
              height: screenHeight * 0.6,
            }
          ]}
          resizeMode="cover"
        />
      </View>

      {/* Content Overlay */}
      <View style={[
        styles.contentContainer,
        {
          height: screenHeight * 0.5,
          paddingTop: responsiveValue(50),
          borderTopLeftRadius: responsiveValue(30),
          borderTopRightRadius: responsiveValue(30),
        }
      ]}>
        <Text style={titleStyle} adjustsFontSizeToFit numberOfLines={1}>
          TRAIN MY EAR
        </Text>
        <Text style={subtitleStyle} adjustsFontSizeToFit>
          A simple tool to help recognize chords by ear.
        </Text>
        <View style={{ marginBottom: responsiveValue(64) }}>
          <GuestButton onPress={handleGuestStart} isLoading={isLoggingOut} />
          <RegisterLoginButton onPress={handleRegisterLogin} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    zIndex: 200,
  },
})