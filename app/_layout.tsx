import 'react-native-reanimated';
import HomeScreen from '@/src/screens/home/home';
import { View, Text, SafeAreaView } from 'react-native';
import SelectInstrumentScreen from '@/src/screens/selectInstrument/selectInstrument';
import { useState } from 'react';
import GameScreen from '@/src/screens/game/game';
import LeaderboardScreen from '@/src/screens/leaderboard/leaderboard';
import MenuScreen from '@/src/screens/menu/menu';
import StatsScreen from '@/src/screens/stats/stats';
import SampleScreen from '@/src/screens/sample/sample';
type Screen = "welcome" | "selectInstrument";

export default function RootLayout() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");

  const handleGetStarted = () => {
    setCurrentScreen("selectInstrument");
  };

  const handleBack = () => {
    setCurrentScreen("welcome");
  };

  const handleInstrumentSelect = (instrument: "guitar" | "piano") => {
    console.log(`User selected: ${instrument}`);
    // Navigate to next screen or handle instrument selection
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <HomeScreen onGetStarted={handleGetStarted} />;
      case "selectInstrument":
        return <SelectInstrumentScreen onBack={handleBack} onInstrumentSelect={handleInstrumentSelect} />;
      default:
        return <HomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-800">
      {/* {renderScreen()} */}
      <LeaderboardScreen/>
    </SafeAreaView>
  );
}

