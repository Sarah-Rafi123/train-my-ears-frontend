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
  async submitFeedback(feedbackData: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      console.log("🚀 Submitting feedback...")
      console.log("📡 API URL:", `https://trainmyears.softaims.com/api/users/feedback`)
      console.log("📤 Request data:", {
        message: feedbackData.message,
        email: feedbackData.email || "No email provided",
      })

      const response = await fetch(`https://trainmyears.softaims.com/api/users/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(feedbackData),
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch (jsonError) {
          // If response is not JSON, get it as text
          errorData = await response.text()
          console.warn("⚠️ Server returned non-JSON error response:", errorData)
        }
        console.error("❌ Feedback submission failed:", errorData)
        throw new Error(
          errorData?.error?.message ||
            errorData?.message ||
            `Server error: ${response.status} ${response.statusText || ""}` ||
            "Failed to submit feedback",
        )
      }

      const data = await response.json()
      console.log("📥 API Response:", JSON.stringify(data, null, 2))
      console.log("✅ Feedback submitted successfully!")
      return data
    } catch (error) {
      console.error("💥 Feedback submission error caught in service:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // This is a true network error (e.g., CORS, no internet, DNS issue)
        throw new Error(
          "Network error: Could not connect to the server. Please check your internet connection or server status.",
        )
      }
      // Re-throw other errors (e.g., from !response.ok block)
      throw error
    }
  }

  async getFeedback(page = 1, limit = 10): Promise<GetFeedbackResponse> {
    try {
      console.log("🚀 Fetching feedback...")
      console.log("📡 API URL:", `https://trainmyears.softaims.com/api/users/feedback?page=${page}&limit=${limit}`)

      const response = await fetch(`https://trainmyears.softaims.com/api/users/feedback?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch (jsonError) {
          // If response is not JSON, get it as text
          errorData = await response.text()
          console.warn("⚠️ Server returned non-JSON error response:", errorData)
        }
        console.error("❌ Feedback fetch failed:", errorData)
        throw new Error(
          errorData?.error?.message ||
            errorData?.message ||
            `Server error: ${response.status} ${response.statusText || ""}` ||
            "Failed to fetch feedback",
        )
      }

      const data = await response.json()
      console.log("📥 API Response:", JSON.stringify(data, null, 2))
      console.log("✅ Feedback fetched successfully!")
      console.log("📊 Pagination info:", data.data.pagination)
      return data
    } catch (error) {
      console.error("💥 Feedback fetch error caught in service:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // This is a true network error (e.g., CORS, no internet, DNS issue)
        throw new Error(
          "Network error: Could not connect to the server. Please check your internet connection or server status.",
        )
      }
      // Re-throw other errors (e.g., from !response.ok block)
      throw error
    }
  }
}

export const feedbackService = new FeedbackService()
