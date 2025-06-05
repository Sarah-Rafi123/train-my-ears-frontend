import { View, Text, ScrollView } from "react-native"

interface HistoryEntry {
  date: string
  streak: number
  accuracy: string
}

interface HistoryTableProps {
  data: HistoryEntry[]
}

export default function HistoryTable({ data }: HistoryTableProps) {
  return (
    <View className="mx-6">
      <Text className="text-[#003049] text-xl font-bold mb-4">History</Text>

      <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <View className="bg-gray-100 flex-row py-4 px-6">
          <Text className="flex-1 text-[#003049] text-lg font-semibold">Date</Text>
          <Text className="w-20 text-center text-[#003049] text-lg font-semibold">Streak</Text>
          <Text className="w-24 text-right text-[#003049] text-lg font-semibold">Accuracy</Text>
        </View>

        {/* Data Rows */}
        <ScrollView className="max-h-64">
          {data.map((entry, index) => (
            <View
              key={index}
              className={`flex-row py-4 px-6 ${index !== data.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <Text className="flex-1 text-[#003049] text-base">{entry.date}</Text>
              <Text className="w-20 text-center text-[#003049] text-base font-medium">{entry.streak}</Text>
              <Text className="w-24 text-right text-[#003049] text-base font-medium">{entry.accuracy}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}
