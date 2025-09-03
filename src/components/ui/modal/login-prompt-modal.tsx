import type React from "react"
import { Modal, View, Text } from "react-native"
import { Button } from "react-native-paper"

interface LoginPromptModalProps {
  visible: boolean
  title?: string
  message: string
  onLogin: () => void
  onCancel: () => void
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  visible,
  title = "Login Required",
  message,
  onLogin,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
          {/* Login Icon and Title */}
          <View className="items-center mb-4">
            <Text className="text-xl font-bold text-center text-[#003049]">{title}</Text>
          </View>

          {/* Message */}
          <Text className="text-gray-700 text-center mb-6 leading-6 text-base">{message}</Text>

          {/* Action Buttons */}
          <View className="gap-y-3">
            <Button
              mode="contained"
              onPress={onLogin}
              buttonColor="#003049"
              textColor="white"
              className="rounded-xl"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              Login / Register
            </Button>

            <Button
              mode="outlined"
              onPress={onCancel}
              textColor="#6B7280"
              className="rounded-xl"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              Continue as Guest
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}