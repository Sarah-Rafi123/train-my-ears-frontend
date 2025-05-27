import { View } from "react-native"

export default function AudioWaveform() {
  const waveformBars = [
    { height: 4, color: "bg-slate-800" },
    { height: 8, color: "bg-blue-500" },
    { height: 6, color: "bg-blue-500" },
    { height: 10, color: "bg-blue-500" },
    { height: 8, color: "bg-blue-500" },
    { height: 4, color: "bg-slate-800" },
    { height: 6, color: "bg-slate-800" },
    { height: 8, color: "bg-slate-800" },
    { height: 10, color: "bg-slate-800" },
    { height: 6, color: "bg-slate-800" },
    { height: 4, color: "bg-slate-800" },
    { height: 8, color: "bg-slate-800" },
  ]

  return (
    <View className="flex-row items-center justify-center space-x-1 py-8">
      {waveformBars.map((bar, index) => (
        <View key={index} className={`${bar.color} rounded-full w-1`} style={{ height: bar.height * 3 }} />
      ))}
    </View>
  )
}
