import React from "react"
import { TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useOAuth, useUser, useClerk, useAuth } from "@clerk/clerk-expo"
import { useCallback, useState, useEffect } from "react"
import { useAppDispatch } from "@/src/hooks/redux"
import { socialLoginUser } from "@/src/store/slices/authSlice"
import { useNavigation } from "@react-navigation/native"
import AppleSvg from "../../../assets/svgs/Apple_black"
import FacebookSvg from "../../../assets/svgs/Facebook_blue"
import GoogleSvg from "../../../assets/svgs/Google"

interface SocialIconButtonProps {
  provider: "apple" | "facebook" | "google"
  onPress?: () => void
}

export default function SocialIconButton({ provider, onPress }: SocialIconButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { setActive, signOut } = useClerk()
  const { user, isLoaded } = useUser()
  const { sessionId } = useAuth()
  const dispatch = useAppDispatch()
  const navigation = useNavigation()

  // Use individual OAuth hooks
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" })
  const { startOAuthFlow: startFacebookFlow } = useOAuth({ strategy: "oauth_facebook" })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" })

  const getOAuthFlow = () => {
    switch (provider) {
      case "google":
        return startGoogleFlow
      case "facebook":
        return startFacebookFlow
      case "apple":
        return startAppleFlow
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  // Helper function to check if error is related to email already existing with another provider
  const isEmailConflictError = (error: any): boolean => {
    const errorMessage = error?.message || error || ""
    const isServerError = errorMessage.includes("500") || errorMessage.includes("Unique constraint failed")
    const isClerkIdConflict = errorMessage.includes("clerkId") || errorMessage.includes("Unique constraint")
    return isServerError && isClerkIdConflict
  }

  // Helper function to show email conflict popup
  const showEmailConflictPopup = (email: string) => {
    Alert.alert(
      "Account Already Exists",
      `An account with the email "${email}" already exists with a different social provider. Please sign in using the original provider or use a different email address.`,
      [
        {
          text: "OK",
          style: "default",
        },
      ],
      { cancelable: true }
    )
  }

  const renderIcon = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color="#666" />
    }
    
    switch (provider) {
      case "apple":
        return <AppleSvg width={40} height={40} />
      case "facebook":
        return <FacebookSvg width={40} height={40} />
      case "google":
        return <GoogleSvg width={40} height={40} />
      default:
        return null
    }
  }

  const handlePress = useCallback(async () => {
    // If there's a custom onPress prop, use it instead of OAuth
    if (onPress) {
      onPress()
      return
    }

    // Otherwise, handle OAuth flow
    try {
      setIsLoading(true)
      
      console.log(`🔁 Starting OAuth flow for: ${provider}`)
      
      // Sign out existing session if present
      if (sessionId) {
        console.log("🔁 Signing out existing session")
        await signOut()
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const oAuthFlow = getOAuthFlow()
      
      const { createdSessionId, signIn, signUp } = await oAuthFlow({
        redirectUrl: "frontendtrainmyears://oauth-native-callback",
      })

      console.log(`🔁 ${provider} OAuth flow result:`, { 
        createdSessionId, 
        signIn: !!signIn, 
        signUp: !!signUp 
      })

      if (createdSessionId) {
        console.log(`✅ ${provider} session created directly:`, createdSessionId)
        await setActive({ session: createdSessionId })
      } else if (signIn?.status === "complete") {
        console.log(`✅ ${provider} sign-in completed:`, signIn.createdSessionId)
        await setActive({ session: signIn.createdSessionId })
      } else if (signUp?.status === "complete") {
        console.log(`✅ ${provider} sign-up completed:`, signUp.createdSessionId)
        await setActive({ session: signUp.createdSessionId })
      } else {
        throw new Error(`${provider} OAuth flow did not complete successfully`)
      }

    } catch (error: any) {
      console.error(`❌ ${provider} OAuth error:`, error)
      
      // Handle user cancellation gracefully
      if (error.message?.includes("cancelled") || error.message?.includes("dismissed")) {
        console.log(`ℹ️ User cancelled ${provider} authentication`)
      }
      
      setIsLoading(false)
    }
  }, [onPress, sessionId, signOut, provider])

  // Handle successful authentication
  useEffect(() => {
    if (isLoaded && user && sessionId && isLoading) {
      (async () => {
        try {
          console.log(`🔁 Processing authenticated user from ${provider}:`, user.id)
          
          const clerkId = user.id
          const email = user.emailAddresses?.[0]?.emailAddress
          const name = user.fullName || user.firstName || user.lastName || "Social User"

          if (!email || !clerkId) {
            throw new Error("Required user data missing")
          }

          const result = await dispatch(
            socialLoginUser({
              clerkId,
              email,
              name,
              provider,
            })
          )

          if (socialLoginUser.fulfilled.match(result)) {
            console.log(`✅ ${provider} backend login successful`)
            navigation.navigate("SelectInstrument" as never)
          } else {
            const error = result.payload || `${provider} backend login failed`
            
            // Check if this is an email conflict error
            if (isEmailConflictError(error)) {
              console.log("🚨 Email conflict detected - showing popup")
              showEmailConflictPopup(email)
            } else {
              console.error(`❌ Other ${provider} backend error:`, error)
              Alert.alert(
                "Login Error",
                "Something went wrong during login. Please try again.",
                [{ text: "OK", style: "default" }]
              )
            }
            
            throw new Error(error)
          }
        } catch (error) {
          console.error(`❌ ${provider} user processing error:`, error)
        } finally {
          setIsLoading(false)
        }
      })()
    }
  }, [isLoaded, user, sessionId, isLoading, dispatch, provider, navigation])

  return (
    <TouchableOpacity
      className="w-12 h-12 rounded-full justify-center items-center"
      onPress={handlePress}
      disabled={isLoading}
    >
      {renderIcon()}
    </TouchableOpacity>
  )
}