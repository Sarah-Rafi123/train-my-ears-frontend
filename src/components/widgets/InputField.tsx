import { View, Text, TextInput, type TextInputProps } from "react-native"

interface InputFieldProps extends TextInputProps {
  label: string
}

export default function InputField({ label, ...props }: InputFieldProps) {
  return (
    <View className="mb-6 relative">
      <View className="border border-[#D1D5DB] rounded-lg overflow-hidden">
        <View className="absolute -top-3 left-4 bg-white px-1 z-10">
          <Text className="text-[#003049] text-base">{label}</Text>
        </View>
        <TextInput
          className="p-4 text-lg text-[#1F2937]"
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          {...props}
        />
      </View>
    </View>
  )
}
