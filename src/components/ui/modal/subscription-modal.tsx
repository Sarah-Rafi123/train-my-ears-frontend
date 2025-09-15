import type React from "react"
import { Modal, View, Text, TouchableOpacity } from "react-native"
import { Button } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"

interface SubscriptionModalProps {
  visible: boolean
  title?: string
  message: string
  onUpgrade: () => void
  onCancel: () => void
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  title = "Subscription Required",
  message,
  onUpgrade,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
          {/* Close button */}
          <TouchableOpacity
            onPress={onCancel}
            className="absolute top-4 right-4 z-10 w-8 h-8 items-center justify-center"
            accessibilityLabel="Close modal"
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* Premium Icon and Title */}
          <View className="items-center mb-4">
            <Text className="text-xl font-bold text-center text-[#003049]">{title}</Text>
          </View>

          {/* Message */}
          <Text className="text-gray-700 text-center mb-6 leading-6 text-base">{message}</Text>

          {/* Action Buttons */}
          <View className="gap-y-3">
            <Button
              mode="contained"
              onPress={onUpgrade}
              buttonColor="#003049"
              textColor="white"
              className="rounded-xl"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              Upgrade to Premium
            </Button>

            <Button
              mode="outlined"
              onPress={onCancel}
              textColor="#6B7280"
              className="rounded-xl"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              Maybe Later
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}
