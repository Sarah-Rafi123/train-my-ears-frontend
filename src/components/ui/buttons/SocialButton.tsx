// Alternative implementation using OAuth directly
"use client"

import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native"
import AppleWhiteSvg from "@/src/assets/svgs/Apple_white"
import GoogleSvg from "@/src/assets/svgs/Google"
import FacebookWhiteSvg from "@/src/assets/svgs/Facebook_white"
import { useOAuth, useUser, useClerk, useAuth } from "@clerk/clerk-expo"
import { useCallback, useState, useEffect } from "react"
import { useAppDispatch } from "@/src/hooks/redux"
import { socialLoginUser } from "@/src/store/slices/authSlice"
import { useNavigation } from "@react-navigation/native"
import { OAuthStrategy } from "@clerk/types"

interface SocialButtonProps {
  strategy: "apple" | "facebook" | "google"
  title: string
  onPress?: () => void
  className?: string
  textClassName?: string
}

export default function SocialButton({
  strategy,
  title,
  className = "",
  textClassName = "",
}: SocialButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { setActive, signOut } = useClerk()
  const { user, isLoaded } = useUser()
  const { sessionId } = useAuth()
  const dispatch = useAppDispatch()
  const navigation = useNavigation()

  // Use individual OAuth hooks instead of SSO
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" })
  const { startOAuthFlow: startFacebookFlow } = useOAuth({ strategy: "oauth_facebook" })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" })

  const getOAuthFlow = () => {
    switch (strategy) {
      case "google":
        return startGoogleFlow
      case "facebook":
        return startFacebookFlow
      case "apple":
        return startAppleFlow
      default:
        throw new Error(`Unsupported strategy: ${strategy}`)
    }
  }

  const getButtonText = () => {
    if (isLoading) return "Loading..."
    switch (strategy) {
      case "apple":
        return "Continue with Apple"
      case "facebook":
        return "Continue with Facebook"
      case "google":
        return "Continue with Google"
      default:
        return title
    }
  }

  const getIcon = () => {
    switch (strategy) {
      case "apple":
        return <AppleWhiteSvg />
      case "facebook":
        return <FacebookWhiteSvg />
      case "google":
        return <GoogleSvg />
      default:
        return null
    }
  }

  const onPress = useCallback(async () => {
    try {
      setIsLoading(true)
      
      console.log("🔁 Starting OAuth flow for:", strategy)
      
      // Sign out existing session if present
      if (sessionId) {
        console.log("🔁 Signing out existing session")
        await signOut()
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const oAuthFlow = getOAuthFlow()
      
      const { createdSessionId, signIn, signUp, setActive: oAuthSetActive } = await oAuthFlow({
        redirectUrl: "frontendtrainmyears://oauth-native-callback",
      })

      console.log("🔁 OAuth flow result:", { createdSessionId, signIn: !!signIn, signUp: !!signUp })

      if (createdSessionId) {
        console.log("✅ Session created directly:", createdSessionId)
        await setActive({ session: createdSessionId })
        // Don't set loading to false here, let the useEffect handle it
      } else if (signIn?.status === "complete") {
        console.log("✅ Sign-in completed:", signIn.createdSessionId)
        await setActive({ session: signIn.createdSessionId })
      } else if (signUp?.status === "complete") {
        console.log("✅ Sign-up completed:", signUp.createdSessionId)
        await setActive({ session: signUp.createdSessionId })
      } else {
        throw new Error("OAuth flow did not complete successfully")
      }

    } catch (error: any) {
      console.error("❌ OAuth error:", error)
      setIsLoading(false)
    }
  }, [sessionId, signOut, strategy])

  // Handle successful authentication
  useEffect(() => {
    if (isLoaded && user && sessionId && isLoading) {
      (async () => {
        try {
          console.log("🔁 Processing authenticated user:", user.id)
          
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
              provider: strategy,
            })
          )

          if (socialLoginUser.fulfilled.match(result)) {
            console.log("✅ Backend login successful")
            navigation.navigate("SelectInstrument" as never)
          } else {
            throw new Error(result.payload || "Backend login failed")
          }
        } catch (error) {
          console.error("❌ User processing error:", error)
        } finally {
          setIsLoading(false)
        }
      })()
    }
  }, [isLoaded, user, sessionId, isLoading, dispatch, strategy, navigation])

  return (
    <TouchableOpacity
      className={`w-full rounded-2xl py-3 px-4 border-black flex-row items-center justify-center ${className}`}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="black" />
      ) : (
        <View className="mr-2">{getIcon()}</View>
      )}
      <Text className={`font-sans text-2xl ${textClassName}`}>{getButtonText()}</Text>
    </TouchableOpacity>
  )
}