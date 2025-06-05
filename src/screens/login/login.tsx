"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { TextInput } from "react-native-paper"
import { Provider as PaperProvider } from "react-native-paper"
import BackButton from "@/src/components/ui/buttons/BackButton"
import PrimaryButton from "@/src/components/ui/buttons/PrimaryButton"
import SocialButtons from "@/src/components/ui/buttons/SocialButtons"
import SuccessModal from "@/src/components/ui/modal/success-modal"

export default function LoginScreen() {
  const navigation = useNavigation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setShowSuccessModal(true)
    }, 1500) // Simulate network delay

    console.log("Login with:", email, password)
  }

  const handleContinue = () => {
    setShowSuccessModal(false)
    // Navigate to the next screen (replace 'Dashboard' with your target screen)
    navigation.navigate("SelectInstrument" as never)
  }

  const inputTheme = {
    colors: {
      primary: "#003049", // Active border and label color
      onSurface: "#1F2937", // Input text color
      onSurfaceVariant: "#9CA3AF", // Placeholder text color
      outline: "#D1D5DB", // Inactive border color
      surface: "white", // Background color
      surfaceVariant: "#F9FAFB", // Alternative background
      onBackground: "#1F2937", // Label text color
    },
  }

  return (
    <PaperProvider>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 flex-1">
          <BackButton />

          <View className="mt-16">
            <Text className="text-2xl font-bold text-[#003049]">LOGIN WITH EMAIL</Text>
            <Text className="text-gray-600 mt-1">Hello there, sign in to continue!</Text>
          </View>

          <View className="mt-8 gap-y-3">
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={{ backgroundColor: "white" }}
              theme={inputTheme}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              mode="outlined"
              style={{ backgroundColor: "white" }}
              theme={inputTheme}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          </View>

          <PrimaryButton title="Login" onPress={handleLogin} loading={loading} className="mt-6" />

          <View className="my-8">
            <Text className="text-center text-gray-500 mb-4">Sign in with</Text>
            <SocialButtons />
          </View>

          <View className="flex-row justify-center mt-auto mb-4">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
              <Text className="text-[#006AE6] font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SuccessModal
          visible={showSuccessModal}
          title="Login Successful"
          message="Welcome back! You've been logged in successfully."
          buttonText="Continue "
          onClose={handleContinue}
        />
      </SafeAreaView>
    </PaperProvider>
  )
}
