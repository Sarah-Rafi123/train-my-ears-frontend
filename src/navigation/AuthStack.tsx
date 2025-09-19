import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/home';
import LoginScreen from '../screens/login/login';
import RegisterScreen from '../screens/register/register';
import SocialRegisterScreen from '../screens/socialRegister/socialRegister';
import ForgotPasswordScreen from '../screens/forgotPassword/ForgotPassword';
import ResetPasswordScreen from '../screens/resetPassword/ResetPassword';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="SocialRegister" component={SocialRegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}