import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/home';
import LoginScreen from '../screens/login/login';
import RegisterScreen from '../screens/register/register';
import SocialRegisterScreen from '../screens/socialRegister/socialRegister';

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
    </Stack.Navigator>
  );
}