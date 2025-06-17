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

export default function LeaderboardScreen({  navigation,onBack }: LeaderboardScreenProps) {
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

  // Process data using utility functions - limited to top 3
  const podiumPlayers = leaderboardUtils.getPodiumPlayers(leaderboardData)
  
  // Custom function to get exactly 3 leaderboard rows
  const getTop3LeaderboardRows = () => {
    if (leaderboardData.length === 0) {
      // Show 3 placeholder rows when no data
      return Array.from({ length: 3 }, (_, index) => ({
        place: index + 1,
        name: "User",
        streak: 0,
        accuracy: "0%"
      }))
    }
    
    // Ensure we always show exactly 3 rows
    const rows = leaderboardData.map(user => ({
      place: user.rank,
      name: user.userName,
      streak: user.currentStreak,
      accuracy: leaderboardUtils.formatAccuracy(user.accuracy)
    }))
    
    // Fill remaining slots with placeholders if less than 3 players
    while (rows.length < 3) {
      rows.push({
        place: rows.length + 1,
        name: "User",
        streak: 0,
        accuracy: "0%"
      })
    }
    
    return rows.slice(0, 3) // Ensure exactly 3 rows
  }

  const leaderboardRows = getTop3LeaderboardRows()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16
      }}>
        <BackButton onPress={handleBack} />
        <View style={{ flex: 1 }}>
          <Text style={{
            color: '#003049',
            fontSize: 24,
            fontWeight: '600',
            textAlign: 'center',
            marginTop: 16,
            marginRight: 40
          }}>
            Leaderboard
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Mode Selector */}
        <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />

        {/* Level Selector */}
        <LevelSelector 
          selectedLevel={selectedLevel} 
          onLevelChange={handleLevelChange}
          maxLevel={4}
          loading={loading}
          disabled={loading}
        />

        {/* Loading indicator */}
        {loading && (
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Text style={{ color: '#003049', fontSize: 16 }}>
              Loading top 3 players...
            </Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={{
            alignItems: 'center',
            paddingVertical: 16,
            marginHorizontal: 24,
            backgroundColor: '#fef2f2',
            borderRadius: 8,
            padding: 16
          }}>
            <Text style={{ color: '#dc2626', fontSize: 16, fontWeight: '500' }}>
              Error
            </Text>
            <Text style={{ color: '#ef4444', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
              {error}
            </Text>
          </View>
        )}

        {/* Podium - Always show top 3 positions */}
        {!loading && !error && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 32,
            marginBottom: 32,
            paddingHorizontal: 24
          }}>
            <PodiumPlayer 
              name={podiumPlayers[0].name} 
              initials={podiumPlayers[0].initials} 
              position={2} 
            />
            <PodiumPlayer 
              name={podiumPlayers[1].name} 
              initials={podiumPlayers[1].initials} 
              position={1} 
            />
            <PodiumPlayer 
              name={podiumPlayers[2].name} 
              initials={podiumPlayers[2].initials} 
              position={3} 
            />
          </View>
        )}

        {/* Leaderboard Table - Always show exactly 3 rows */}
        {!loading && (
          <View style={{
            marginHorizontal: 24,
            backgroundColor: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1
          }}>
            {/* Table Header */}
            <View style={{
              backgroundColor: '#f3f4f6',
              flexDirection: 'row',
              paddingVertical: 16,
              paddingHorizontal: 24
            }}>
              <Text style={{ color: '#003049', fontWeight: '600', width: 48 }}>Place</Text>
              <Text style={{ color: '#003049', fontWeight: '600', flex: 1, marginLeft: 16 }}>Name</Text>
              <Text style={{ color: '#003049', fontWeight: '600', width: 64, textAlign: 'center' }}>Streak</Text>
              <Text style={{ color: '#003049', fontWeight: '600', width: 80, textAlign: 'center' }}>Accuracy</Text>
            </View>

            {/* Leaderboard Rows - Exactly 3 rows */}
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

        {/* Info message about top 3 */}
        {/* {!loading && !error && leaderboardData.length > 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 16, marginHorizontal: 24 }}>
            <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
              Showing top 3 players for Level {selectedLevel}
            </Text>
          </View>
        )} */}

        {/* Empty state - when no players at all */}
        {/* {!loading && !error && leaderboardData.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 16, marginHorizontal: 24 }}>
            <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '500', textAlign: 'center', marginBottom: 8 }}>
              No Players Yet
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
              No players found for Level {selectedLevel}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              Showing placeholder positions
            </Text>
          </View>
        )} */}

        {/* Bottom spacing */}
        {/* <View style={{ height: 32 }} /> */}
      </ScrollView>

      {/* Bottom indicator */}
      <View style={{ paddingBottom: 32, paddingTop: 16 }}>
        <View style={{
          width: 128,
          height: 4,
          backgroundColor: 'black',
          borderRadius: 2,
          alignSelf: 'center'
        }} />
      </View>
    </SafeAreaView>
  )
}