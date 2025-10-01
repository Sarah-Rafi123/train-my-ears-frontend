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

  // Check if device is tablet (wider than typical phone)
  const isTablet = screenWidth > 600;

  // Utility function to apply responsive scaling to a value
  const responsiveValue = (value: number) => {
    const scaled = Math.round(value * responsiveScale);
    // On tablets, cap the scaling to prevent elements from becoming too large
    return isTablet ? Math.min(scaled, value * 1.3) : scaled;
  };

  // Detect if device is tablet
  const isLandscape = screenWidth > screenHeight;

  // Responsive bottom spacing for tablets
  const getBottomSpacing = () => {
    if (isTablet) {
      return Math.max(responsiveValue(30), 40); // Increased spacing on tablets to prevent overlap
    }
    return Math.max(responsiveValue(25), 35); // Increased spacing on phones
  };

  // Get container styles based on device type
  const getContainerWidth = () => {
    if (isTablet) {
      return Math.min(screenWidth * 0.8, 800); // 80% of screen width, max 800px
    }
    return screenWidth - 48; // Phone with padding
  };

  const containerWidth = getContainerWidth();

  const titleStyle = {
    fontSize: responsiveValue(32),
    lineHeight: responsiveValue(40),
    fontFamily: 'NATS-Regular',
    color: '#003049',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    paddingVertical: responsiveValue(Platform.OS === 'ios' ? 4 : 4),
    letterSpacing: responsiveValue(2),
  };

  const subtitleStyle = {
    fontSize: responsiveValue(20),
    lineHeight: responsiveValue(28),
    fontFamily: 'NATS-Regular',
    color: '#003049',
    textAlign: 'center' as const,
    marginBottom: responsiveValue(15),
    paddingVertical: responsiveValue(Platform.OS === 'ios' ? 6 : 3),
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
    console.log('🔙 [SelectInstrument] Back button pressed - navigating to Home');
    
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
      // Always navigate to Home screen
      console.log('🏠 [SelectInstrument] Navigating to Home screen');
      if (onBack) {
        onBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        className="flex-row  px-6 py-4 items-center"
        style={{
         
        }}
      >
        {!token && <BackButton onPress={handleBack} />}

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
        style={{
          flex: 1,
          alignSelf: 'center',
          width: isTablet ? containerWidth : '100%',
          paddingHorizontal: isTablet ? 32 : 24,
          paddingTop: responsiveValue(10),
        }}
      >
        {/* Title and subtitle section */}
        <View
          style={{
            marginTop: responsiveValue(10),
            marginBottom: responsiveValue(10),
          }}
        >
          <Text style={titleStyle} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.8}>
            TRAIN MY EAR
          </Text>
          <Text style={subtitleStyle} adjustsFontSizeToFit numberOfLines={2}>
            A simple tool to help recognize chords by ear.
          </Text>
        </View>

        {/* Flexible spacer to push buttons down while preventing overlap */}
        <View style={{ flex: 0.3, minHeight: responsiveValue(5) }} />
        
        {/* Button section */}
        <View>
        {loading && (
          <View
            style={{
              marginBottom: getBottomSpacing(),
              flexDirection: isTablet && isLandscape ? 'row' : 'column',
              alignItems: 'center',
              gap: isTablet ? 0 : 16,
              paddingBottom: isTablet ? 20 : 10, // Extra padding for tablets
            }}
          >
            <View style={{
              width: isTablet && isLandscape ? '100%' : '100%',
              maxWidth: isTablet ? 350 : undefined
            }}>
              <InstrumentCardSkeleton />
            </View>
            <View style={{ 
              width: isTablet && isLandscape ? '100%' : '100%',
              maxWidth: isTablet ? 350 : undefined 
            }}>
              <InstrumentCardSkeleton />
            </View>
            
            {/* Logout Button - positioned right after skeleton buttons */}
            {token && (
              <View style={{
                width: '100%',
                marginTop: isTablet ? 20 : 30,
                marginBottom: isTablet ? 20 : Math.max(getBottomSpacing(), 40), // Reduced bottom spacing for tablets
              }}>
                <TouchableOpacity style={[
                  styles.logoutButton, 
                  { 
                    width: '100%',
                    opacity: 0.6,
                    paddingHorizontal: responsiveValue(24),
                    paddingVertical: responsiveValue(12),
                    borderRadius: responsiveValue(12),
                  }
                ]} disabled>
                  <LogoutSvg />
                  <Text style={[styles.logoutText, { opacity: 0.5, fontSize: responsiveValue(18) }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {error && !loading && (
          <View
            className="mb-16 items-center"
            style={{
              marginBottom: responsiveValue(32), // mb-16
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
                fontSize: responsiveValue(14),
                marginBottom: responsiveValue(16), // mb-4
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchInstruments}
              style={{
                width: '100%',
                paddingVertical: responsiveValue(12),
                paddingHorizontal: responsiveValue(24),
                backgroundColor: '#006AE6',
                borderRadius: responsiveValue(12),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                className="text-white font-semibold"
                style={{
                  fontSize: responsiveValue(18),
                }}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {!loading && !error && (
          <View
            style={{
              marginBottom: getBottomSpacing(),
              flexDirection: isTablet && isLandscape ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: isTablet ? 15 : 5, // Extra padding for tablets
            }}
          >
            <View style={{ 
              width: isTablet && isLandscape ? '45%' : '100%',
              maxWidth: isTablet ? 700 : 800 
            }}>
              <InstrumentCard instrument="guitar" onPress={() => handleInstrumentSelect('guitar')} />
            </View>
            <View style={{ 
              width: isTablet && isLandscape ? '45%' : '100%',
              maxWidth: isTablet ? 700 : undefined 
            }}>
              <InstrumentCard instrument="piano" onPress={() => handleInstrumentSelect('piano')} />
            </View>
            
            {/* Logout Button - positioned right after instrument buttons */}
            {token && (
              <View style={{
                width: '100%',
                marginTop: isTablet ? 0 : 30,
                marginBottom: isTablet ? 40 : Math.max(getBottomSpacing(), 40), // Reduced bottom spacing for tablets
              }}>
                <TouchableOpacity style={[
                  styles.logoutButton,
                  {
                    width: '100%',
                    paddingVertical: responsiveValue(12),
                    paddingHorizontal: responsiveValue(24),
          
                  }
                ]} onPress={handleLogout}>
                  <LogoutSvg />
                  <Text style={[styles.logoutText, { fontSize: responsiveValue(18) }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? 25 : 25, 
    paddingBottom: 20, // Reduced bottom padding to prevent logout button being hidden
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    marginBottom: 10, // Reduced margin to prevent button being pushed below view
  
    elevation: 5,
  },
  logoutText: {
    color: '#003049',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
});
