"use client"
import { Provider } from "react-redux"
import { store } from "@/src/store/store"
import GameScreen from "@/src/screens/game/game"
import GameGuestScreen from "@/src/screens/game/gameGuest"
import HomeScreen from "@/src/screens/home/home"
import LeaderboardScreen from "@/src/screens/leaderboard/leaderboard"
import LoginScreen from "@/src/screens/login/login"
import MenuScreen from "@/src/screens/menu/menu"
import RegisterScreen from "@/src/screens/register/register"
import SampleScreen from "@/src/screens/sample/sample"
import SelectInstrumentScreen from "@/src/screens/selectInstrument/selectInstrument"
import SocialRegisterScreen from "@/src/screens/socialRegister/socialRegister"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import "./global.css"
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import AdvanceGameScreen from "./src/screens/advanceGame/advanceGame"
import AdvanceGameGuestScreen from "./src/screens/advanceGame/advanceGameGuest"
import UserStatsScreen from "./src/screens/userStats/userStats"
import ViewFeedbackScreen from "./src/screens/viewFeedback/viewFeedback"
import AuthProvider from "./src/context/AuthContext"
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useCallback, useState } from "react"
import { View, Text, ActivityIndicator, Platform } from "react-native"
import Purchases, {LOG_LEVEL} from "react-native-purchases"
import { revenueCatService } from "./src/services/revenueCatService"
import RevenueCatScreen from "./src/screens/revenuecatScreen/revenuecatScreen"
import AsyncStorage from "@react-native-async-storage/async-storage" // Import AsyncStorage
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av"

Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE)
// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()

// Loading component with better font handling
const LoadingScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffffff",
    }}
  >
    <ActivityIndicator size="large" color="#003049" />
    <Text
      style={{
        marginTop: 16,
        fontSize: 16,
        fontFamily: Platform.OS === "ios" ? "System" : "Roboto", // Use system font for loading
        lineHeight: 24,
        textAlign: "center",
      }}
    >
      Loading fonts...
    </Text>
  </View>
)

export default function RootLayout() {
  const publishableKey = "pk_test_ZXRoaWNhbC10YWhyLTYxLmNsZXJrLmFjY291bnRzLmRldiQ"
  if (!publishableKey) {
    console.error("Clerk publishable key is missing")
    return null
  }
  const [appIsReady, setAppIsReady] = useState(false)
  const [fontsLoaded, fontError] = useFonts({
    "NATS-Regular": require("./src/assets/fonts/NATS-Regular.ttf"),
    // Add more font weights if available
    // "NATS-Bold": require("./src/assets/fonts/NATS-Bold.ttf"),
  })

  // Check for stored token in AsyncStorage
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    async function checkToken() {
      const token = await AsyncStorage.getItem("token") // Retrieve token from AsyncStorage
      if (token) {
        setHasToken(true) // If token exists, user is authenticated
      }
    }
    checkToken()
  }, [])

  useEffect(() => {
    // Initialize RevenueCat for anonymous users first
    const initializeRevenueCat = async () => {
      await revenueCatService.setupAnonymousRevenueCat()
    }

    // Configure Audio Session for iOS
    const configureAudio = async () => {
      try {
        if (Platform.OS === "ios") {
          await Audio.requestPermissionsAsync()
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
          })
          console.log("✅ iOS Audio session configured successfully")
        } else if (Platform.OS === "android") {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
          })
          console.log("✅ Android Audio session configured successfully")
        }
      } catch (error) {
        console.error("❌ Error configuring audio session:", error)
      }
    }
    
    initializeRevenueCat()
    configureAudio()
  }, [])

  // Setup RevenueCat user when authentication state changes
  useEffect(() => {
    console.log('🔄 [App.tsx] Authentication state changed:', { hasToken });
    
    const setupUserRevenueCat = async () => {
      if (hasToken) {
        console.log('🎯 [App.tsx] User is authenticated, setting up RevenueCat...');
        // User is logged in, setup RevenueCat with their user ID
        await revenueCatService.setupRevenueCatUser()
      } else {
        console.log('🔍 [App.tsx] User not authenticated, skipping RevenueCat user setup');
      }
    }

    setupUserRevenueCat()
  }, [hasToken]) // Trigger when authentication state changes
  useEffect(() => {
    async function prepare() {
      try {
        // Add a small delay to ensure fonts are fully processed
        if (fontsLoaded || fontError) {
          // Small delay for iOS font processing
          if (Platform.OS === "ios") {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
          setAppIsReady(true)
        }
      } catch (e) {
        console.warn("Error during app preparation:", e)
        setAppIsReady(true) // Continue even if there's an error
      }
    }

    prepare()
  }, [fontsLoaded, fontError])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return <LoadingScreen />
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <Provider store={store}>
            <AuthProvider>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName={hasToken ? "SelectInstrument" : "Home"} // Conditional initial route
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="ViewFeedback" component={ViewFeedbackScreen} />
                  <Stack.Screen name="SocialRegister" component={SocialRegisterScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="SelectInstrument" component={SelectInstrumentScreen} />
                  <Stack.Screen name="Game" component={GameScreen} />
                  <Stack.Screen name="GameGuest" component={GameGuestScreen} />
                  <Stack.Screen name="Menu" component={MenuScreen} />
                  <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
                  <Stack.Screen name="Stats" component={UserStatsScreen} />
                  <Stack.Screen name="Advance" component={AdvanceGameScreen} />
                  <Stack.Screen name="AdvanceGuest" component={AdvanceGameGuestScreen} />
                  <Stack.Screen name="Sample" component={SampleScreen} />
                  <Stack.Screen name="RevenueCatScreen" component={RevenueCatScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </AuthProvider>
          </Provider>
        </View>
      </ClerkLoaded>
    </ClerkProvider>
  )
}
