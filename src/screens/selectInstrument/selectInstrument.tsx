import React from 'react';
import { View, Text, SafeAreaView, Image, Alert, Platform, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import BackButton from '@/src/components/ui/buttons/BackButton';
import InstrumentCard from '@/src/components/widgets/InstrumentCard';
import { instrumentsApi, type Instrument } from '@/src/services/instrumentApi';
import musicbg from '@/src/assets/images/musicbg.png';
import { useClerk } from '@clerk/clerk-expo';
import LogoutSvg from '@/src/assets/svgs/Logout'; // Import LogoutSvg

interface SelectInstrumentScreenProps {
  onBack?: () => void;
  onInstrumentSelect?: (instrument: 'guitar' | 'piano') => void;
}

export default function SelectInstrumentScreen({ onBack, onInstrumentSelect }: SelectInstrumentScreenProps) {
  const navigation = useNavigation();
  const { guitarId, pianoId, userId, token, setGuitarId, setPianoId } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { signOut } = useClerk();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const BASE_WIDTH = 375; // Base width for scaling (e.g., iPhone 8)
  const BASE_HEIGHT = 667; // Base height for scaling
  const widthScale = screenWidth / BASE_WIDTH;
  const heightScale = screenHeight / BASE_HEIGHT;
  const responsiveScale = Math.min(widthScale, heightScale); // Use smaller scale for better fit

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
  }, []);

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
    if (instrument === 'guitar') {
      selectedInstrumentId = guitarId;
      console.log('🎸 Selected Guitar ID:', 'cmbyuwdi00002qlhguosiz78c');
    } else if (instrument === 'piano') {
      selectedInstrumentId = pianoId;
      console.log('🎹 Selected Piano ID:', 'cmbyuwdi20003qlhg0w2epml0');
    }
    if (!selectedInstrumentId && instruments.length > 0) {
      const foundInstrument = instruments.find((inst) => inst.name.toLowerCase() === instrument);
      if (foundInstrument) {
        selectedInstrumentId = foundInstrument.id;
        console.log(`🎼 Found ${instrument} ID from loaded instruments:`, selectedInstrumentId);
        if (instrument === 'guitar') {
          await setGuitarId('cmbyuwdi00002qlhguosiz78c');
        } else if (instrument === 'piano') {
          await setPianoId('cmbyuwdi00002qlhguosiz78c');
        }
      }
    }
    if (instrument === 'guitar') {
      navigation.navigate('Game' as never, {
        instrument: 'guitar',
        instrumentId: selectedInstrumentId || undefined,
        userId: userId || undefined,
      });
    } else if (instrument === 'piano') {
      navigation.navigate('Game' as never, {
        instrument: 'piano',
        instrumentId: selectedInstrumentId || undefined,
        userId: userId || undefined,
      });
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔓 Logging out user...');

      // Call both logout functions
      await signOut(); // Clerk logout
      console.log('✅ Successfully logged out from Clerk.');

      // Optionally, also clear local authentication state (if needed)
      // await yourCustomLogout()

      // Show success popup
      Alert.alert(
        'Logged out successfully', // Popup title
        'You have been logged out.', // Popup message
        [
          {
            text: 'OK',
            style: 'default',
            onPress: () => {
              // Navigate to the Home screen after the user presses OK
              navigation.navigate('Home');
            },
          },
        ],
        { cancelable: false } // User cannot dismiss the alert by tapping outside
      );
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        className="flex-row items-center"
        style={{
         
        }}
      >
        {!token && <BackButton onPress={onBack} />} {/* Show BackButton only when there is no token */}

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
          height: responsiveValue(150), // h-64
          marginTop: responsiveValue(112), // mt-28
        }}
      >
        <Image source={musicbg} className="w-full h-full" resizeMode="contain" />
      </View>

      <View
        className="flex-1 px-6 pt-8"
        style={{
          paddingHorizontal: responsiveValue(24), // px-6
          paddingTop: responsiveValue(32), // pt-8
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
            className="mb-16 items-center"
            style={{
              marginBottom: responsiveValue(64), // mb-16
            }}
          >
            <Text
              className="text-[#003049]"
              style={{
                fontSize: responsiveValue(18), // text-lg
              }}
            >
              Loading instruments...
            </Text>
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
            className="mb-16"
            style={{
              marginBottom: responsiveValue(64), // mb-16
            }}
          >
            <InstrumentCard instrument="guitar" onPress={() => handleInstrumentSelect('guitar')} />
            <InstrumentCard instrument="piano" onPress={() => handleInstrumentSelect('piano')} />
              <View className='justify-center items-center mt-4 flex'>
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
