"use client"

import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import FeedbackItem from "@/src/components/widgets/FeedbackItem"
import Pagination from "@/src/components/widgets/Pagination"
import { feedbackService } from "@/src/services/feedbackService"

interface FeedbackData {
  id: string
  message: string
  email: string | null
  createdAt: string
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  itemsPerPage: number
  itemsOnCurrentPage: number
}

export default function ViewFeedbackScreen() {
  const navigation = useNavigation()
  const [feedback, setFeedback] = useState<FeedbackData[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchFeedback = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }

      console.log("📥 Fetching feedback for page:", page)
      const response = await feedbackService.getFeedback(page, 10)

      setFeedback(response.data.feedback)
      setPagination(response.data.pagination)
      setCurrentPage(page)

      console.log("✅ Feedback loaded successfully:", {
        count: response.data.feedback.length,
        page: response.data.pagination.currentPage,
        total: response.data.pagination.totalCount,
      })
    } catch (error) {
      console.error("❌ Error fetching feedback:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load feedback")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeedback(1, true)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchFeedback(currentPage, false)
  }

  const handlePrevious = () => {
    if (pagination?.hasPrevPage) {
      const prevPage = currentPage - 1
      fetchFeedback(prevPage, true)
    }
  }

  const handleNext = () => {
    if (pagination?.hasNextPage) {
      const nextPage = currentPage + 1
      fetchFeedback(nextPage, true)
    }
  }

  const handleBack = () => {
    console.log("Back pressed from ViewFeedbackScreen")
    navigation.goBack()
  }

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-6 py-4">
          <BackButton onPress={handleBack} />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading feedback...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-200">
        <BackButton onPress={handleBack} />
      </View>

      {/* Stats Header */}
      {pagination && (
        <View className="bg-white px-6 py-3 border-b border-gray-200">
          <Text className="text-sm text-gray-600 text-center">
            Total: {pagination.totalCount} 
          </Text>
        </View>
      )}

      {/* Content */}
      <View className="flex-1">
        {feedback.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-6xl mb-4">📝</Text>
            <Text className="text-xl font-semibold text-gray-900 mb-2">No Feedback Yet</Text>
            <Text className="text-gray-600 text-center">
              No user feedback has been submitted yet. Check back later!
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1 px-4 py-4"
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            >
              {feedback.map((item) => (
                <FeedbackItem
                  key={item.id}
                  id={item.id}
                  message={item.message}
                  email={item.email}
                  createdAt={item.createdAt}
                />
              ))}
            </ScrollView>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                itemsPerPage={pagination.itemsPerPage}
                itemsOnCurrentPage={pagination.itemsOnCurrentPage}
                onPrevious={handlePrevious}
                onNext={handleNext}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
