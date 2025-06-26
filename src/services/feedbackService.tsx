interface FeedbackRequest {
  message: string
  email?: string
}

interface FeedbackResponse {
  success: boolean
  data: {
    feedback: {
      id: string
      message: string
      email?: string
      createdAt: string
    }
  }
  message: string
}

interface FeedbackItem {
  id: string
  message: string
  email: string | null
  createdAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  itemsPerPage: number
  itemsOnCurrentPage: number
}

interface GetFeedbackResponse {
  success: boolean
  data: {
    feedback: FeedbackItem[]
    pagination: PaginationInfo
  }
}

class FeedbackService {
  private baseUrl = process.env.API_BASE_URL

  async submitFeedback(feedbackData: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      console.log("🚀 Submitting feedback...")
      console.log("📡 API URL:", `${this.baseUrl}/users/feedback`)
      console.log("📤 Request data:", {
        message: feedbackData.message,
        email: feedbackData.email || "No email provided",
      })

      const response = await fetch(`${this.baseUrl}/users/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(feedbackData),
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      const data = await response.json()
      console.log("📥 API Response:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Feedback submission failed:", data)
        throw new Error(data.error?.message || data.message || "Failed to submit feedback")
      }

      console.log("✅ Feedback submitted successfully!")
      return data
    } catch (error) {
      console.error("💥 Feedback submission error:", error)
      if (error instanceof Error) {
        throw new Error(`Network error: ${error.message}`)
      }
      throw new Error("Network error. Please check your connection and try again.")
    }
  }

  async getFeedback(page = 1, limit = 10): Promise<GetFeedbackResponse> {
    try {
      console.log("🚀 Fetching feedback...")
      console.log("📡 API URL:", `${this.baseUrl}/users/feedback?page=${page}&limit=${limit}`)

      const response = await fetch(`${this.baseUrl}/users/feedback?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      const data = await response.json()
      console.log("📥 API Response:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Feedback fetch failed:", data)
        throw new Error(data.error?.message || data.message || "Failed to fetch feedback")
      }

      console.log("✅ Feedback fetched successfully!")
      console.log("📊 Pagination info:", data.data.pagination)
      return data
    } catch (error) {
      console.error("💥 Feedback fetch error:", error)
      if (error instanceof Error) {
        throw new Error(`Network error: ${error.message}`)
      }
      throw new Error("Network error. Please check your connection and try again.")
    }
  }
}

export const feedbackService = new FeedbackService()
