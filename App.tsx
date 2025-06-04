import "./global.css"
import HomeScreen from "@/src/screens/home/home"
import SelectInstrumentScreen from "@/src/screens/selectInstrument/selectInstrument"
import GameScreen from "@/src/screens/game/game"
import LeaderboardScreen from "@/src/screens/leaderboard/leaderboard"
import MenuScreen from "@/src/screens/menu/menu"
import StatsScreen from "@/src/screens/stats/stats"
import SampleScreen from "@/src/screens/sample/sample"
import LoginScreen from "@/src/screens/login/login"
import RegisterScreen from "@/src/screens/register/register"
import SocialRegisterScreen from "@/src/screens/socialRegister/socialRegister"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

type Screen = "welcome" | "selectInstrument"
const Stack = createNativeStackNavigator()

export default function RootLayout() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Stack.Screen name="SocialRegister" component={SocialRegisterScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SelectInstrument" component={SelectInstrumentScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Sample" component={SampleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
