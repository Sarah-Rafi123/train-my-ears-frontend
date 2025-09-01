"use client"

import { useState, useEffect, useCallback } from "react"
import { chordApi, type Chord, type ChordMetadata } from "../services/chordsApi"
import { useAuth } from "../context/AuthContext"
import { useSelector } from "react-redux"
import type { RootState } from "../store/store"

interface UseChordsReturn {
  chords: Chord[]
  metadata: ChordMetadata | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  getExpectedChordCount: (level: number) => number
}

export const useChords = (level = 1): UseChordsReturn => {
  const { guitarId, pianoId } = useAuth()
  const selectedInstrumentId = useSelector((state: RootState) => state.instruments.selectedInstrumentId)
  const instruments = useSelector((state: RootState) => state.instruments.instruments)
  const [chords, setChords] = useState<Chord[]>([])
  const [metadata, setMetadata] = useState<ChordMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the selected instrument from Redux, fallback to guitarId or pianoId
  const instrumentId = selectedInstrumentId || guitarId || pianoId
  
  // Determine instrument name based on the selected instrument
  const getInstrumentName = () => {
    if (selectedInstrumentId) {
      const selectedInstrument = instruments.find(inst => inst.id === selectedInstrumentId)
      if (selectedInstrument) {
        return selectedInstrument.name
      }
    }
    // Fallback to the previous logic
    return guitarId ? "Guitar" : "Piano"
  }
  
  const instrumentName = getInstrumentName()

  const getExpectedChordCount = useCallback((level: number): number => {
    switch (level) {
      case 1:
        return 3
      case 2:
        return 6
      case 3:
        return 9
      case 4:
        return 12
      default:
        return 3
    }
  }, [])

  const fetchChords = useCallback(async () => {
    if (!instrumentId) {
      console.log("⚠️ useChords: No instrument ID available")
      setError("No instrument selected")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`🎵 useChords: Fetching chords for level ${level}`)
      const response = await chordApi.getChords(instrumentId, level, instrumentName)

      setChords(response.data.chords)
      setMetadata(response.data.metadata || null)

      console.log(`✅ useChords: Successfully loaded ${response.data.chords.length} chords`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load chords"
      console.error("❌ useChords: Error fetching chords:", errorMessage)
      setError(errorMessage)
      setChords([])
      setMetadata(null)
    } finally {
      setIsLoading(false)
    }
  }, [instrumentId, level, instrumentName, selectedInstrumentId])

  useEffect(() => {
    fetchChords()
  }, [fetchChords])

  return {
    chords,
    metadata,
    isLoading,
    error,
    refetch: fetchChords,
    getExpectedChordCount,
  }
}
