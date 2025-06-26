"use client"

import { View, Text } from "react-native"

interface FeedbackItemProps {
  id: string
  message: string
  email: string | null
  createdAt: string
}

export default function FeedbackItem({ id, message, email, createdAt }: FeedbackItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      {/* Header with date and email */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 font-medium">📅 {formatDate(createdAt)}</Text>
        </View>
{email && <Text className="text-xs text-[#003049] mt-1">📧 {email}</Text>}
          {!email && <Text className="text-xs text-gray-400 mt-1 italic">👤 Anonymous</Text>}
      </View>
      <View className="">
        <Text className="text-gray-800 text-base leading-6">{message}</Text>
      </View>
    </View>
  )
}
