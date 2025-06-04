import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface PasswordInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export default function PasswordInput({ label, value, onChangeText, placeholder }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className="mb-4">
      <Text className="text-[#003049] text-sm mb-1">{label}</Text>
      <View className="relative">
        <TextInput
          className="border border-gray-300 rounded-md p-3 pr-10 text-base"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!showPassword}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity className="absolute right-3 top-3" onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
