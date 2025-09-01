"use client"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from "react-native"
import { feedbackService } from "@/src/services/feedbackService"

interface FeedbackModalProps {
  visible: boolean
  onClose: () => void
  userEmail?: string | null
}

export default function FeedbackModal({ visible, onClose, userEmail }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please enter your feedback before submitting.")
      return
    }
    if (feedback.trim().length < 10) {
      Alert.alert("Error", "Feedback must be at least 10 characters long.")
      return
    }
    if (feedback.trim().length > 1000) {
      Alert.alert("Error", "Feedback must be less than 1000 characters.")
      return
    }

    try {
      setIsSubmitting(true)
      const feedbackData = {
        message: feedback.trim(),
        // Only include email if not anonymous and userEmail exists
        ...(!isAnonymous && userEmail && { email: userEmail }),
      }
      console.log("📝 Submitting feedback with data:", {
        message: feedbackData.message,
        email: feedbackData.email || "Anonymous feedback",
        isAnonymous: isAnonymous,
      })
      await feedbackService.submitFeedback(feedbackData)
      Alert.alert("Thank You!", "Your feedback has been submitted successfully. We appreciate your input!", [
        {
          text: "OK",
          onPress: () => {
            setFeedback("")
            setIsAnonymous(false) // Reset anonymous toggle
            onClose()
          },
        },
      ])
    } catch (error) {
      console.error("❌ Error submitting feedback:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFeedback("")
      setIsAnonymous(false) // Reset anonymous toggle
      onClose()
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
              className={`${isSubmitting ? "opacity-50" : ""}`}
            >
              <Text className="text-[#003049] text-lg font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">Share Feedback</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className={`${isSubmitting || !feedback.trim() ? "opacity-50" : ""}`}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text className="text-[#003049] text-lg font-medium">Send</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Instructions */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">We Would Love Your Feedback</Text>
              <Text className="text-gray-600 mb-4">
               Got ideas, suggestions or issues? We’re listening.
              </Text>
            </View>

            {/* Anonymous Toggle - Only show if userEmail is present */}
            {userEmail && (
              <View className="flex-row items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-medium text-gray-900 mb-1">Share feedback anonymously</Text>
                  <Text className="text-sm text-gray-600">
                    {isAnonymous
                      ? "Your email will not be included with this feedback"
                      : "Your email will be included so we can follow up if needed"}
                  </Text>
                </View>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  disabled={isSubmitting}
                  trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                  thumbColor={isAnonymous ? "#FFFFFF" : "#FFFFFF"}
                  ios_backgroundColor="#D1D5DB"
                />
              </View>
            )}

            {/* Feedback Input */}
            <View className="mb-4">
              <Text className="text-base font-medium text-gray-900 mb-2">Your Feedback *</Text>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="We would love to hear your thoughts, feature requests or bug reports."
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                className="border border-gray-300 rounded-lg p-3 text-base text-gray-900 min-h-[120px]"
                editable={!isSubmitting}
                maxLength={1000}
              />
              <View className="flex-row justify-between mt-2">
                <Text className="text-sm text-gray-500">Minimum 10 characters required</Text>
                <Text className="text-sm text-gray-500">{feedback.length}/1000</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
