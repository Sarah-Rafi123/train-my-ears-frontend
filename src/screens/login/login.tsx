"use client"
import * as WebBrowser from "expo-web-browser"
import BackButton from "@/src/components/ui/buttons/BackButton"
import PrimaryButton from "@/src/components/ui/buttons/PrimaryButton"
import SocialButtons from "@/src/components/ui/buttons/SocialButtons"
import SuccessModal from "@/src/components/ui/modal/success-modal"
import { ErrorModal } from "@/src/components/ui/modal/error-modal"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { clearError, loginUser } from "@/src/store/slices/authSlice"
import { useAuth } from "@/src/context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { Alert, Text, TouchableOpacity, View, Platform } from "react-native" // Ensure Platform is imported
import { Provider as PaperProvider, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

// Simple validation function for login
const validateLoginForm = (email: string, password: string) => {
  const errors: { email?: string; password?: string } = {}
  if (!email.trim()) {
    errors.email = "Email is required"
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Please enter a valid email address"
  }
  // Password validation - only check for minimum 6 characters
  if (!password) {
    errors.password = "Password is required"
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters long"
  }
  return errors
}

const hasLoginValidationErrors = (errors: { email?: string; password?: string }) => {
  return Object.keys(errors).length > 0
}

export default function LoginScreen() {
  useWarmUpBrowser()
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const { logAllStoredData, getStoredAuthData, userId } = useAuth() // Get userId from context
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })
  const [loginAttempted, setLoginAttempted] = useState(false)

  // Define platform-specific style for the title
  const titleStyle = {
    fontSize: Platform.OS === "ios" ? 32 : 32, // Consistent font size
    lineHeight: Platform.OS === "ios" ? 40 : 40, // Explicit line height
    fontFamily: "NATS-Regular", // Assuming NATS-Regular is available
    color: "#003049",
    textAlign: "left" as const, // Keep left alignment for this screen
    fontWeight: "bold" as const,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    letterSpacing: 2, // Added letter spacing for consistency
  }

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Handle successful login - only show modal after API success
  useEffect(() => {
    if (loginAttempted && isAuthenticated && !isLoading && !error) {
      setShowSuccessModal(true)
      setLoginAttempted(false) // Reset the flag
    }
  }, [loginAttempted, isAuthenticated, isLoading, error])

  // Show error modal instead of Alert
  useEffect(() => {
    if (error && loginAttempted) {
      setShowErrorModal(true)
      setLoginAttempted(false) // Reset the flag
    }
  }, [error, loginAttempted])

  // Log stored data after successful login for verification
  useEffect(() => {
    if (isAuthenticated && !isLoading && !error) {
      setTimeout(async () => {
        console.log("🎉 LoginScreen: Login successful, logging all stored data...")
        console.log("🆔 Current user ID from context:", userId)
        await logAllStoredData()
        const authData = await getStoredAuthData()
        if (authData) {
          console.log("✅ LoginScreen: Successfully retrieved auth data after login:", {
            hasToken: !!authData.token,
            hasRefreshToken: !!authData.refreshToken,
            hasUser: !!authData.user,
            userId: authData.userId,
            userEmail: authData.user?.email,
            userName: authData.user?.name,
          })
        }
      }, 1000)
    }
  }, [isAuthenticated, isLoading, error, logAllStoredData, getStoredAuthData, userId])

  const handleInputChange = (field: "email" | "password", value: string) => {
    switch (field) {
      case "email":
        setEmail(value.toLowerCase().trim())
        break
      case "password":
        setPassword(value)
        break
    }
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleInputBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    // Validate single field on blur
    const errors = validateLoginForm(email, password)
    setValidationErrors((prev) => ({
      ...prev,
      [field]: errors[field],
    }))
  }

  const handleLogin = async () => {
    // Mark all fields as touched to show validation errors
    setTouched({ email: true, password: true })
    // Validate all fields
    const errors = validateLoginForm(email, password)
    setValidationErrors(errors)
    // Check if there are validation errors
    if (hasLoginValidationErrors(errors)) {
      return
    }
    // Check if any field is empty
    if (!email.trim() || !password) {
      Alert.alert("Missing Information", "Please fill in all required fields.", [{ text: "OK" }])
      return
    }
    // Set flag to track login attempt
    setLoginAttempted(true)
    console.log("🚀 LoginScreen: Starting login process for:", email)
    // All validations passed, proceed with login
    dispatch(
      loginUser({
        email: email.trim(),
        password: password,
      }),
    )
  }

  const handleContinue = () => {
    setShowSuccessModal(false)
    console.log("➡️ LoginScreen: Navigating to SelectInstrument screen")
    // Navigate to the next screen
    navigation.navigate("SelectInstrument" as never)
  }

  const handleErrorClose = () => {
    setShowErrorModal(false)
    dispatch(clearError())
  }

  const inputTheme = {
    colors: {
      primary: "#003049",
      onSurface: "#1F2937",
      onSurfaceVariant: "#9CA3AF",
      outline: "#D1D5DB",
      surface: "white",
      surfaceVariant: "#F9FAFB",
      onBackground: "#1F2937",
      error: "#EF4444",
    },
  }

  return (
    <PaperProvider>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 flex-1">
          <BackButton />
          <View></View>
          <View className="mt-20">
            <Text
              style={titleStyle} // Apply the new style object
              adjustsFontSizeToFit // Ensure text fits
              numberOfLines={1} // Limit to one line
              minimumFontScale={0.8} // Allow font to scale down
            >
              LOGIN WITH EMAIL
            </Text>
            <Text className="text-gray-600 font-sans text-lg mt-1">Hello there, sign in to continue!</Text>
          </View>
          <View className="mt-8 gap-y-3">
            <View>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(value) => handleInputChange("email", value)}
                onBlur={() => handleInputBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                style={{ backgroundColor: "white" }}
                theme={inputTheme}
                error={touched.email && !!validationErrors.email}
              />
              {touched.email && validationErrors.email && (
                <Text className="text-red-500 text-sm mt-1 ml-2">{validationErrors.email}</Text>
              )}
            </View>
            <View>
              <TextInput
                label="Password"
                value={password}
                onChangeText={(value) => handleInputChange("password", value)}
                onBlur={() => handleInputBlur("password")}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                style={{ backgroundColor: "white" }}
                theme={inputTheme}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                error={touched.password && !!validationErrors.password}
              />
              {touched.password && validationErrors.password && (
                <Text className="text-red-500 text-sm mt-1 ml-2">{validationErrors.password}</Text>
              )}
            </View>
          </View>
          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            className="mt-6"
            disabled={isLoading}
          />
          <View className="my-8 mt-20">
            <Text className="text-center text-lg text-black mb-4">Sign in with</Text>
            <SocialButtons />
          </View>
          <View className="flex-row justify-center mt-auto mb-4">
            <Text className="text-gray-600 text-lg">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
              <Text className="text-[#006AE6] text-lg font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
        <SuccessModal
          visible={showSuccessModal}
          title="Welcome Back!"
          message=""
          buttonText="Continue"
          onClose={handleContinue}
        />
        <ErrorModal
          visible={showErrorModal}
          title="Login Failed"
          message={error || "An error occurred during login. Please try again."}
          onClose={handleErrorClose}
        />
      </SafeAreaView>
    </PaperProvider>
  )
}
