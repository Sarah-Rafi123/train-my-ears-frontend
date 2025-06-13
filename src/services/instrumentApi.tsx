// Types for instruments
export interface Instrument {
  id: string
  name: string
  displayName: string
  isActive: boolean
}

export interface InstrumentsResponse {
  success: boolean
  data: {
    instruments: Instrument[]
  }
}

export const instrumentsApi = {
  // Fetch all instruments
  getInstruments: async (): Promise<InstrumentsResponse> => {
    try {
      console.log("🎵 Fetching instruments from:", `${process.env.API_BASE_URL}/instruments`)

      const response = await fetch(`${process.env.API_BASE_URL}/instruments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("📊 Instruments response status:", response.status)

      const data = await response.json()
      console.log("📥 Instruments response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      // Log individual instruments for debugging
      if (data.success && data.data && data.data.instruments) {
        console.log("🎼 Available instruments:")
        data.data.instruments.forEach((instrument: Instrument) => {
          console.log(`  - ${instrument.name} (${instrument.displayName}): ${instrument.id}`)
        })
      }

      return data
    } catch (error) {
      console.error("❌ Instruments API error:", error)
      if (error instanceof Error) {
        throw new Error(`Network error: ${error.message}`)
      }
      throw new Error("Failed to fetch instruments. Please check your connection.")
    }
  },
}
