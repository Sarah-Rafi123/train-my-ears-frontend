import { View, TouchableOpacity, Text } from "react-native"
import { useState } from "react"

interface LevelSelectorProps {
  selectedLevel: number
  onLevelChange: (level: number) => void
  maxLevel?: number
  disabled?: boolean
  loading?: boolean
}

export default function LevelSelector({ 
  selectedLevel, 
  onLevelChange, 
  maxLevel = 4, 
  disabled = false,
  loading = false 
}: LevelSelectorProps) {
  const [pressedLevel, setPressedLevel] = useState<number | null>(null)
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1)

  const handleLevelPress = (level: number) => {
    if (disabled || loading) return
    
    try {
      console.log(`Level selector: Changing from ${selectedLevel} to ${level}`)
      setPressedLevel(level)
      
      // Call the parent's onLevelChange function
      if (onLevelChange && typeof onLevelChange === 'function') {
        onLevelChange(level)
      }
      
      // Reset pressed state after a short delay
      setTimeout(() => {
        setPressedLevel(null)
      }, 150)
    } catch (error) {
      console.error('Error in level selection:', error)
      setPressedLevel(null)
    }
  }

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      paddingHorizontal: 24,
      marginBottom: 32
    }}>
      {levels.map((level) => {
        const isSelected = selectedLevel === level
        const isPressed = pressedLevel === level
        const isDisabled = disabled || loading
        
        return (
          <TouchableOpacity
            key={`level-${level}`}
            onPress={() => handleLevelPress(level)}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={{
              width: 64,
              height: 80,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDisabled 
                ? '#f3f4f6' 
                : isSelected 
                  ? '#ffffff' 
                  : isPressed 
                    ? '#d1d5db' 
                    : '#e5e7eb',
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? '#003049' : 'transparent',
              opacity: isDisabled ? 0.5 : 1,
              shadowColor: isSelected ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isSelected ? 0.1 : 0,
              shadowRadius: isSelected ? 2 : 0,
              elevation: isSelected ? 2 : 0,
            }}
            accessibilityRole="button"
            accessibilityLabel={`Level ${level}${isSelected ? ', selected' : ''}`}
            accessibilityState={{ 
              selected: isSelected,
              disabled: isDisabled 
            }}
          >
            <Text style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: isDisabled ? '#9ca3af' : '#003049',
              marginBottom: 4
            }}>
              {loading && isSelected ? "..." : level}
            </Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: isDisabled ? '#9ca3af' : '#003049'
            }}>
              {loading && isSelected ? "Loading" : "Level"}
            </Text>
          </TouchableOpacity>
        )
      })}
      
      {/* Loading overlay */}
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4
          }}>
            <Text style={{
              fontSize: 12,
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Loading...
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}