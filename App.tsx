import { Provider } from 'react-redux'
import { store } from '@/src/store/store'
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
import ViewFeedbackScreen from './src/screens/viewFeedback/viewFeedback'
import AuthProvider from './src/context/AuthContext'
import { ClerkProvider, ClerkLoaded} from '@clerk/clerk-expo'
import { useFonts } from 'expo-font';
type Screen = "welcome" | "selectInstrument"
const Stack = createNativeStackNavigator()

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_c3R1bm5pbmctbWFrby05NS5jbGVyay5hY2NvdW50cy5kZXYk"
  if(!publishableKey) {
    console.error("Clerk publishable key is missing")
    return null
  }
  const [fontsLoaded] = useFonts({
    'NATS-Regular': require('./src/assets/fonts/NATS-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }
  return (
     <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
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
  )
}