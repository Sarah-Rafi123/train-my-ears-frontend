import { View } from "react-native"
import NoteButton from "../ui/buttons/NoteButton"

interface NoteGridProps {
  selectedNote?: string | null
  onNotePress?: (note: string, rowIndex: number, noteIndex: number) => void
  visibleRows?: number
}

export default function NoteGrid({ selectedNote, onNotePress, visibleRows = 1 }: NoteGridProps) {
  const noteRows = [
    ["G", "C", "D"],
    ["E", "A", "Em"],
    ["G", "C", "D"],
    ["E", "A", "Em"],
  ]

  // Only show the specified number of rows
  const displayRows = noteRows.slice(0, visibleRows)

  return (
    <View className="px-6 mb-8">
      {displayRows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between mb-4">
          {row.map((note, noteIndex) => (
            <NoteButton
              key={`${rowIndex}-${noteIndex}`}
              note={note}
              isSelected={selectedNote === `${note}-${rowIndex}-${noteIndex}`}
              onPress={() => onNotePress?.(note, rowIndex, noteIndex)}
            />
          ))}
        </View>
      ))}
    </View>
  )
}
