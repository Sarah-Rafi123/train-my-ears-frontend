import { TouchableOpacity, Text } from "react-native"

interface NoteButtonProps {
  note: string
  isSelected?: boolean
  onPress?: () => void
  disabled?: boolean
  state?: 'default' | 'selected' | 'correct' | 'incorrect'
}

export default function NoteButton({ 
  note, 
  isSelected = false, 
  onPress, 
  disabled = false,
  state = 'default'
}: NoteButtonProps) {
  
  const getButtonStyle = () => {
    if (disabled) {
      return "bg-[#E5EAED80] border-gray-300"
    }
    
    switch (state) {
      case 'correct':
        return "border-green-600"
      case 'incorrect':
        return " border-red-600"
      case 'selected':
        return "border-black"
      default:
        return isSelected 
          ? "bg-[#003049] border-[#003049]" 
          : "bg-[#E5EAED80] border-[#003049]"
    }
  }

  const getTextStyle = () => {
    if (disabled) {
      return "text-gray-400"
    }
    
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        ${getButtonStyle()}
        rounded-xl py-3 px-3 items-center justify-center
        max-h-[50px] min-w-[80px] bg-[#E5EAED] shadow-sm
      `}
      accessibilityRole="button"
      accessibilityLabel={`Note ${note}`}
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Text className={`${getTextStyle()} text-lg text-center`}>{note}</Text>
    </TouchableOpacity>
  )
}
