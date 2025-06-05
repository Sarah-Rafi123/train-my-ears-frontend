import { TouchableOpacity, Text } from "react-native"

interface NoteButtonProps {
  note: string
  isSelected?: boolean
  onPress?: () => void
}

export default function NoteButton({ note, isSelected = false, onPress }: NoteButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-24 h-24 rounded-xl justify-center items-center ${
        isSelected ? "bg-white border-2 border-slate-800" : "bg-gray-200"
      }`}
    >
      <Text className="text-slate-800 text-2xl font-semibold">{note}</Text>
    </TouchableOpacity>
  )
}
