import { View, Text, ScrollView } from "react-native"
import { useState, useEffect, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import BackButton from "@/src/components/ui/buttons/BackButton"
import ModeSelector from "@/src/components/widgets/ModeSelector"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import PodiumPlayer from "@/src/components/widgets/PodiumPlayer"
import LeaderboardRow from "@/src/components/widgets/LeaderBoardRow"
import { leaderboardApi, leaderboardUtils, LeaderboardUser } from "@/src/services/leaderBoardApi"

interface LeaderboardScreenProps {
  navigation?: any // Replace with proper type from @react-navigation/native
  route?: any 
  onBack?: () => void
}

export default function LeaderboardScreen({ navigation, onBack }: LeaderboardScreenProps) {
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle level change function
  const handleLevelChange = async (level: number) => {
    try {
      console.log(`🎯 Level change requested: ${selectedLevel} → ${level}`)
      
      // Don't fetch if it's the same level
      if (level === selectedLevel) {
        console.log('Same level selected, skipping fetch')
        return
      }

      // Validate level range
      if (level < 1 || level > 4) {
        console.error(`Invalid level: ${level}. Must be between 1 and 4`)
        setError(`Invalid level: ${level}`)
        return
      }

      // Clear any existing errors
      setError(null)
      
      // Update selected level immediately for UI responsiveness
      setSelectedLevel(level)
      
      // Set loading state
      setLoading(true)
      
      console.log(`📡 Fetching leaderboard data for level ${level}`)
      
      const response = await leaderboardApi.getLeaderboard(level, 'combined')
      
      if (response.success) {
        const userData = response.data.topUsers
        // Limit to top 3 players only
        const top3Users = userData.slice(0, 3)
        setLeaderboardData(top3Users)
        console.log(`✅ Successfully loaded top ${top3Users.length} users for level ${level}`)
      } else {
        throw new Error('API returned unsuccessful response')
      }
      
    } catch (err) {
      console.error(`❌ Error fetching level ${level} data:`, err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard data'
      setError(errorMessage)
      setLeaderboardData([])
    } finally {
      setLoading(false)
      console.log(`🏁 Level change completed for level ${level}`)
    }
  }

  // Load initial data
  useEffect(() => {
    handleLevelChange(1)
  }, [])

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else if (navigation) {
      // Only use navigation if it's available
      navigation.goBack()
    } else {
      console.log("Back pressed, but navigation is not available")
    }
  }, [onBack, navigation])

  const podiumPlayers = leaderboardUtils.getPodiumPlayers(leaderboardData)
  
  const getTop3LeaderboardRows = () => {
    if (leaderboardData.length === 0) {
      return Array.from({ length: 3 }, (_, index) => ({
        place: index + 1,
        name: "User",
        streak: 0,
        accuracy: "0%"
      }))
    }
    const rows = leaderboardData.map(user => ({
      place: user.rank,
      name: user.userName,
      streak: user.currentStreak,
      accuracy: leaderboardUtils.formatAccuracy(user.accuracy)
    }))
    while (rows.length < 3) {
      rows.push({
        place: rows.length + 1,
        name: "User",
        streak: 0,
        accuracy: "0%"
      })
    }
    
    return rows.slice(0, 3) 
  }
  
  const leaderboardRows = getTop3LeaderboardRows()

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <BackButton onPress={handleBack} />
        <View className="flex-1">
          <Text className="text-[#003049] text-2xl font-semibold text-center mt-4 mr-10">
            Leaderboard
          </Text>
        </View>
      </View>

      <View className="flex-1 mt-12">
        <LevelSelector 
          selectedLevel={selectedLevel} 
          onLevelChange={handleLevelChange}
          maxLevel={4}
          loading={loading}
          disabled={loading}
        />
        
        {loading && (
          <View className="items-center py-4">
            <Text className="text-[#003049] text-base">
              Loading top 3 players...
            </Text>
          </View>
        )}
        
        {error && (
          <View className="items-center py-4 mx-6 bg-red-50 rounded-lg p-4">
            <Text className="text-red-600 text-base font-medium">
              Error
            </Text>
            <Text className="text-red-500 text-sm text-center mt-1">
              {error}
            </Text>
          </View>
        )}
        
        {!loading && (
          <View className="mx-6 bg-white rounded-2xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <View className="bg-gray-100 flex-row py-4 px-6">
              <Text className="text-[#003049] font-semibold w-14">Place</Text>
              <Text className="text-[#003049] font-semibold flex-1 ml-2 mr-2">Name</Text>
              <Text className="text-[#003049] font-semibold ml-4 text-center">Streak</Text>
              <Text className="text-[#003049] font-semibold w-24 ml-2 text-center">Accuracy</Text>
            </View>
            
            {leaderboardRows.map((player, index) => (
              <LeaderboardRow
                key={`level-${selectedLevel}-rank-${player.place}-${index}`}
                place={player.place}
                name={player.name}
                streak={player.streak}
                accuracy={player.accuracy}
              />
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}