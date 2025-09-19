import React, { useState } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import { Provider as PaperProvider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackButton from '@/src/components/ui/buttons/BackButton';
import PrimaryButton from '@/src/components/ui/buttons/PrimaryButton';
import { BASE_URL } from '@/src/constants/urls.constant';

const validateEmail = (email: string) => {
  if (!email.trim()) {
    return 'Email is required';
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const titleStyle = {
    fontSize: Platform.OS === 'ios' ? 32 : 32,
    lineHeight: Platform.OS === 'ios' ? 40 : 40,
    fontFamily: 'NATS-Regular',
    color: '#003049',
    textAlign: 'left' as const,
    fontWeight: 'bold' as const,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    letterSpacing: 2,
  };

  const inputTheme = {
    colors: {
      primary: '#003049',
      onSurface: '#1F2937',
      onSurfaceVariant: '#9CA3AF',
      outline: '#D1D5DB',
      surface: 'white',
      surfaceVariant: '#F9FAFB',
      onBackground: '#1F2937',
      error: '#EF4444',
    },
  };

  const handleEmailChange = (value: string) => {
    setEmail(value.toLowerCase().trim());
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleEmailBlur = () => {
    setTouched(true);
    const error = validateEmail(email);
    setValidationError(error);
  };

  const handleForgotPassword = async () => {
    setTouched(true);
    const error = validateEmail(email);
    setValidationError(error);

    if (error) {
      return;
    }

    setLoading(true);
    console.log('🚀 ForgotPassword: Starting request for email:', email);

    try {
      const requestBody = { email };
      console.log('📤 ForgotPassword: Request body:', requestBody);
      console.log('📤 ForgotPassword: Using BASE_URL:', BASE_URL);
      
      const response = await fetch(`${BASE_URL}api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 ForgotPassword: Response status:', response.status);
      console.log('📥 ForgotPassword: Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      let data;
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // If not JSON, get text response for better error reporting
          const textResponse = await response.text();
          console.error('❌ ForgotPassword: Received non-JSON response:', textResponse);
          throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}...`);
        }
      } catch (jsonError) {
        // If JSON parsing fails, get the text response for debugging
        const textResponse = await response.text();
        console.error('❌ ForgotPassword: JSON parse error. Response text:', textResponse);
        throw new Error(`Failed to parse JSON response. Server returned: ${textResponse.substring(0, 200)}...`);
      }
      
      console.log('📥 ForgotPassword: Response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log('✅ ForgotPassword: Success - navigating to ResetPassword');
        Alert.alert(
          'Success',
          'Password reset code sent to your email',
          [
            {
              text: 'OK',
              onPress: () => (navigation as any).navigate('ResetPassword', { email })
            }
          ]
        );
      } else {
        console.log('❌ ForgotPassword: API Error:', data.error || 'Failed to send reset code');
        const errorMessage = data.error || data.message || 'Failed to send reset code';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.log('❌ ForgotPassword: Network/Fetch Error:', error);
      console.log('❌ ForgotPassword: Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      Alert.alert('Error', `Network error: ${(error as Error).message}. Please check if the server is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 flex-1">
          <BackButton />
          <View className="mt-20">
            <Text
              style={titleStyle}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              FORGOT PASSWORD
            </Text>
            <Text className="text-gray-600 font-sans text-lg mt-1">
              Enter your email address and we'll send you a reset code
            </Text>
          </View>
          <View className="mt-8">
            <TextInput
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={{ backgroundColor: 'white' }}
              theme={inputTheme}
              error={touched && !!validationError}
            />
            {touched && validationError && (
              <Text className="text-red-500 text-sm mt-1 ml-2">{validationError}</Text>
            )}
          </View>
          <PrimaryButton
            title="Send Reset Code"
            onPress={handleForgotPassword}
            loading={loading}
            className="mt-6"
            disabled={loading}
          />
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}