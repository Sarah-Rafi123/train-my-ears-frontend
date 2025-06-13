import { View } from "react-native"
import NoteButton from "../ui/buttons/NoteButton"
import type { ChordOption } from "@/src/services/gameApi"

interface NoteGridProps {
  chordOptions?: ChordOption[]
  selectedChordId?: string | null
  onChordPress?: (chordId: string) => void
  disabled?: boolean
  showResult?: boolean
  correctChordId?: string
}

export default function NoteGrid({
  chordOptions = [],
  selectedChordId,
  onChordPress,
  disabled = false,
  showResult = false,
  correctChordId,
}: NoteGridProps) {
  // If no chord options provided, show default layout
  if (chordOptions.length === 0) {
    const defaultNotes = ["G", "C", "D"]
    return (
      <View className="px-6 mb-8">
        <View className="flex-row justify-center gap-x-4">
          {defaultNotes.map((note, index) => (
            <View key={index} className="flex-1 max-w-[120px]">
              <NoteButton note={note} isSelected={false} onPress={() => {}} disabled={true} />
            </View>
          ))}
        </View>
      </View>
    )
  }

  // Function to chunk array into groups of 3
  const chunkArray = (array: ChordOption[], size: number) => {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  // Split chord options into rows of 3
  const chordRows = chunkArray(chordOptions, 3)

  return (
    <View className="px-6 mb-8">
      {chordRows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-center mb-4 gap-x-4">
          {row.map((chord) => {
            let buttonState: "default" | "selected" | "correct" | "incorrect" = "default"

            if (showResult && correctChordId) {
              if (chord.id === correctChordId) {
                buttonState = "correct"
              } else if (chord.id === selectedChordId) {
                buttonState = "incorrect"
              }
            } else if (chord.id === selectedChordId) {
              buttonState = "selected"
            }

            return (
              <View key={chord.id} className="flex-1 max-w-[120px]">
                <NoteButton
                  note={chord.displayName}
                  isSelected={chord.id === selectedChordId}
                  onPress={() => onChordPress?.(chord.id)}
                  disabled={disabled}
                  state={buttonState}
                />
              </View>
            )
          })}

          {/* Add empty spacers if the row has less than 3 items to maintain spacing */}
          {row.length < 3 && (
            <>
              {Array.from({ length: 3 - row.length }).map((_, index) => (
                <View key={`spacer-${rowIndex}-${index}`} className="flex-1 max-w-[120px]" />
              ))}
            </>
          )}
        </View>
      ))}
    </View>
  )
}
