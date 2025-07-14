import { AntDesign, Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native"
import AppleWhiteSvg from "@/src/assets/svgs/Apple_white"
import GoogleSvg from "@/src/assets/svgs/Google"
import FacebookWhiteSvg from "@/src/assets/svgs/Facebook_white"
import { useSSO, useUser } from "@clerk/clerk-expo"
import { useCallback, useState } from "react"
// import { useRouter } from "expo-router";
import * as AuthSession from 'expo-auth-session'
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
  const getStrategy = () => {
    if (strategy === "facebook") {
      return "oauth_facebook";
    } else if (strategy === "google") {
      return "oauth_google";
    } else if (strategy === "apple") {
      return "oauth_apple";
    }
    return "oauth_facebook";
  };
   const buttonText = () => {
    if (isLoading) {
      return "Loading...";
    }

    if (strategy === "facebook") {
      return "Continue with Facebook";
    } else if (strategy === "google") {
      return "Continue with Google";
    } else if (strategy === "apple") {
      return "Continue with Apple";
    }
  };
const [isLoading, setIsLoading] = useState(false)
const { user } = useUser();
//  const router = useRouter();
 const { startSSOFlow } = useSSO()
 const onPress = useCallback(async () => {
    try {
      setIsLoading(true)
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: getStrategy(),
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'frontendtrainmyears' }),
      })

      // If sign in was successful, set the active session
     if (createdSessionId) {
        console.log("Session created", createdSessionId);
        setActive!({ session: createdSessionId });
        await user?.reload();
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }finally{setIsLoading(false)}
  }, [])
  
  return (
    <TouchableOpacity
      className={`w-full rounded-2xl py-3 px-4 border-black flex-row items-center justify-center ${className}`}
      onPress={onPress}      
      disabled={isLoading}
    > {isLoading ? (
        <ActivityIndicator size="small" color="black" />
      ) : (
      <View className="mr-2">{getIcon()}</View>
        )}
      <Text className={`font-sans text-2xl ${textClassName}`}>{title}</Text>
    </TouchableOpacity>
  )
}
