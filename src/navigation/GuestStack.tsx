import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectInstrumentScreen from '../screens/selectInstrument/selectInstrument';
import GameGuestScreen from '../screens/game/gameGuest';
import MenuScreen from '../screens/menu/menu';
import LeaderboardScreen from '../screens/leaderboard/leaderboard';
import AdvanceGameGuestScreen from '../screens/advanceGame/advanceGameGuest';
import SampleScreen from '../screens/sample/sample';
import ViewFeedbackScreen from '../screens/viewFeedback/viewFeedback';
import RegisterScreen from '../screens/register/register';
import LoginScreen from '../screens/login/login';

const Stack = createNativeStackNavigator();

export default function GuestStack() {
  return (
    <Stack.Navigator
      initialRouteName="SelectInstrument"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SelectInstrument" component={SelectInstrumentScreen} />
      <Stack.Screen name="GameGuest" component={GameGuestScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="AdvanceGuest" component={AdvanceGameGuestScreen} />
      <Stack.Screen name="Sample" component={SampleScreen} />
      <Stack.Screen name="ViewFeedback" component={ViewFeedbackScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}