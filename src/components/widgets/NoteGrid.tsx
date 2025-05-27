import { View } from "react-native"
import NoteButton from "../ui/buttons/NoteButton"

interface NoteGridProps {
  selectedNote?: string
  onNotePress?: (note: string) => void
}

export default function NoteGrid({ selectedNote, onNotePress }: NoteGridProps) {
  const noteRows = [
    ["G", "C", "D"],
    ["E", "A", "Em"],
    ["E", "A", "Em"],
    ["E", "A", "Em"],
  ]

  return (
    <View className="px-6 mb-8">
      {noteRows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between mb-4">
          {row.map((note, noteIndex) => (
            <NoteButton
              key={`${rowIndex}-${noteIndex}`}
              note={note}
              isSelected={selectedNote === note && rowIndex === 0 && noteIndex === 0} // G is selected
              onPress={() => onNotePress?.(note)}
            />
          ))}
        </View>
      ))}
    </View>
  )
}
