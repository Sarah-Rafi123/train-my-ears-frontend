import { View, Text, ScrollView, SafeAreaView } from "react-native"
import BackButton from "@/src/components/ui/buttons/BackButton"
import AudioWaveform from "@/src/components/widgets/AudioWaveForm"
import NoteButton from "@/src/components/ui/buttons/NoteButton"
import ActionButton from "@/src/components/ui/buttons/ActionButton"

interface ViewSampleScreenProps {
  onBack?: () => void
  onNotePress?: (note: string) => void
  onUpgrade?: () => void
}

export default function SampleScreen({ onBack, onNotePress, onUpgrade }: ViewSampleScreenProps) {
  const noteRows = [
    ["G", "C", "D"],
    ["E", "A", "Em"],
  ]

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 pb-8">
        <BackButton onPress={onBack} />
        <View className="flex-1">
          <Text className="text-slate-800 text-xl font-semibold text-center mr-10">View Sample</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Audio Waveform */}
        <AudioWaveform />

        {/* Note Grid */}
        <View className="px-6 mb-8">
          {noteRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between mb-4">
              {row.map((note, noteIndex) => (
                <NoteButton
                  key={`${rowIndex}-${noteIndex}`}
                  note={note}
                  isSelected={note === "G"}
                  onPress={() => onNotePress?.(note)}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Upgrade Button */}
        <ActionButton title="Upgrade to level 3" onPress={onUpgrade} />
      </ScrollView>

      {/* Home indicator */}
      <View className="pb-8 pt-4">
        <View className="w-32 h-1 bg-black rounded-full self-center" />
      </View>
    </SafeAreaView>
  )
}
