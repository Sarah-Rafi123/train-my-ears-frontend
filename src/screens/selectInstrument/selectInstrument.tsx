import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Image, Alert, Platform, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/src/context/AuthContext';
import BackButton from '@/src/components/ui/buttons/BackButton';
import InstrumentCard from '@/src/components/widgets/InstrumentCard';
import InstrumentCardSkeleton from '@/src/components/ui/skeletons/InstrumentCardSkeleton';
import { instrumentsApi, type Instrument } from '@/src/services/instrumentApi';
import musicbg from '@/src/assets/images/musicbg.png';
import LogoutSvg from '@/src/assets/svgs/Logout'; // Import LogoutSvg
import { useDispatch } from 'react-redux';
import { setSelectedInstrument } from '@/src/store/slices/instrumentSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SelectInstrumentScreenProps {
  onBack?: () => void;
  onInstrumentSelect?: (instrument: 'guitar' | 'piano') => void;
}

export default function SelectInstrumentScreen({ onBack, onInstrumentSelect }: SelectInstrumentScreenProps) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { guitarId, pianoId, userId, token, setGuitarId, setPianoId, logout } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Define a base width and height for scaling (e.g., iPhone 8 dimensions)
  const BASE_WIDTH = 375;
  const BASE_HEIGHT = 667;

  // Calculate scale factors for width and height
  const widthScale = screenWidth / BASE_WIDTH;
  const heightScale = screenHeight / BASE_HEIGHT;

  // Use the smaller scale factor to ensure elements don't become too large on very wide/tall screens
  const responsiveScale = Math.min(widthScale, heightScale);

  // Utility function to apply responsive scaling to a value
  const responsiveValue = (value: number) => Math.round(value * responsiveScale);

  const titleStyle = {
    fontSize: responsiveValue(32),
    lineHeight: responsiveValue(40),
    fontFamily: 'NATS-Regular',
    color: '#003049',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    paddingVertical: responsiveValue(Platform.OS === 'ios' ? 8 : 4),
    letterSpacing: responsiveValue(2),
  };

  const subtitleStyle = {
    fontSize: responsiveValue(20),
    lineHeight: responsiveValue(28),
    fontFamily: 'NATS-Regular',
    color: '#003049',
    textAlign: 'center' as const,
    marginBottom: responsiveValue(6),
    paddingVertical: responsiveValue(Platform.OS === 'ios' ? 3 : 3),
    paddingHorizontal: responsiveValue(8),
  };

  useEffect(() => {
    fetchInstruments();
    checkGuestMode();
  }, []);

  const checkGuestMode = async () => {
    try {
      const guestMode = await AsyncStorage.getItem("guestMode");
      const isGuest = guestMode === "true";
      setIsGuestMode(isGuest);
      console.log('🔍 [SelectInstrument] Guest mode status:', isGuest);
    } catch (error) {
      console.error('❌ [SelectInstrument] Error checking guest mode:', error);
    }
  };

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎵 SelectInstrumentScreen: Fetching instruments...');
      const response = await instrumentsApi.getInstruments();
      if (response.success && response.data.instruments) {
        setInstruments(response.data.instruments);
        console.log('✅ SelectInstrumentScreen: Instruments loaded successfully');
        const guitarInstrument = response.data.instruments.find(
          (instrument) => instrument.name.toLowerCase() === 'guitar'
        );
        const pianoInstrument = response.data.instruments.find(
          (instrument) => instrument.name.toLowerCase() === 'piano'
        );
        if (guitarInstrument && !guitarId) {
          await setGuitarId(guitarInstrument.id);
          console.log('🎸 SelectInstrumentScreen: Guitar ID stored:', guitarInstrument.id);
        }
        if (pianoInstrument && !pianoId) {
          await setPianoId(pianoInstrument.id);
          console.log('🎹 SelectInstrumentScreen: Piano ID stored:', pianoInstrument.id);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load instruments';
      setError(errorMessage);
      console.error('❌ SelectInstrumentScreen: Error fetching instruments:', errorMessage);
      if (__DEV__) {
        Alert.alert('Error', `Failed to load instruments: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstrumentSelect = async (instrument: 'guitar' | 'piano') => {
    console.log(`🎯 SelectInstrumentScreen: Selected instrument: ${instrument}`);
    onInstrumentSelect?.(instrument);
    let selectedInstrumentId: string | null = null;
    
    // Always get the correct instrument ID from the loaded instruments
    if (instruments.length > 0) {
      const foundInstrument = instruments.find((inst) => inst.name.toLowerCase() === instrument);
      if (foundInstrument) {
        selectedInstrumentId = foundInstrument.id;
        console.log(`🎼 Found ${instrument} ID from loaded instruments:`, selectedInstrumentId);
        // Update the auth context with the correct ID
        if (instrument === 'guitar') {
          await setGuitarId(foundInstrument.id);
          console.log('🎸 Updated Guitar ID:', selectedInstrumentId);
        } else if (instrument === 'piano') {
          await setPianoId(foundInstrument.id);
          console.log('🎹 Updated Piano ID:', selectedInstrumentId);
        }
      }
    }
    
    // Fallback to auth context values if instruments not loaded
    if (!selectedInstrumentId) {
      if (instrument === 'guitar') {
        selectedInstrumentId = guitarId;
        console.log('🎸 Fallback Guitar ID:', selectedInstrumentId);
      } else if (instrument === 'piano') {
        selectedInstrumentId = pianoId;
        console.log('🎹 Fallback Piano ID:', selectedInstrumentId);
      }
    }

    // Set the selected instrument in Redux store
    if (selectedInstrumentId) {
      dispatch(setSelectedInstrument(selectedInstrumentId));
      console.log(`🎼 Updated Redux with selected instrument ID: ${selectedInstrumentId}`);
    }
    // Navigate to appropriate screen based on authentication status
    const gameScreenName = userId ? 'Game' : 'GameGuest'
    
    if (instrument === 'guitar') {
      navigation.navigate(gameScreenName as never, {
        instrument: 'guitar',
        instrumentId: selectedInstrumentId || undefined,
        userId: userId || undefined,
      });
      console.log(`🎮 Navigating to ${gameScreenName} for guitar`, { userId: !!userId, isGuest: !userId });
    } else if (instrument === 'piano') {
      navigation.navigate(gameScreenName as never, {
        instrument: 'piano',
        instrumentId: selectedInstrumentId || undefined,
        userId: userId || undefined,
      });
      console.log(`🎮 Navigating to ${gameScreenName} for piano`, { userId: !!userId, isGuest: !userId });
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔓 Logging out user...');

      // Use the AuthContext logout function which handles everything
      await logout();
      console.log('✅ Successfully logged out.');

      // Show success popup
      Alert.alert(
        'Logged out successfully', // Popup title
        'You have been logged out.', // Popup message
        [
          {
            text: 'OK',
            style: 'default',
            onPress: () => {
              // No need to navigate - the App.tsx will automatically switch to AuthStack
              // when the authentication state changes
              console.log('🏠 Logout complete - App will automatically show AuthStack');
            },
          },
        ],
        { cancelable: false } // User cannot dismiss the alert by tapping outside
      );
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Even if there's an error, show a message
      Alert.alert(
        'Logout Error',
        'There was an issue logging out, but your session has been cleared.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleBack = async () => {
    console.log('🔙 [SelectInstrument] Back button pressed');
    
    if (isGuestMode) {
      console.log('🎭 [SelectInstrument] In guest mode, clearing guest mode to return to Home');
      try {
        await AsyncStorage.removeItem("guestMode");
        console.log('✅ [SelectInstrument] Guest mode cleared - App will switch to AuthStack');
        // The NavigationWrapper will detect this change and switch to AuthStack automatically
      } catch (error) {
        console.error('❌ [SelectInstrument] Error clearing guest mode:', error);
      }
    } else {
      // If not in guest mode, use the provided onBack callback or default navigation
      console.log('👤 [SelectInstrument] Not in guest mode, using default back behavior');
      if (onBack) {
        onBack();
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        className="flex-row items-center"
        style={{
         
        }}
      >
        {!token && <BackButton onPress={handleBack} />} {/* Show BackButton with custom back logic */}

        <View className="flex-1">
          <Text
            className="text-[#003049] font-semibold justify-center items-center flex text-center"
            style={{
              fontSize: responsiveValue(18), // text-lg
              marginTop: responsiveValue(10), // mt-5
            }}
          >
            Select an Instrument
          </Text>
        </View>

        {/* Show logout button in the top-right corner if token exists */}
      
      </View>

      <View
        className="w-full"
        style={{
          height: responsiveValue(150),
          marginTop: responsiveValue(112),
        }}
      >
        <Image source={musicbg} className="w-full h-full" resizeMode="contain" />
      </View>

      <View
        className="flex-1"
        style={{
          paddingHorizontal: 24,
          paddingTop: responsiveValue(32),
        }}
      >
        <View
          className="mb-8 mt-auto"
          style={{
            marginBottom: responsiveValue(32), // mb-8
          }}
        >
          <Text style={titleStyle} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.8}>
            TRAIN MY EAR
          </Text>
          <Text style={subtitleStyle} adjustsFontSizeToFit numberOfLines={2}>
            A simple tool to help recognize chords by ear.
          </Text>
        </View>
        {loading && (
          <View
            style={{
              marginBottom: responsiveValue(64),
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <View style={{ width: '100%' }}>
              <InstrumentCardSkeleton />
            </View>
            <View style={{ width: '100%' }}>
              <InstrumentCardSkeleton />
            </View>
            <View className='justify-center items-center mt-4 flex' style={{
              width: '100%',
              marginTop: 16,
            }}>
              {token && (
                <TouchableOpacity style={styles.logoutButton} disabled>
                  <LogoutSvg />
                  <Text style={[styles.logoutText, { opacity: 0.5 }]}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {error && !loading && (
          <View
            className="mb-16 items-center"
            style={{
              marginBottom: responsiveValue(64), // mb-16
            }}
          >
            <Text
              className="text-red-500 text-center"
              style={{
                fontSize: responsiveValue(18), // text-lg
                marginBottom: responsiveValue(16), // mb-4
              }}
            >
              Failed to load instruments
            </Text>
            <Text
              className="text-gray-600 text-center"
              style={{
                marginBottom: responsiveValue(16), // mb-4
              }}
            >
              {error}
            </Text>
            <Text
              className="text-[#006AE6] font-semibold"
              onPress={fetchInstruments}
              style={{
                fontSize: responsiveValue(18), // text-lg
              }}
            >
              Retry
            </Text>
          </View>
        )}
        {!loading && !error && (
          <View
            style={{
              marginBottom: responsiveValue(64),
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <View style={{ width: '100%' }}>
              <InstrumentCard instrument="guitar" onPress={() => handleInstrumentSelect('guitar')} />
            </View>
            <View style={{ width: '100%' }}>
              <InstrumentCard instrument="piano" onPress={() => handleInstrumentSelect('piano')} />
            </View>
            <View className='justify-center items-center mt-4 flex' style={{
              width: '100%',
              marginTop: 16,
            }}>
              {token && (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <LogoutSvg />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoutButton: {
    top: 2,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  logoutText: {
    color: '#003049',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4, // Add space between the icon and the text
  },
});
