"use client"

import { View, Text, TouchableOpacity } from "react-native"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  itemsPerPage: number
  itemsOnCurrentPage: number
  onPrevious: () => void
  onNext: () => void
  isLoading?: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  hasNextPage,
  hasPrevPage,
  itemsPerPage,
  itemsOnCurrentPage,
  onPrevious,
  onNext,
  isLoading = false,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = (currentPage - 1) * itemsPerPage + itemsOnCurrentPage

  return (
    <View className="bg-white border-t border-gray-200 px-4 py-3">
      
      {/* Navigation Buttons */}
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={onPrevious}
          disabled={!hasPrevPage || isLoading}
          className={`flex-row items-center px-4 py-2 rounded-xl ${
            hasPrevPage && !isLoading ? "bg-[#003049]" : "bg-gray-300"
          }`}
        >
          <Text className={`text-sm font-medium ${hasPrevPage && !isLoading ? "text-white" : "text-gray-500"}`}>
            Previous
          </Text>
        </TouchableOpacity>

        {/* Page Info */}
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNext}
          disabled={!hasNextPage || isLoading}
          className={`flex-row items-center rounded-xl px-4 py-2 ${
            hasNextPage && !isLoading ? "bg-[#003049]" : "bg-gray-300"
          }`}
        >
          <Text className={`text-sm font-medium ${hasNextPage && !isLoading ? "text-white" : "text-gray-500"}`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
