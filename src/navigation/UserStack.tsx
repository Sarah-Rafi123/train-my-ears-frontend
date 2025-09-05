import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectInstrumentScreen from '../screens/selectInstrument/selectInstrument';
import GameScreen from '../screens/game/game';
import MenuScreen from '../screens/menu/menu';
import LeaderboardScreen from '../screens/leaderboard/leaderboard';
import UserStatsScreen from '../screens/userStats/userStats';
import AdvanceGameScreen from '../screens/advanceGame/advanceGame';
import SampleScreen from '../screens/sample/sample';
import ViewFeedbackScreen from '../screens/viewFeedback/viewFeedback';
import RevenueCatScreen from '../screens/revenuecatScreen/revenuecatScreen';

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator
      initialRouteName="SelectInstrument"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SelectInstrument" component={SelectInstrumentScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Stats" component={UserStatsScreen} />
      <Stack.Screen name="Advance" component={AdvanceGameScreen} />
      <Stack.Screen name="Sample" component={SampleScreen} />
      <Stack.Screen name="ViewFeedback" component={ViewFeedbackScreen} />
      <Stack.Screen name="RevenueCatScreen" component={RevenueCatScreen} />
    </Stack.Navigator>
  );
}