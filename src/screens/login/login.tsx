"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"

import BackButton from "@/src/components/ui/buttons/BackButton"
import InputField from "@/src/components/widgets/InputField"
import PrimaryButton from "@/src/components/ui/buttons/PrimaryButton"
import SocialButtons from "@/src/components/ui/buttons/SocialButtons"
import PasswordInput from "@/src/components/widgets/PasswordInput"

export default function LoginScreen() {
  const navigation = useNavigation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    console.log("Login with:", email, password)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-1">
        <BackButton />

        <View className="mt-8">
          <Text className="text-2xl font-bold text-[#003049]">LOGIN WITH EMAIL</Text>
          <Text className="text-gray-600 mt-1">Hello there, sign in to continue!</Text>
        </View>

        <View className="mt-8">
          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
          />
        </View>

        <PrimaryButton title="Login" onPress={handleLogin} className="mt-6" />

        <View className="mt-8">
          <Text className="text-center text-gray-500 mb-4">Sign in with</Text>
          <SocialButtons />
        </View>

        <View className="flex-row justify-center mt-auto mb-4">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
            <Text className="text-blue-500 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
