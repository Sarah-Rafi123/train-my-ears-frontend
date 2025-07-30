"use client"
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native"
import AppleWhiteSvg from "@/src/assets/svgs/Apple_white"
import GoogleSvg from "@/src/assets/svgs/Google"
import FacebookWhiteSvg from "@/src/assets/svgs/Facebook_white"
import { useSSO, useUser, useClerk } from "@clerk/clerk-expo"
import { useCallback, useState, useEffect } from "react"
import * as AuthSession from "expo-auth-session"
import { useAppDispatch } from "@/src/hooks/redux"
import { socialLoginUser } from "@/src/store/slices/authSlice"
import { useNavigation } from "@react-navigation/native"
import { OAuthStrategy } from "@clerk/types" // <--- Correct import

 // will output allowed values if possible

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
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null)
  const { setActive } = useClerk()
  const { user, isLoaded } = useUser()
  const dispatch = useAppDispatch()
  const { startSSOFlow } = useSSO()
  const navigation = useNavigation()

  // Correct mapping of your local strategies to Clerk's expected OAuthStrategy values
  const clerkStrategyMap: Record<SocialButtonProps["strategy"], OAuthStrategy> = {
    google: "oauth_google",
    facebook: "oauth_facebook",  // <-- Correct (no "oauth_" prefix)
    apple: "oauth_apple",        // <-- Correct (no "oauth_" prefix)
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
      const { createdSessionId } = await startSSOFlow({
        strategy: clerkStrategyMap[strategy], // <--- Uses correct values
        redirectUrl: AuthSession.makeRedirectUri({ scheme: "frontendtrainmyears" }),
      })

      if (!createdSessionId) {
        throw new Error("No session ID returned from SSO flow")
      }

      await setActive({ session: createdSessionId })
      setPendingSessionId(createdSessionId)
    } catch (error) {
      console.error("Authentication error:", error)
      setIsLoading(false)
    }
  }, [startSSOFlow, setActive, strategy])

  useEffect(() => {
    if (
      pendingSessionId &&
      isLoaded &&
      user
    ) {
      (async () => {
        try {
          const clerkId = user.id
          const email = user.emailAddresses?.[0]?.emailAddress
          const name = user.fullName || user.firstName || "Social User"

          if (!email || !clerkId) {
            throw new Error("Required user data (email or clerkId) is missing")
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
            navigation.navigate("SelectInstrument" as never)
          } else {
            throw new Error(result.payload || "Backend social login failed")
          }
        } catch (error) {
          console.error("Social login error:", error)
        } finally {
          setIsLoading(false)
          setPendingSessionId(null)
        }
      })()
    }
  }, [pendingSessionId, isLoaded, user, dispatch, strategy, navigation])

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
