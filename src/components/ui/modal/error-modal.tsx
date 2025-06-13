import type React from "react"
import { Modal, View, Text } from "react-native"
import { Button } from "react-native-paper"

interface ErrorModalProps {
  visible: boolean
  title?: string
  message: string
  onClose: () => void
  type?: "error" | "warning" | "info"
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = "Error",
  message,
  onClose,
  type = "error",
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case "error":
        return { color: "#003049", bgColor: "#003049" }
      case "warning":
        return { color: "#003049", bgColor: "#003049" }
      case "info":
        return { color: "#003049", bgColor: "#003049" }
      default:
        return { color: "#003049", bgColor: "##003049" }
    }
  }

  const { color, bgColor } = getIconAndColor()

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
          {/* Icon and Title */}
          <View className="items-center mb-4">
            <Text className="text-xl font-bold text-center" style={{ color }}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <Text className="text-gray-700 text-center mb-6 leading-6 text-base">{message}</Text>

          {/* Action Button */}
          <Button
            mode="contained"
            onPress={onClose}
            buttonColor={color}
            textColor="white"
            className="rounded-xl"
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
          >
            OK
          </Button>
        </View>
      </View>
    </Modal>
  )
}
