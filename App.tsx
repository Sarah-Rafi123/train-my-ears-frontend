"use client"
import { Provider } from "react-redux"
import { store } from "@/src/store/store"
import { useAppSelector } from "@/src/hooks/redux"
import { NavigationContainer } from "@react-navigation/native"
import "./global.css"
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import AuthProvider, { useAuth } from "./src/context/AuthContext"
import AuthStack from "./src/navigation/AuthStack"
import UserStack from "./src/navigation/UserStack"
import GuestStack from "./src/navigation/GuestStack"
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useCallback, useState } from "react"
import { View, Text, ActivityIndicator, Platform } from "react-native"
import Purchases, {LOG_LEVEL} from "react-native-purchases"
import { revenueCatService } from "./src/services/revenueCatService"
import AsyncStorage from "@react-native-async-storage/async-storage" // Import AsyncStorage
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av"

Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE)

// Disable development menu comprehensively
try {
  // Always try to disable dev menu regardless of environment
  const DevMenu = require('expo-dev-menu')
  if (DevMenu && DevMenu.disableMenu) {
    DevMenu.disableMenu()
    console.log('✅ Development menu disabled')
  }
} catch (error) {
  console.log('ℹ️ Dev menu not available or already disabled')
}

// Also disable any development launcher overlays
try {
  const DevLauncher = require('expo-dev-launcher')
  if (DevLauncher && DevLauncher.isDevLauncherEnabled) {
    DevLauncher.isDevelopmentBuild = false
  }
} catch (error) {
  console.log('ℹ️ Dev launcher not available')
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

// Navigation wrapper component that uses AuthContext
const NavigationWrapper = ({ 
  isGuestMode, 
  setIsGuestMode, 
  isAppInitializing 
}: { 
  isGuestMode: boolean, 
  setIsGuestMode: (value: boolean) => void,
  isAppInitializing: boolean 
}) => {
  const { isAuthenticated, token } = useAuth();
  // Get error state from Redux to prevent navigation during login errors
  const authError = useAppSelector((state) => state.auth.error);
  const authIsLoading = useAppSelector((state) => state.auth.isLoading);
  
  useEffect(() => {
    // Setup RevenueCat user when authentication state changes
    const setupUserRevenueCat = async () => {
      if (isAuthenticated && token) {
        console.log('🎯 [NavigationWrapper] User is authenticated, setting up RevenueCat...');
        
        try {
          await revenueCatService.setupRevenueCatUser();
          console.log('✅ [NavigationWrapper] RevenueCat setup completed successfully');
        } catch (error) {
          console.error('💥 [NavigationWrapper] RevenueCat setup failed:', error);
          
          // Attempt retry after 5 seconds
          setTimeout(async () => {
            console.log('🔄 [NavigationWrapper] Retrying RevenueCat setup...');
            try {
              await revenueCatService.setupRevenueCatUser();
              console.log('✅ [NavigationWrapper] RevenueCat setup succeeded on retry');
            } catch (retryError) {
              console.error('💥 [NavigationWrapper] RevenueCat setup retry also failed:', retryError);
            }
          }, 5000);
        }
        
        // Clear guest mode if user becomes authenticated
        if (isGuestMode) {
          console.log('🔄 [NavigationWrapper] Clearing guest mode - user is now authenticated');
          await AsyncStorage.removeItem("guestMode");
          setIsGuestMode(false);
        }
      } else {
        console.log('🔍 [NavigationWrapper] User not authenticated, skipping RevenueCat user setup');
      }
    };

    setupUserRevenueCat();
  }, [isAuthenticated, token, isGuestMode, setIsGuestMode]);

  useEffect(() => {
    // Listen for guest mode changes in AsyncStorage
    const checkGuestMode = async () => {
      try {
        const guestMode = await AsyncStorage.getItem("guestMode");
        const newGuestMode = guestMode === "true";
        if (newGuestMode !== isGuestMode) {
          console.log('🎭 [NavigationWrapper] Guest mode changed:', newGuestMode);
          setIsGuestMode(newGuestMode);
        }
      } catch (error) {
        console.error('❌ [NavigationWrapper] Error checking guest mode:', error);
      }
    };

    // Check guest mode periodically (every 500ms) to detect changes
    const interval = setInterval(checkGuestMode, 500);
    
    // Also check immediately
    checkGuestMode();

    return () => clearInterval(interval);
  }, [isGuestMode, setIsGuestMode]);

  console.log('🧭 [NavigationWrapper] Navigation state:', {
    isAuthenticated,
    hasToken: !!token,
    isGuestMode,
    isAppInitializing,
    authError: !!authError,
    authIsLoading
  });

  // Only show loading screen for initial app loading, NOT for auth operations
  if (isAppInitializing) {
    return <LoadingScreen />;
  }

  // If there's an auth error, stay in AuthStack to show the error
  // Don't navigate away from login screen when there are credential errors
  if (authError) {
    console.log('⚠️ [NavigationWrapper] Auth error present, staying in AuthStack:', authError);
    return <AuthStack />;
  }

  // Only navigate to UserStack if authentication is successful AND there's no error AND not currently loading
  if (isAuthenticated && token && !authError && !authIsLoading) {
    return <UserStack />;
  } else if (isGuestMode) {
    return <GuestStack />;
  } else {
    return <AuthStack />;
  }
};

// Loading component for app initialization
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
      Loading...
    </Text>
  </View>
)

export default function RootLayout() {
  //const publishableKey = "pk_live_Y2xlcmsudHJhaW5teWVhci5jb20k"
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

  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    async function checkGuestMode() {
      const guestMode = await AsyncStorage.getItem("guestMode") // Check if user is in guest mode
      setIsGuestMode(guestMode === "true")
    }
    checkGuestMode()
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
                <NavigationWrapper 
                  isGuestMode={isGuestMode} 
                  setIsGuestMode={setIsGuestMode}
                  isAppInitializing={!appIsReady}
                />
              </NavigationContainer>
            </AuthProvider>
          </Provider>
        </View>
      </ClerkLoaded>
    </ClerkProvider>
  )
}
