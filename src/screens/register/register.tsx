"use client"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { TextInput } from "react-native-paper"
import { Provider as PaperProvider } from "react-native-paper"
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux"
import { registerUser, clearError } from "@/src/store/slices/authSlice"
import { useAuth } from "@/src/context/AuthContext"
import BackButton from "@/src/components/ui/buttons/BackButton"
import PrimaryButton from "@/src/components/ui/buttons/PrimaryButton"
import SocialButtons from "@/src/components/ui/buttons/SocialButtons"
import SuccessModal from "@/src/components/ui/modal/success-modal"
import { ErrorModal } from "@/src/components/ui/modal/error-modal"

// Simple validation function for registration
const validateRegistrationForm = (name: string, email: string, password: string) => {
  const errors: { name?: string; email?: string; password?: string } = {}
  // Name validation
  if (!name.trim()) {
    errors.name = "Name is required"
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long"
  } else if (name.trim().length > 50) {
    errors.name = "Name must not exceed 50 characters"
  }
  // Email validation
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

const hasValidationErrors = (errors: { name?: string; email?: string; password?: string }) => {
  return Object.keys(errors).length > 0
}

export default function RegisterScreen() {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const { logAllStoredData, getStoredAuthData } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  })
  const [registrationAttempted, setRegistrationAttempted] = useState(false)
  // NEW: Separate loading state for email/password registration
  const [isEmailRegisterLoading, setIsEmailRegisterLoading] = useState(false)

  // Define platform-specific style for the title
  const titleStyle = {
    fontSize: Platform.OS === "ios" ? 32 : 32,
    lineHeight: Platform.OS === "ios" ? 40 : 40,
    fontFamily: "NATS-Regular",
    color: "#003049",
    textAlign: "left" as const,
    fontWeight: "bold" as const,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    letterSpacing: 2,
  }

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Handle successful registration - only show modal after API success
  useEffect(() => {
    if (registrationAttempted && isAuthenticated && !isLoading && !error) {
      setShowSuccessModal(true)
      setRegistrationAttempted(false)
      setIsEmailRegisterLoading(false) // Reset email registration loading
    }
  }, [registrationAttempted, isAuthenticated, isLoading, error])

  // Show error modal instead of Alert
  useEffect(() => {
    if (error && registrationAttempted) {
      setShowErrorModal(true)
      setRegistrationAttempted(false)
      setIsEmailRegisterLoading(false) // Reset email registration loading on error
    }
  }, [error, registrationAttempted])

  // Log stored data after successful registration for verification
  useEffect(() => {
    if (isAuthenticated && !isLoading && !error) {
      setTimeout(async () => {
        console.log("🎉 RegisterScreen: Registration successful, logging all stored data...")
        await logAllStoredData()
        const authData = await getStoredAuthData()
        if (authData) {
          console.log("✅ RegisterScreen: Successfully retrieved auth data after registration:", {
            hasToken: !!authData.token,
            hasRefreshToken: !!authData.refreshToken,
            hasUser: !!authData.user,
            userId: authData.userId,
            userEmail: authData.user?.email,
            userName: authData.user?.name,
            userLevel: authData.user?.currentLevel,
          })
        }
      }, 1000)
    }
  }, [isAuthenticated, isLoading, error, logAllStoredData, getStoredAuthData])

  const handleInputChange = (field: "name" | "email" | "password", value: string) => {
    switch (field) {
      case "name":
        if (value.length <= 50) {
          setName(value)
        }
        break
      case "email":
        setEmail(value.toLowerCase().trim())
        break
      case "password":
        setPassword(value)
        break
    }
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleInputBlur = (field: "name" | "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errors = validateRegistrationForm(name, email, password)
    setValidationErrors((prev) => ({
      ...prev,
      [field]: errors[field],
    }))
  }

  const handleRegister = async () => {
    setTouched({ name: true, email: true, password: true })
    const errors = validateRegistrationForm(name, email, password)
    setValidationErrors(errors)
    
    if (hasValidationErrors(errors)) {
      return
    }
    
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing Information", "Please fill in all required fields.", [{ text: "OK" }])
      return
    }
    
    setRegistrationAttempted(true)
    setIsEmailRegisterLoading(true) // Set email registration loading
    console.log("🚀 RegisterScreen: Starting registration process for:", { name: name.trim(), email: email.trim() })
    
    dispatch(
      registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password,
      }),
    )
  }

  const handleContinue = () => {
    setShowSuccessModal(false)
    console.log("➡️ RegisterScreen: Navigating to SelectInstrument screen")
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
        <View className="flex-1 px-6 py-4">
          <BackButton />
          <View className="mt-20">
            <Text
              style={titleStyle}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              CREATE YOUR ACCOUNT
            </Text>
            <Text className="text-[#003049] font-sans text-lg">Hello there, sign in to continue!</Text>
          </View>
          <View className="mt-4 gap-y-3">
            <View>
              <TextInput
                label="Name"
                value={name}
                onChangeText={(value) => handleInputChange("name", value)}
                onBlur={() => handleInputBlur("name")}
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                style={{ backgroundColor: "white" }}
                theme={inputTheme}
                error={touched.name && !!validationErrors.name}
                maxLength={50}
              />
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  {touched.name && validationErrors.name && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{validationErrors.name}</Text>
                  )}
                </View>
              </View>
            </View>
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
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                theme={inputTheme}
                error={touched.password && !!validationErrors.password}
              />
              {touched.password && validationErrors.password && (
                <Text className="text-red-500 text-sm mt-1 ml-2">{validationErrors.password}</Text>
              )}
            </View>
          </View>
          <PrimaryButton
            title="Create your account"
            onPress={handleRegister}
            loading={isEmailRegisterLoading} // Use separate loading state
            className="mt-6"
            disabled={isEmailRegisterLoading}
          />
          <View className="my-8 mt-16">
            <Text className="text-center text-black mb-4">Sign up with</Text>
            <SocialButtons />
          </View>
          <View className="flex-row justify-center mt-auto mb-4">
            <Text className="text-black text-lg">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
              <Text className="text-[#006AE6] text-lg font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        <SuccessModal
          visible={showSuccessModal}
          title="Account Created Successfully"
          message="Your account has been created successfully! Welcome aboard."
          buttonText="Get Started"
          onClose={handleContinue}
        />
        <ErrorModal
          visible={showErrorModal}
          title="Registration Failed"
          message={error || "An error occurred during registration. Please try again."}
          onClose={handleErrorClose}
        />
      </SafeAreaView>
    </PaperProvider>
  )
}