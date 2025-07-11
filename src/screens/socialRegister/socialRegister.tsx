import { View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"

import BackButton from "@/src/components/ui/buttons/BackButton"
import SocialButton from "@/src/components/ui/buttons/SocialButton"

export default function SocialRegisterScreen() {
  const navigation = useNavigation()

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className=" flex-1">
        <View className="px-6 py-4">
        <BackButton />
        </View>
        <View className="flex-1  justify-center items-center">
          <View className="w-full border-t border-l border-r rounded-t-[10%] border-black p-5">
            <View className="w-full items-center mb-4">
              <View className="w-24 h-2 bg-black rounded-full" />
            </View>

            <Text className="text-4xl font-sans text-[#003049] mt-8 text-center mb-8">CREATE YOUR ACCOUNT</Text>

            <SocialButton provider="apple" title="Sign up with Apple" className="bg-black" textClassName="text-white" />

            <SocialButton
              provider="google"
              title="Sign up with Google"
              className="bg-white border border-black mt-4"
              textClassName="text-black"
            />

            <SocialButton
              provider="facebook"
              title="Sign up with Facebook"
              className="bg-[#1877F2] mt-4"
              textClassName="text-white"
            />

            <TouchableOpacity
              className="w-full bg-white border border-black rounded-2xl py-4 px-4 mt-4 flex-row items-center justify-center"
              onPress={() => navigation.navigate("Register" as never)}
            >
              <Text className="text-black font-sans text-2xl">Continue with email</Text>
            </TouchableOpacity>

            <View className="mt-10 items-center">
              <Text className="text-[#003049] text-lg text-center">Already have an account?</Text>
              <TouchableOpacity className="mt-1" onPress={() => navigation.navigate("Login" as never)}>
                <Text className="text-blue-500 text-2xl font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-[#797979] font-sans text-xl text-center mt-10">
              By signing up you agree to our{"\n"}
              Terms of Service and acknowledge that you have{"\n"}
              read our Privacy Policy
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
