"use client"

import { Provider } from "react-redux"
import { store } from "@/src/store/store"
import GameScreen from "@/src/screens/game/game"
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
import UserStatsScreen from "./src/screens/userStats/userStats"
import ViewFeedbackScreen from "./src/screens/viewFeedback/viewFeedback"
import AuthProvider from "./src/context/AuthContext"
import { ClerkProvider, ClerkLoaded} from '@clerk/clerk-expo'
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useCallback, useState } from "react"
import { View, Text, ActivityIndicator, Platform } from "react-native"

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
  const publishableKey = "pk_test_c3R1bm5pbmctbWFrby05NS5jbGVyay5hY2NvdW50cy5kZXYk"
  if(!publishableKey) {
    console.error("Clerk publishable key is missing")
    return null
  }
  const [appIsReady, setAppIsReady] = useState(false)

  const [fontsLoaded, fontError] = useFonts({
    "NATS-Regular": require("./src/assets/fonts/NATS-Regular.ttf"),
    // Add more font weights if available
    // "NATS-Bold": require("./src/assets/fonts/NATS-Bold.ttf"),
  })

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
              initialRouteName="Home"
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
              <Stack.Screen name="Menu" component={MenuScreen} />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
              <Stack.Screen name="Stats" component={UserStatsScreen} />
              <Stack.Screen name="Advance" component={AdvanceGameScreen} />
              <Stack.Screen name="Sample" component={SampleScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </Provider>
    </ClerkLoaded>
    </ClerkProvider>
    </View>
  )
}
