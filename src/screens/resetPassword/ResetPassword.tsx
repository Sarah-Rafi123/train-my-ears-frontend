import React, { useState } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import { Provider as PaperProvider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackButton from '@/src/components/ui/buttons/BackButton';
import PrimaryButton from '@/src/components/ui/buttons/PrimaryButton';
import { BASE_URL } from '@/src/constants/urls.constant';

interface RouteParams {
  email: string;
}

const validateResetForm = (code: string, newPassword: string, confirmPassword: string) => {
  const errors: { code?: string; newPassword?: string; confirmPassword?: string } = {};
  
  if (!code.trim()) {
    errors.code = 'Code is required';
  } else if (code.length !== 6) {
    errors.code = 'Code must be 6 digits';
  }
  
  if (!newPassword) {
    errors.newPassword = 'Password is required';
  } else if (newPassword.length < 6) {
    errors.newPassword = 'Password must be at least 6 characters';
  }
  
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params as RouteParams;
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    code: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [validationErrors, setValidationErrors] = useState<{
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

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

  const handleInputChange = (field: 'code' | 'newPassword' | 'confirmPassword', value: string) => {
    switch (field) {
      case 'code':
        setCode(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleInputBlur = (field: 'code' | 'newPassword' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateResetForm(code, newPassword, confirmPassword);
    setValidationErrors((prev) => ({
      ...prev,
      [field]: errors[field],
    }));
  };

  const handleResetPassword = async () => {
    setTouched({ code: true, newPassword: true, confirmPassword: true });
    const errors = validateResetForm(code, newPassword, confirmPassword);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    console.log('🚀 ResetPassword: Starting request for email:', email);

    try {
      const requestBody = { email, code, newPassword };
      console.log('📤 ResetPassword: Request body:', { email, code: '[HIDDEN]', newPassword: '[HIDDEN]' });
      console.log('📤 ResetPassword: Using BASE_URL:', BASE_URL);
      
      const response = await fetch(`${BASE_URL}api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 ResetPassword: Response status:', response.status);
      console.log('📥 ResetPassword: Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      let data;
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // If not JSON, get text response for better error reporting
          const textResponse = await response.text();
          console.error('❌ ResetPassword: Received non-JSON response:', textResponse);
          throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}...`);
        }
      } catch (jsonError) {
        // If JSON parsing fails, get the text response for debugging
        const textResponse = await response.text();
        console.error('❌ ResetPassword: JSON parse error. Response text:', textResponse);
        throw new Error(`Failed to parse JSON response. Server returned: ${textResponse.substring(0, 200)}...`);
      }
      
      console.log('📥 ResetPassword: Response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log('✅ ResetPassword: Success - navigating back to Login');
        Alert.alert(
          'Success',
          'Password updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset navigation stack to clear forgot password flow
                navigation.reset({
                  index: 1,
                  routes: [
                    { name: 'Home' as never },
                    { name: 'Login' as never }
                  ],
                });
              }
            }
          ]
        );
      } else {
        console.log('❌ ResetPassword: API Error Response Status:', response.status);
        console.log('❌ ResetPassword: Full API Error Data:', JSON.stringify(data, null, 2));
        console.log('❌ ResetPassword: data.error:', data.error);
        console.log('❌ ResetPassword: data.message:', data.message);
        console.log('❌ ResetPassword: typeof data.error:', typeof data.error);
        console.log('❌ ResetPassword: typeof data.message:', typeof data.message);
        
        // Safely extract error message, handling various response formats
        let errorMessage = 'Failed to reset password';
        
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
        
        console.log('❌ ResetPassword: Final errorMessage:', errorMessage);
        console.log('❌ ResetPassword: typeof errorMessage:', typeof errorMessage);
        
        // Check if the error is specifically about an incorrect reset code
        const errorMessageStr = String(errorMessage).toLowerCase();
        if (response.status === 400 && (
          errorMessageStr.includes('invalid code') ||
          errorMessageStr.includes('incorrect code') ||
          errorMessageStr.includes('wrong code') ||
          errorMessageStr.includes('expired code') ||
          errorMessageStr.includes('code not found') ||
          errorMessageStr.includes('invalid or expired')
        )) {
          Alert.alert(
            'Invalid or Expired Code',
            'The reset code you entered is invalid or has expired. Please check your email and try again.',
            [
              {
                text: 'Try Again',
                style: 'default',
                onPress: () => {
                  setCode('');
                  setTouched((prev) => ({ ...prev, code: false }));
                  setValidationErrors((prev) => ({ ...prev, code: undefined }));
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', `${errorMessage}`);
        }
      }
    } catch (error) {
      console.log('❌ ResetPassword: Network/Fetch Error:', error);
      console.log('❌ ResetPassword: Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      
      // Handle network errors gracefully
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      Alert.alert(
        'Connection Error',
        `Unable to connect to the server. Please check your internet connection and try again.\n\nError: ${errorMessage}`,
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
              RESET PASSWORD
            </Text>
            <Text className="text-gray-600 font-sans text-lg mt-1">
              Enter the code sent to {email}
            </Text>
          </View>
          <View className="mt-8 gap-y-3">
            <View>
              <TextInput
                label="6-digit code"
                value={code}
                onChangeText={(value) => handleInputChange('code', value)}
                onBlur={() => handleInputBlur('code')}
                keyboardType="numeric"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                style={{ backgroundColor: 'white' }}
                theme={inputTheme}
                error={touched.code && !!validationErrors.code}
              />
              {touched.code && validationErrors.code && (
                <Text className="text-red-500 text-sm mt-1 ml-2">{validationErrors.code}</Text>
              )}
            </View>
            <View>
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                onBlur={() => handleInputBlur('newPassword')}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                style={{ backgroundColor: 'white' }}
                theme={inputTheme}
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
                error={touched.newPassword && !!validationErrors.newPassword}
              />
              {touched.newPassword && validationErrors.newPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-2">{validationErrors.newPassword}</Text>
              )}
            </View>
            <View>
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                style={{ backgroundColor: 'white' }}
                theme={inputTheme}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                error={touched.confirmPassword && !!validationErrors.confirmPassword}
              />
              {touched.confirmPassword && validationErrors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-2">{validationErrors.confirmPassword}</Text>
              )}
            </View>
          </View>
          <PrimaryButton
            title="Update Password"
            onPress={handleResetPassword}
            loading={loading}
            className="mt-6"
            disabled={loading}
          />
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}