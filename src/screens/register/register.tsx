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

export default function RegisterScreen() {
  const navigation = useNavigation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = () => {
    // Implement registration logic here
    console.log("Register with:", name, email, password)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-1">
        <BackButton />

        <View className="mt-8">
          <Text className="text-2xl font-bold text-[#003049]">CREATE YOUR ACCOUNT</Text>
          <Text className="text-[#003049] text-sm mt-1">Hello there, sign in to continue!</Text>
        </View>

        <View className="mt-8">
          <InputField label="Name" value={name} onChangeText={setName} placeholder="Enter your name" />

          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordInput label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" />
        </View>

        <PrimaryButton title="Create your account" onPress={handleRegister} className="mt-6" />

        <View className="mt-8">
          <Text className="text-center text-gray-500 mb-4">Sign up with</Text>
          <SocialButtons />
        </View>

        <View className="flex-row justify-center mt-auto mb-4">
          <Text className="text-black text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
            <Text className="text-[#006AE6] font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
