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
    setEmail(value.trim());
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
      const requestBody = { email: email.toLowerCase() };
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
        // If JSON parsing fails, try to get the text response for debugging
        try {
          const textResponse = await response.text();
          console.error('❌ ForgotPassword: JSON parse error. Response text:', textResponse);
          // Create a fallback data object with the text response as error message
          data = { 
            error: textResponse || 'Server returned an invalid response'
          };
        } catch (textError) {
          console.error('❌ ForgotPassword: Failed to get text response:', textError);
          // If we can't even get text, create a generic error
          data = { 
            error: 'Server returned an invalid response'
          };
        }
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
        console.log('❌ ForgotPassword: API Error Response Status:', response.status);
        console.log('❌ ForgotPassword: Full API Error Data:', JSON.stringify(data, null, 2));
        console.log('❌ ForgotPassword: data.error:', data.error);
        console.log('❌ ForgotPassword: data.message:', data.message);
        console.log('❌ ForgotPassword: typeof data.error:', typeof data.error);
        console.log('❌ ForgotPassword: typeof data.message:', typeof data.message);
        
        // Safely extract error message, handling various response formats
        let errorMessage = 'Failed to send reset code';
        
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (typeof data.error === 'object' && data.error.message) {
            errorMessage = data.error.message;
          } else {
            errorMessage = JSON.stringify(data.error);
          }
        } else if (data.message) {
          if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (typeof data.message === 'object' && data.message.message) {
            errorMessage = data.message.message;
          } else {
            errorMessage = JSON.stringify(data.message);
          }
        }
        
        console.log('❌ ForgotPassword: Final errorMessage:', errorMessage);
        console.log('❌ ForgotPassword: typeof errorMessage:', typeof errorMessage);
        
        // Handle specific error cases with user-friendly messages
        const errorMessageStr = String(errorMessage).toLowerCase();
        if (errorMessageStr.includes('social login')) {
          Alert.alert(
            'Social Login Account',
            'This account uses social login (Google, Facebook, or Apple). Please use your social login provider to access your account instead of resetting the password.',
            [
              {
                text: 'OK',
                style: 'default'
              }
            ]
          );
        } else if (errorMessageStr.includes('not found') || errorMessageStr.includes('does not exist')) {
          Alert.alert(
            'Email Not Found',
            'No account found with this email address. Please check your email or create a new account.',
            [
              {
                text: 'OK',
                style: 'default'
              }
            ]
          );
        } else {
          Alert.alert(
            'Error',
            `${errorMessage}`,
            [
              {
                text: 'OK',
                style: 'default'
              }
            ]
          );
        }
      }
    } catch (error) {
      console.log('❌ ForgotPassword: Network/Fetch Error:', error);
      console.log('❌ ForgotPassword: Error type:', typeof error);
      console.log('❌ ForgotPassword: Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      console.log('❌ ForgotPassword: Full error object:', JSON.stringify(error, null, 2));
      
      // Handle network errors gracefully
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      console.log('❌ ForgotPassword: Final catch errorMessage:', errorMessage);
      
      Alert.alert(
        'Connection Error',
        `Unable to connect to the server. Please check your internet connection and try again.\n\nDetailed Error: ${errorMessage}`,
        [
          {
            text: 'Try Again',
            style: 'default'
          }
        ]
      );
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