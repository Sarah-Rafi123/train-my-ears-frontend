import type React from "react"
import { Modal, View, Text } from "react-native"
import { Button } from "react-native-paper"

interface GameErrorModalProps {
  visible: boolean
  title?: string
  message: string
  errorCode?: string
  onRetry?: () => void
  onClose: () => void
  showRetry?: boolean
}

export const GameErrorModal: React.FC<GameErrorModalProps> = ({
  visible,
  title = "Game Error",
  message,
  errorCode,
  onRetry,
  onClose,
  showRetry = false,
}) => {
  const getIconAndColor = () => {
    if (errorCode === "SUBSCRIPTION_REQUIRED") {
      return {  color: "#003049", bgColor: "#003049" }
    } else if (errorCode === "NETWORK_ERROR") {
      return {color: "#003049", bgColor: "#003049" }
    } else {
      return {  color: "#003049", bgColor: "##003049" }
    }
  }

  const {  color, bgColor } = getIconAndColor()

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

          {/* Error Code (if provided) */}
          {errorCode && (
            <View className="bg-gray-100 rounded-lg p-3 mb-4">
              <Text className="text-xs text-gray-600 text-center">Error Code: {errorCode}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-y-3">
            {showRetry && onRetry && (
              <Button
                mode="contained"
                onPress={onRetry}
                buttonColor={color}
                textColor="white"
                className="rounded-xl"
                contentStyle={{ paddingVertical: 8 }}
                labelStyle={{ fontSize: 16, fontWeight: "600" }}
              >
                Try Again
              </Button>
            )}

            <Button
              mode={showRetry ? "outlined" : "contained"}
              onPress={onClose}
              buttonColor={showRetry ? undefined : color}
              textColor={showRetry ? "#003049" : "white"}
              className="rounded-xl"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              {showRetry ? "Cancel" : "OK"}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}
