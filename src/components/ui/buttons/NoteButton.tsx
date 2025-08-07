import { TouchableOpacity, Text } from "react-native"

interface NoteButtonProps {
  note: string
  isSelected?: boolean
  onPress?: () => void
  disabled?: boolean
  state?: 'default' | 'selected' | 'correct' | 'incorrect'
  selectedChordStyle?: {
    borderColor?: string
    borderWidth?: number
    backgroundColor?: string
  }
}

export default function NoteButton({ 
  note, 
  isSelected = false, 
  onPress, 
  disabled = false,
  state = 'default',
  selectedChordStyle = {
    borderColor: 'black',
    borderWidth: 2,
    backgroundColor: '#e2e8f0'
  }
}: NoteButtonProps) {
  
  const getButtonStyle = () => {
    let baseClasses = "rounded-xl py-3 px-3 items-center justify-center max-h-[50px] min-w-[80px] shadow-sm"
    
    // Always check if selected first to maintain black border
    if (isSelected) {
      baseClasses += " border-2 border-black"
      
      // Apply result-specific backgrounds while keeping the black border
      switch (state) {
        case 'correct':
          baseClasses += " bg-green-100"
          break
        case 'incorrect':
          baseClasses += " bg-red-100"
          break
        default:
          baseClasses += " bg-[#E5EAED]"
          break
      }
    } else {
      // Not selected - NO BORDER by default
      if (disabled) {
        baseClasses += " bg-[#E5EAED80]"
      } else {
        switch (state) {
          case 'correct':
            baseClasses += " bg-green-100"
            break
          case 'incorrect':
            baseClasses += " bg-red-100"
            break
          default:
            baseClasses += " bg-[#E5EAED]"
            break
        }
      }
    }

    // Apply disabled opacity but preserve other styling
    if (disabled) {
      baseClasses += " opacity-60"
    }

    return baseClasses
  }

  const getTextStyle = () => {
    let textClasses = "text-lg text-center font-medium"
    
    if (disabled && !isSelected) {
      textClasses += " text-gray-400"
    } else {
      switch (state) {
        case 'correct':
          textClasses += " text-green-700"
          break
        case 'incorrect':
          textClasses += " text-red-700"
          break
        default:
          textClasses += isSelected ? " text-[#003049]" : " text-[#003049]"
          break
      }
    }
    
    return textClasses
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={getButtonStyle()}
      accessibilityRole="button"
      accessibilityLabel={`Note ${note}`}
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Text className={getTextStyle()}>{note}</Text>
    </TouchableOpacity>
  )
}