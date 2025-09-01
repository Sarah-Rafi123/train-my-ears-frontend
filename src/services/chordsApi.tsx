import { getLocalAudioPath } from '../assets/audio/audioMap'

// Types for the API responses
export interface Chord {
  id: string
  name: string
  displayName: string
  audioFileUrl?: string
  levelId: number
  instrumentId: string
  isActive: boolean
  instrument: {
    id: string
    name: string
    displayName: string
  }
  level: {
    id: number
    number: number
    name: string
  }
}

export interface ChordsByLevel {
  [levelId: string]: Chord[]
}

export interface ChordMetadata {
  requestedLevel: number
  totalChordsFound: number
  expectedChordsForLevel: number
  chordsByLevel: ChordsByLevel
  levelInfo: {
    description: string
    chordsPerLevel: number
    cumulativeSystem: boolean
  }
}

export interface GetChordsResponse {
  success: boolean
  data: {
    chords: Chord[]
    metadata?: ChordMetadata
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

// Helper function to process chords and add local audio paths
const processChordsWithLocalAudio = (chords: Chord[], instrumentId: string, levelId: number): Chord[] => {
  return chords.map(chord => {
    // Try to get local audio path first
    const localAudioPath = getLocalAudioPath(instrumentId, levelId, chord.name)
    
    return {
      ...chord,
      // Use local audio if available, fallback to original audioFileUrl
      audioFileUrl: localAudioPath || chord.audioFileUrl
    }
  })
}

export const chordApi = {
  getChords: async (instrumentId: string, levelId: number, instrumentName?: string): Promise<GetChordsResponse> => {
    try {
      console.log("🎵 Getting chords API call:", { instrumentId, levelId, instrumentName })

      // Construct URL with parameters
      const params = new URLSearchParams({
        instrumentId,
        levelId: levelId.toString(),
      })

      if (instrumentName) {
        params.append("instrumentName", instrumentName)
      }
      const url = `https://trainmyears.softaims.com/api/chords?${params.toString()}`
      console.log("🔗 Chords API URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("📊 Get chords response status:", response.status)

      const data = await response.json()
      console.log("📥 Get chords response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ Get chords failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Failed to get chords"
        throw new Error(errorMessage)
      }

      // Log chord information for debugging
      if (data.data?.chords) {
        console.log(`🎼 Retrieved ${data.data.chords.length} chords for level ${levelId}`)
        if (data.data.metadata) {
          console.log("📊 Chord metadata:", {
            expectedChords: data.data.metadata.expectedChordsForLevel,
            actualChords: data.data.metadata.totalChordsFound,
            description: data.data.metadata.levelInfo.description,
          })
        }
      }

      // Process chords to use local audio files
      if (data.data?.chords) {
        data.data.chords = processChordsWithLocalAudio(data.data.chords, instrumentId, levelId)
        console.log(`🎵 Processed ${data.data.chords.length} chords with local audio paths`)
      }

      return data
    } catch (error) {
      console.error("💥 Get chords network error:", error)
      throw error
    }
  },

  getChordsForSpecificLevel: async (instrumentId: string, levelId: number): Promise<GetChordsResponse> => {
    try {
      console.log("🎵 Getting chords for specific level:", { instrumentId, levelId })

      const params = new URLSearchParams({
        instrumentId,
        levelId: levelId.toString(),
      })

      const url = `https://trainmyears.softaims.com/api/chords/level-specific?${params.toString()}`
      console.log("🔗 Specific level chords API URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Get specific level chords failed with status:", response.status)
        const errorMessage = data.error?.message || data.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error?.message || "Failed to get chords for specific level"
        throw new Error(errorMessage)
      }

      // Process chords to use local audio files
      if (data.data?.chords) {
        data.data.chords = processChordsWithLocalAudio(data.data.chords, instrumentId, levelId)
        console.log(`🎵 Processed ${data.data.chords.length} chords with local audio paths for level ${levelId}`)
      }

      return data
    } catch (error) {
      console.error("💥 Get specific level chords network error:", error)
      throw error
    }
  },
}
