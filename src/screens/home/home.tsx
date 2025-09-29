import Homebg from "@/src/assets/images/Homebg.png"
import GuestButton from "@/src/components/ui/buttons/GuestButton"
import RegisterLoginButton from "@/src/components/ui/buttons/RegisterLoginButton"
import { useAuth } from "@/src/context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { Dimensions, Image, Platform, Text, View, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useClerk } from "@clerk/clerk-expo"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface TrainMyEarScreenProps {
  onGetStarted?: () => void
}

export default function HomeScreen({ onGetStarted }: TrainMyEarScreenProps) {
  const navigation = useNavigation()
  const { logout, isAuthenticated, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
const { signOut } = useClerk()

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

  // Check if device is tablet (wider than typical phone)
  const isTablet = screenWidth > 600

  // Utility function to apply responsive scaling to a value
  const responsiveValue = (value: number) => {
    const scaled = Math.round(value * responsiveScale)
    // On tablets, cap the scaling to prevent elements from becoming too large
    return isTablet ? Math.min(scaled, value * 1.3) : scaled
  }

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

      // Call both logout functions
      await Promise.allSettled([
        logout(),     // your custom logout (maybe clears local state or async storage)
        signOut(),    // Clerk's logout
      ])

      console.log("✅ Successfully logged out from both Clerk and App context")
    } else {
      console.log("ℹ️ No authenticated user, proceeding directly as guest")
    }

    // Set guest mode in AsyncStorage instead of navigating
    console.log("🎭 Setting guest mode in AsyncStorage")
    await AsyncStorage.setItem("guestMode", "true")
    console.log("✅ Guest mode enabled - App will automatically switch to GuestStack")
    
    // The NavigationWrapper in App.tsx will detect this change and switch to GuestStack
    // which will automatically show SelectInstrument as its initial screen
  } catch (error) {
    console.error("❌ Error during guest setup process:", error)
    // Even if there's an error, try to set guest mode
    try {
      await AsyncStorage.setItem("guestMode", "true")
      console.log("⚠️ Set guest mode despite error")
    } catch (storageError) {
      console.error("❌ Failed to set guest mode:", storageError)
    }
  } finally {
    setIsLoggingOut(false)
  }
}


  // Create platform-specific and responsive text styles
  const titleStyle = {
    fontSize:isTablet ? responsiveValue(34) : responsiveValue(32),
    lineHeight: responsiveValue(40),
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    paddingVertical: responsiveValue(Platform.OS === "ios" ? 4 : 4),
    letterSpacing: responsiveValue(2),
  }

  const subtitleStyle = {
    fontSize: isTablet ? responsiveValue(25) : responsiveValue(18),
    lineHeight: responsiveValue(28),
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "center" as const,
    marginBottom: isTablet ? responsiveValue(60) : responsiveValue(30), // More space on tablets
    paddingVertical: responsiveValue(Platform.OS === "ios" ? 6 : 3),
    paddingHorizontal: responsiveValue(8),
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={Homebg}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* Content Overlay */}
      <View style={[
        styles.contentContainer,
        {
          paddingTop: responsiveValue(40),
          borderTopLeftRadius: responsiveValue(30),
          borderTopRightRadius: responsiveValue(30),
          // Adjust top position for tablets to give more space for buttons
          top: isTablet ? '55%' : '60%',
        }
      ]}>
        <Text style={titleStyle} numberOfLines={1}>
          TRAIN MY EAR
        </Text>
        <Text style={subtitleStyle} numberOfLines={1}>
          A simple tool to help recognize chords by ear.
        </Text>
        {/* Additional spacer for tablets */}
        {isTablet && <View style={{ height: responsiveValue(40) }} />}
        <View style={[
          styles.buttonContainer,
          {
            marginBottom: Math.max(responsiveValue(64), isTablet ? 60 : 40), // More margin on tablets
            paddingBottom: isTablet ? responsiveValue(40) : responsiveValue(20), // More padding for tablets
          }
        ]}>
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
    bottom: '30%', // Leave 30% at bottom for content overlay
    zIndex: 100,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '60%', 
    backgroundColor: 'white',
    paddingHorizontal: 24,
    zIndex: 200,
    minHeight: 300, // Ensure minimum height for content
    justifyContent: 'space-between', // Distribute content evenly
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Push buttons to bottom
    paddingBottom: 20, // Base padding at bottom
  },
})